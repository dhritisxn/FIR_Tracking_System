const express = require("express");
const router = express.Router();
const FIR = require("../models/FIR");
const Counter = require("../models/Counter");
const authMiddleware = require("../middleware/auth");
const { ROLES, STAFF_ROLES } = authMiddleware;
const mongoose = require('mongoose');
const Joi = require("joi");

const isDuplicateKey = (err) => err && err.code === 11000;

// Generate the next FIR number from an atomic per-year counter, so two
// simultaneous submissions can never be handed the same number.
const generateFIRNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `FIR${currentYear}`;
  const counterId = `fir-${currentYear}`;

  // First use this year: start the counter after any FIRs numbered by the old scheme
  if (!(await Counter.exists({ _id: counterId }))) {
    const lastFIR = await FIR.findOne({
      firNumber: new RegExp(`^${prefix}\\d+$`)
    }).sort({ firNumber: -1 });
    const lastNumber = lastFIR ? parseInt(lastFIR.firNumber.slice(prefix.length), 10) || 0 : 0;
    try {
      await Counter.updateOne({ _id: counterId }, { $max: { seq: lastNumber } }, { upsert: true });
    } catch (err) {
      if (!isDuplicateKey(err)) throw err; // another request created it first
    }
  }

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${counter.seq.toString().padStart(3, '0')}`;
};

const firInputSchema = Joi.object({
  complainantName: Joi.string().trim().max(100).required(),
  phoneNumber: Joi.string().trim().max(20).required(),
  email: Joi.string().trim().email().max(254).required(),
  incidentType: Joi.string().trim().max(100).required(),
  location: Joi.string().trim().max(300).required(),
  dateTime: Joi.date().required(),
  description: Joi.string().trim().max(5000).required(),
  evidenceFiles: Joi.array().items(Joi.string().max(255)).max(20).default([])
}).unknown(true);

// Citizens may only see their own FIRs; officers and admins may see any
const canViewFIR = (user, fir) =>
  STAFF_ROLES.includes(user.role) || String(fir.userId) === String(user.id);

function assignPriority(incidentType, description) {
  const critical_keywords = ["fraud", "cybercrime", "financial scam", "hacking", "extortion", "terror"];
  incidentType = incidentType.toLowerCase();
  description = description.toLowerCase();

  if (["cybercrime", "terrorism", "murder"].includes(incidentType)) return 1;
  if (critical_keywords.some(word => description.includes(word))) return 1;
  if (["theft", "harassment", "missing"].includes(incidentType)) return 2;
  return 3;
}

// Create FIR
router.post("/register_fir", authMiddleware(), async (req, res) => {
  try {
    const { error, value } = firInputSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {
      complainantName,
      phoneNumber,
      email,
      incidentType,
      location,
      dateTime,
      description,
      evidenceFiles
    } = value;

    // Create new FIR (retrying if the number collides with an existing record)
    let fir;
    for (let attempt = 0; ; attempt++) {
      fir = new FIR({
        firNumber: await generateFIRNumber(),
        complainantName,
        phoneNumber,
        email,
        incidentType,
        location,
        dateTime,
        description,
        evidenceFiles,
        userId: req.user.id,
        status: 'submitted',
        updates: [{
          timestamp: new Date(),
          status: 'submitted',
          message: 'FIR has been successfully registered',
          officer: null
        }]
      });
      try {
        await fir.save();
        break;
      } catch (err) {
        if (!isDuplicateKey(err) || attempt >= 4) throw err;
      }
    }

    res.status(201).json({
      message: "FIR registered successfully",
      fir: {
        id: fir._id,
        firNumber: fir.firNumber,
        complainantName: fir.complainantName,
        phoneNumber: fir.phoneNumber,
        email: fir.email,
        incidentType: fir.incidentType,
        location: fir.location,
        dateTime: fir.dateTime,
        description: fir.description,
        status: fir.status,
        evidenceFiles: fir.evidenceFiles,
        createdAt: fir.createdAt,
        updatedAt: fir.updatedAt,
        updates: fir.updates
      }
    });
  } catch (error) {
    console.error('Error registering FIR:', error.message);
    res.status(500).json({ error: "Failed to register FIR. Please try again." });
  }
});

// Search FIR by ID or FIR number
router.get("/firs/:id", authMiddleware(), async (req, res) => {
  try {
    const searchId = req.params.id;

    let query = {};

    // If it looks like a FIR number (starts with FIR), search by firNumber
    if (/^FIR\d+$/.test(searchId)) {
      query = { firNumber: searchId };
    }
    // If it looks like a MongoDB ObjectId, search by _id
    else if (mongoose.Types.ObjectId.isValid(searchId)) {
      query = { _id: searchId };
    }
    else {
      return res.status(400).json({ error: "Invalid FIR ID format" });
    }

    const fir = await FIR.findOne(query);

    // Someone else's FIR gets the same 404 as a missing one, so FIR numbers can't be probed
    if (!fir || !canViewFIR(req.user, fir)) {
      return res.status(404).json({ error: "FIR not found" });
    }

    res.json({
      id: fir._id,
      firNumber: fir.firNumber,
      complainantName: fir.complainantName,
      phoneNumber: fir.phoneNumber,
      email: fir.email,
      incidentType: fir.incidentType,
      location: fir.location,
      dateTime: fir.dateTime,
      description: fir.description,
      status: fir.status,
      evidenceFiles: fir.evidenceFiles || [],
      createdAt: fir.createdAt,
      updatedAt: fir.updatedAt,
      updates: fir.updates || [],
      assignedOfficer: fir.assignedOfficer,
      assignedOfficerId: fir.assignedOfficerId
    });
  } catch (error) {
    console.error('Error searching FIR:', error.message);
    res.status(500).json({ error: "Failed to fetch FIR details" });
  }
});

// Get all FIRs for the current user or all FIRs for admin/officer
router.get("/firs", authMiddleware(), async (req, res) => {
  try {
    let query = {};

    // If user is not admin or officer, only show their own FIRs
    if (!STAFF_ROLES.includes(req.user.role)) {
      query.userId = req.user.id;
    }

    const firs = await FIR.find(query).sort({ createdAt: -1 });

    const formattedFirs = firs.map(fir => ({
      id: fir._id,
      firNumber: fir.firNumber,
      complainantName: fir.complainantName,
      phoneNumber: fir.phoneNumber,
      email: fir.email,
      incidentType: fir.incidentType,
      location: fir.location,
      dateTime: fir.dateTime,
      description: fir.description,
      status: fir.status,
      evidenceFiles: fir.evidenceFiles || [],
      createdAt: fir.createdAt,
      updatedAt: fir.updatedAt,
      updates: fir.updates || [],
      assignedOfficer: fir.assignedOfficer,
      assignedOfficerId: fir.assignedOfficerId
    }));

    res.json(formattedFirs);
  } catch (error) {
    console.error('Error fetching FIRs:', error.message);
    res.status(500).json({ error: "Failed to fetch FIRs" });
  }
});

// Assign officer to FIR
router.patch("/firs/:id/assign", authMiddleware(ROLES.ADMIN), async (req, res) => {
  try {
    const { officerId, officerName } = req.body;

    if (typeof officerId !== 'string' || typeof officerName !== 'string' || !officerId || !officerName) {
      return res.status(400).json({ error: "Officer ID and name are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(officerId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ error: "FIR not found" });
    }

    // Update the FIR with the assigned officer
    fir.assignedOfficerId = officerId;
    fir.assignedOfficer = officerName;
    fir.status = 'investigating'; // Changed from 'assigned' to match your enum
    fir.updates.push({
      timestamp: new Date(),
      status: 'investigating',
      message: `FIR assigned to Officer ${officerName}`,
      officer: officerName
    });

    await fir.save();

    res.json({
      message: "Officer assigned successfully",
      fir: {
        _id: fir._id,
        firNumber: fir.firNumber,
        email: fir.email,
        status: fir.status,
        assignedOfficer: fir.assignedOfficer,
        assignedOfficerId: fir.assignedOfficerId,
        updates: fir.updates
      }
    });
  } catch (error) {
    console.error('Error assigning officer:', error.message);
    res.status(500).json({ error: "Failed to assign officer" });
  }
});

// Update FIR status
router.patch("/firs/:id/status", authMiddleware(STAFF_ROLES), async (req, res) => {
  try {
    const { status, message } = req.body;

    if (typeof status !== 'string' || typeof message !== 'string' || !status || !message) {
      return res.status(400).json({ error: "Status and message are required" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: "Message is too long" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid FIR ID format" });
    }

    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ error: "FIR not found" });
    }

    // Update the FIR status
    fir.status = status;
    fir.updates.push({
      timestamp: new Date(),
      status: status,
      message: message,
      officer: req.user.name
    });

    await fir.save();

    res.json({
      message: "FIR status updated successfully",
      fir: {
        _id: fir._id,
        firNumber: fir.firNumber,
        email: fir.email,
        status: fir.status,
        assignedOfficer: fir.assignedOfficer,
        assignedOfficerId: fir.assignedOfficerId,
        updates: fir.updates
      }
    });
  } catch (error) {
    console.error('Error updating FIR status:', error.message);
    res.status(500).json({ error: "Failed to update FIR status" });
  }
});

module.exports = router;
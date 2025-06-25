const express = require("express");
const router = express.Router();
const FIR = require("../models/FIR");
const authMiddleware = require("../middleware/auth");
const mongoose = require('mongoose');

// Helper function to generate FIR number
const generateFIRNumber = async () => {
  const currentYear = new Date().getFullYear();
  const lastFIR = await FIR.findOne({
    firNumber: new RegExp(`^FIR${currentYear}`)
  }).sort({ firNumber: -1 });

  if (!lastFIR) {
    return `FIR${currentYear}001`;
  }

  const lastNumber = parseInt(lastFIR.firNumber.slice(-3));
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `FIR${currentYear}${newNumber}`;
};

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
    const {
      complainantName,
      phoneNumber,
      email,
      incidentType,
      location,
      dateTime,
      description,
      evidenceFiles = []
    } = req.body;

    const firNumber = await generateFIRNumber();

    // Create new FIR
    const fir = new FIR({
      firNumber,
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

    await fir.save();

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
    console.error('Error registering FIR:', error);
    res.status(500).json({ error: "Failed to register FIR. Please try again." });
  }
});

// Search FIR by ID or FIR number
router.get("/firs/:id", authMiddleware(), async (req, res) => {
  try {
    const searchId = req.params.id;
    console.log('Searching for FIR:', searchId);

    let query = {};
    
    // If it looks like a FIR number (starts with FIR), search by firNumber
    if (searchId.startsWith('FIR')) {
      console.log('Searching by FIR number');
      query = { firNumber: searchId };
    } 
    // If it looks like a MongoDB ObjectId, search by _id
    else if (mongoose.Types.ObjectId.isValid(searchId)) {
      console.log('Searching by ObjectId');
      query = { _id: searchId };
    }
    else {
      console.log('Invalid search ID format');
      return res.status(400).json({ error: "Invalid FIR ID format" });
    }

    console.log('Using query:', query);
    const fir = await FIR.findOne(query);

    if (!fir) {
      console.log('FIR not found');
      // Debug: List all FIRs in the database
      const allFirs = await FIR.find({});
      console.log('All FIRs in database:', allFirs.map(f => ({
        id: f._id,
        firNumber: f.firNumber,
        complainantName: f.complainantName
      })));
      return res.status(404).json({ error: "FIR not found" });
    }

    console.log('FIR found:', {
      id: fir._id,
      firNumber: fir.firNumber,
      status: fir.status
    });

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
    console.error('Error searching FIR:', error);
    res.status(500).json({ error: "Failed to fetch FIR details" });
  }
});

// Get all FIRs for the current user or all FIRs for admin/officer
router.get("/firs", authMiddleware(), async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin or officer, only show their own FIRs
    if (req.user.role === 'citizen') {
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

    console.log(`Found ${formattedFirs.length} FIRs for user ${req.user.id} (${req.user.role})`);
    res.json(formattedFirs);
  } catch (error) {
    console.error('Error fetching FIRs:', error);
    res.status(500).json({ error: "Failed to fetch FIRs" });
  }
});

// Assign officer to FIR
router.patch("/firs/:id/assign", authMiddleware(), async (req, res) => {
  try {
    console.log('Assigning officer to FIR:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User role:', req.user.role);
    
    const { officerId, officerName } = req.body;
    
    if (!officerId || !officerName) {
      console.log('Missing required fields:', { officerId, officerName });
      return res.status(400).json({ error: "Officer ID and name are required" });
    }
    
    // Verify that the user is an admin
    if (req.user.role !== 'admin') {
      console.log('Unauthorized: User role is not admin');
      return res.status(403).json({ error: "Only admins can assign officers to FIRs" });
    }

    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      console.log('FIR not found with ID:', req.params.id);
      return res.status(404).json({ error: "FIR not found" });
    }

    console.log('Found FIR:', {
      id: fir._id,
      firNumber: fir.firNumber,
      currentStatus: fir.status,
      currentOfficer: fir.assignedOfficer
    });

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

    console.log('Saving updated FIR with new officer assignment');
    await fir.save();
    console.log('FIR updated successfully');

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
    console.error('Error assigning officer:', error);
    res.status(500).json({ error: "Failed to assign officer: " + error.message });
  }
});

// Update FIR status
router.patch("/firs/:id/status", authMiddleware(), async (req, res) => {
  try {
    console.log('Updating FIR status:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User role:', req.user.role);
    
    const { status, message } = req.body;
    
    if (!status || !message) {
      console.log('Missing required fields:', { status, message });
      return res.status(400).json({ error: "Status and message are required" });
    }

    // Verify that the user is an admin or officer
    if (!['admin', 'officer'].includes(req.user.role)) {
      console.log('Unauthorized: User role is not admin/officer');
      return res.status(403).json({ error: "Only admins and officers can update FIR status" });
    }

    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      console.log('FIR not found with ID:', req.params.id);
      return res.status(404).json({ error: "FIR not found" });
    }

    console.log('Found FIR:', {
      id: fir._id,
      firNumber: fir.firNumber,
      currentStatus: fir.status
    });

    // Update the FIR status
    fir.status = status;
    fir.updates.push({
      timestamp: new Date(),
      status: status,
      message: message,
      officer: req.user.name
    });

    console.log('Saving updated FIR with new status');
    await fir.save();
    console.log('FIR updated successfully');

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
    console.error('Error updating FIR status:', error);
    res.status(500).json({ error: "Failed to update FIR status: " + error.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const FIR = require("../models/FIR");
const User = require("../models/User");
const auth = require("../middleware/auth");
const Joi = require("joi");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

function getPriorityFromML(description) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["ml_model/predict.py", description]);
    let result = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`Python error: ${data}`);
    });

    python.on("close", () => {
      resolve(parseInt(result.trim()));
    });
  });
}
function getTranscriptionFromAudio(audioPath) {
    return new Promise((resolve, reject) => {
      const python = spawn("python", ["ml_model/predict.py", "--audio", audioPath]);
      let result = "";
      python.stdout.on("data", (data) => {
        result += data.toString();
      });
      python.stderr.on("data", (data) => {
        console.error(Python error: ${data});
      });
      python.on("close", () => {
        resolve(result.trim());
      });
    });
  }
const firSchema = Joi.object({
  user_id: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required()
});

function validateFIRInput(req, res, next) {
  const { error } = firSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}

router.use(auth("police"));
router.post("/register_fir_audio", upload.single("audio"), async (req, res) => {
  const { user_id, location } = req.body;
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: "Audio file is required" });
  }
  try {
    // Get transcription from audio
    const transcribedText = await getTranscriptionFromAudio(audioFile.path);
    // Predict priority
    const priority = await getPriorityFromML(transcribedText);
    const newFIR = new FIR({ user_id, description: transcribedText, location, priority });
    await newFIR.save();
    res.status(201).json({ message: "FIR Registered via audio", fir: newFIR, transcription: transcribedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering FIR from audio" });
  }
});

router.post("/register_fir", validateFIRInput, async (req, res) => {
  const { user_id, description, location } = req.body;
  try {
    const priority = await getPriorityFromML(description);
    const newFIR = new FIR({ user_id, description, location, priority });
    await newFIR.save();
    res.status(201).json({ message: "FIR Registered", fir: newFIR });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering FIR" });
  }
});

router.get("/firs", async (req, res) => {
  try {
    const firs = await FIR.find().sort({ priority: 1 });
    res.json(firs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching police FIRs" });
  }
});

router.get("/priority_alerts", async (req, res) => {
  try {
    const alerts = await FIR.find({ priority: 1 }).sort({ date_filed: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching alerts" });
  }
});

router.put("/update_fir/:id", async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }
  try {
    const updatedFIR = await FIR.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedFIR) {
      return res.status(404).json({ error: "FIR not found." });
    }
    res.json({ message: "FIR status updated", fir: updatedFIR });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating FIR status" });
  }
});

router.get("/fir/:id", async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);
    if (!fir) return res.status(404).json({ error: "FIR not found." });
    res.json(fir);
  } catch (err) {
    res.status(500).json({ error: "Error fetching FIR by ID" });
  }
});

router.delete("/delete_fir/:id", async (req, res) => {
  try {
    const deleted = await FIR.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "FIR not found." });
    res.json({ message: "FIR deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error deleting FIR" });
  }
});

router.get("/firs_by_status/:status", async (req, res) => {
  try {
    const firs = await FIR.find({ status: req.params.status });
    res.json(firs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching FIRs by status" });
  }
});

router.get("/firs_by_priority/:priority", async (req, res) => {
  try {
    const firs = await FIR.find({ priority: parseInt(req.params.priority) });
    res.json(firs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching FIRs by priority" });
  }
});

// Get all officers (admin only)
router.get("/officers", async (req, res) => {
  try {
    console.log('Request to fetch officers from:', req.user?.email);
    
    // Verify admin role
    if (req.user?.role !== 'admin') {
      console.log('Access denied - not admin:', req.user?.role);
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Fetch officers
    const officers = await User.find(
      { role: 'officer' },
      { 
        password: 0,  // Exclude password
        __v: 0       // Exclude version key
      }
    );

    console.log(`Found ${officers.length} officers`);
    res.json(officers);
  } catch (error) {
    console.error('Error fetching officers:', error);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

module.exports = router;

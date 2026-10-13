const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const FIR = require("../models/FIR");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { ROLES, STAFF_ROLES } = auth;
const Joi = require("joi");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Audio uploads: audio types only, 10 MB max, random names, kept in the OS temp
// directory (never a publicly served folder) and deleted once processed.
const ALLOWED_AUDIO_TYPES = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/webm": ".webm",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac"
};
const UPLOAD_DIR = path.join(os.tmpdir(), "fir-audio-uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, crypto.randomUUID() + ALLOWED_AUDIO_TYPES[file.mimetype])
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AUDIO_TYPES[file.mimetype]) return cb(null, true);
    const err = new Error("Only audio files (mp3, wav, webm, ogg, m4a, aac) are allowed");
    err.status = 400;
    cb(err);
  }
});

// Run the upload and turn multer errors (bad type, too large) into 400 responses
function uploadAudio(req, res, next) {
  upload.single("audio")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "Audio file must be 10 MB or smaller" : err.message;
    res.status(err instanceof multer.MulterError || err.status === 400 ? 400 : 500).json({ error: message });
  });
}

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
        console.error(`Python error: ${data}`);
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

// Every police route is for officers and admins only
router.use(auth(STAFF_ROLES));
router.post("/register_fir_audio", uploadAudio, async (req, res) => {
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
    console.error("Error registering FIR from audio:", err.message);
    res.status(500).json({ error: "Error registering FIR from audio" });
  } finally {
    fs.promises.unlink(audioFile.path).catch(() => {});
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
router.get("/officers", auth(ROLES.ADMIN), async (req, res) => {
  try {

    // Fetch officers
    const officers = await User.find(
      { role: 'officer' },
      {
        password: 0,  // Exclude password
        __v: 0       // Exclude version key
      }
    );

    res.json(officers);
  } catch (error) {
    console.error('Error fetching officers:', error.message);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

module.exports = router;

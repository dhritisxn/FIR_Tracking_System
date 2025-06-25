const express = require("express");
const router = express.Router();
const Joi = require("joi");
const FIR = require("../models/FIR");
const auth = require("../middleware/auth");

const firSchema = Joi.object({
  user_id: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required()
});

router.post("/register_fir", auth("user"), (req, res, next) => {
  const { error } = firSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}, async (req, res) => {
  try {
    const { user_id, description, location } = req.body;
    const fir = new FIR({ user_id, description, location });
    await fir.save();
    res.status(201).json({ message: "FIR registered", fir });
  } catch (err) {
    res.status(500).json({ error: "Error registering FIR" });
  }
});

router.get("/my_firs", auth("user"), async (req, res) => {
  try {
    const firs = await FIR.find({ user_id: req.user.id });
    res.json(firs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching your FIRs" });
  }
});

router.get("/my_fir/:id", auth("user"), async (req, res) => {
  try {
    const fir = await FIR.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!fir) return res.status(404).json({ error: "FIR not found or not yours." });
    res.json(fir);
  } catch (err) {
    res.status(500).json({ error: "Error fetching FIR" });
  }
});

module.exports = router;

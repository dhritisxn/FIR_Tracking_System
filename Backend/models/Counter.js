const mongoose = require("mongoose");

// Atomic sequence counters, e.g. { _id: "fir-2026", seq: 42 }
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model("Counter", CounterSchema);

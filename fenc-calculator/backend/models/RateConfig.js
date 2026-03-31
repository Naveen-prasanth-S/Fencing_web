const mongoose = require("mongoose");

const rateConfigSchema = new mongoose.Schema({
  height: {
    type: Number,
    required: true,
    unique: true,
  },
  feetRate: {
    type: Number,
    required: true,
  },
  stoneRate: {
    type: Number,
    required: true,
  },
  supportStoneRate: {
    type: Number,
    required: true,
  },
  labourRate: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("RateConfig", rateConfigSchema);
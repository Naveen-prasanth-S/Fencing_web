const RateConfig = require("../models/RateConfig");

const getRatesByHeight = async (req, res) => {
  try {
    const { height } = req.params;

    const rate = await RateConfig.findOne({ height: Number(height) });

    if (!rate) {
      return res.status(404).json({ message: "Rate not found for this height" });
    }

    res.json(rate);
  } catch (error) {
    console.error("Error fetching rate:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const calculateFence = async (req, res) => {
  try {
    const {
      noOfFeet,
      stonePerFeet,
      supportStonePerFeet,
      noOfBarbedWireLines,
      height,
    } = req.body;

    const rate = await RateConfig.findOne({ height: Number(height) });

    if (!rate) {
      return res.status(404).json({ message: "Rate not found for this height" });
    }

    const feet = Number(noOfFeet);
    const stoneSpacing = Number(stonePerFeet);
    const supportSpacing = Number(supportStonePerFeet);
    const wireLines = Number(noOfBarbedWireLines);

    if (!feet || !stoneSpacing || !supportSpacing || !wireLines || !height) {
      return res.status(400).json({ message: "Please provide all input values" });
    }

    // Excel formulas you gave
    const noOfStone = feet / stoneSpacing;
    const supportStone = (noOfStone / supportSpacing) * 2;
    const barbedWireWeight = Math.round((feet * wireLines) / 33);
    const kattuKambi = feet * 0.015;
    const labour = feet;

    // amounts
    const feetAmount = feet * rate.feetRate;
    const stoneAmount = noOfStone * rate.stoneRate;
    const supportStoneAmount = supportStone * rate.supportStoneRate;

    // as per your formula:
    // rate = C10 * 5
    // amount = C10 * C5 * 5
    const barbedWireRate = wireLines * 5;
    const barbedWireAmount = wireLines * feet * 5;

    const labourAmount = labour * rate.labourRate;

    const totalAmount =
      feetAmount +
      stoneAmount +
      supportStoneAmount +
      barbedWireAmount +
      labourAmount;

    res.json({
      rates: {
        ...rate.toObject(),
        barbedWireRate,
      },
      calculations: {
        noOfStone,
        supportStone,
        barbedWireWeight,
        kattuKambi,
        labour,
        feetAmount,
        stoneAmount,
        supportStoneAmount,
        barbedWireRate,
        barbedWireAmount,
        labourAmount,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getRatesByHeight,
  calculateFence,
};
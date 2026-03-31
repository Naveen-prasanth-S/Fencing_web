const express = require("express");
const router = express.Router();

const {
  getRatesByHeight,
  calculateFence,
} = require("../controllers/calculatorController");

router.get("/rates/:height", getRatesByHeight);
router.post("/calculate", calculateFence);

module.exports = router;
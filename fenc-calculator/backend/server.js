const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const calculatorRoutes = require("./routes/calculatorRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", calculatorRoutes);

app.get("/", (req, res) => {
  res.send("Backend + MongoDB running ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
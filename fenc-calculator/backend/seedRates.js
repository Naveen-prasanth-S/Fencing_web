const mongoose = require("mongoose");
require("dotenv").config();

const RateConfig = require("./models/RateConfig");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await RateConfig.deleteMany();

    await RateConfig.insertMany([
      {
        height: 4,
        feetRate: 55,
        stoneRate: 380,
        supportStoneRate: 380,
        labourRate: 16,
      },
      {
        height: 5,
        feetRate: 55,
        stoneRate: 380,
        supportStoneRate: 380,
        labourRate: 16,
      },
      {
        height: 6,
        feetRate: 55,
        stoneRate: 370,
        supportStoneRate: 370,
        labourRate: 20,
      },
    ]);

    console.log("Rate data inserted successfully ✅");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error ❌", err);
    process.exit(1);
  }
}

seedData();
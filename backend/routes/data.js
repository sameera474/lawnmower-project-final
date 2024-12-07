const express = require("express");
const LawnData = require("../models/LawnData");

const router = express.Router();

// Fetch real-time data
router.get("/realtime-data", async (req, res) => {
  try {
    const data = await LawnData.find().sort({ Timestamp: -1 }).limit(50);
    res.json({ RealTimeLawnMowerData: data.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch historical data
router.get("/history-data", async (req, res) => {
  try {
    const history = await LawnData.find().sort({ Timestamp: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate fake data
router.post("/generate-fake-data", async (req, res) => {
  try {
    const fakeData = {
      Timestamp: new Date(),
      sD: {
        pos: "37.7749,-122.4194,0.5",
        prox: [
          { id: "fc", d: Math.random() * 2 },
          { id: "fl", d: Math.random() * 2 },
          { id: "fr", d: Math.random() * 2 },
        ],
        obj: [{ t: "rock", c: 90, p: [37.7749, -122.4194], d: 5 }],
        blade: { sp: 3000, cur: 5, eng: true },
        bat: {
          cap: Math.random() * 100,
          volt: 24,
          temp: 30,
          power: 200,
          stat: "Discharging",
        },
        env: { temp: 25, hum: 70, lux: 800 },
        imu: { p: 1, r: 2, y: 3 },
        lidar: [
          { a: 0, d: Math.random() * 10 },
          { a: 45, d: Math.random() * 10 },
        ],
        error: { d: null },
      },
    };
    const newData = new LawnData(fakeData);
    await newData.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

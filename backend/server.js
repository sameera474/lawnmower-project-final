process.emitWarning = () => {}; // Suppresses all warnings

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Use bcryptjs instead of bcrypt

const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Assuming you have a User model
const LawnData = require("./models/LawnData"); // Assuming you have LawnData model
const Settings = require("./models/Settings"); // Assuming you have Settings model
const authRoutes = require("./routes/auth"); // Import authentication routes
const dataRoutes = require("./routes/data"); // Import data routes
require("dotenv").config();

// Ensure critical environment variables are set
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

const app = express();

// Dynamic CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*", // Allow multiple origins or "*" for all origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply the CORS middleware

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const mongooseConnection = mongoose.connection;
    if (mongooseConnection.readyState === 1) {
      res.status(200).send("Database connected!");
    } else {
      res.status(500).send("Database not connected!");
    }
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Use data routes
app.use("/api", dataRoutes);

// Fake data generation
let lastBatteryLevel = 100; // Initial battery level
let lastPowerUsage = 50; // Initial power usage
let lastTemperature = 25; // Initial ambient temperature
let lastHumidity = 50; // Initial humidity
let totalAreaCovered = 0; // Area covered by the machine

const generateFakeData = async () => {
  // Simulate proximity and obstacle detection
  const proximityFront = Math.random() * 2;
  const proximityRear = Math.random() * 2;
  const obstacleDetected = proximityFront < 0.5 || proximityRear < 0.5;
  const errorState = obstacleDetected ? "E01: Obstacle Detected" : null;

  // Gradually drain battery and simulate recharge
  if (lastBatteryLevel > 0) {
    lastBatteryLevel -= Math.random() * 0.5 + 0.2; // Gradual drain
  } else {
    lastBatteryLevel = 100; // Recharge when empty
    totalAreaCovered = 0; // Reset area covered
  }

  // Simulate power usage variation
  lastPowerUsage = Math.max(30, lastPowerUsage + (Math.random() * 10 - 5)); // Fluctuates between 30 and higher

  // Simulate ambient environment
  lastTemperature += Math.random() * 2 - 1; // Small fluctuation
  lastHumidity += Math.random() * 5 - 2.5; // Small fluctuation

  // Cap values to realistic limits
  lastTemperature = Math.max(15, Math.min(35, lastTemperature));
  lastHumidity = Math.max(20, Math.min(100, lastHumidity));

  // Add new fake data
  const fakeData = {
    Timestamp: new Date(),
    sD: {
      pos: "37.7749,-122.4194,0.5",
      prox: [
        { id: "fc", d: parseFloat(proximityFront.toFixed(2)) },
        { id: "fl", d: Math.random() * 2 },
        { id: "fr", d: Math.random() * 2 },
      ],
      obj: [
        {
          t: "tree",
          c: Math.floor(Math.random() * 100),
          p: [37.7349, -122.4194],
          d: Math.random() * 10,
        },
        {
          t: "rock",
          c: Math.floor(Math.random() * 100),
          p: [37.7549, -122.4194],
          d: Math.random() * 10,
        },
      ],
      blade: {
        sp: Math.floor(Math.random() * 500 + 3000),
        cur: Math.random() * 10,
        eng: Math.random() > 0.5,
      },
      bat: {
        cap: parseFloat(lastBatteryLevel.toFixed(1)),
        volt: Math.random() * 5 + 20,
        temp: Math.random() * 40,
        power: parseFloat(lastPowerUsage.toFixed(1)),
        stat: lastBatteryLevel > 10 ? "d" : "c",
      },
      env: {
        temp: parseFloat(lastTemperature.toFixed(1)),
        hum: parseFloat(lastHumidity.toFixed(1)),
        lux: Math.random() * 1000,
      },
      imu: {
        p: Math.random() * 180 - 90,
        r: Math.random() * 180 - 90,
        y: Math.random() * 360,
      },
      lidar: [
        { a: 0, d: Math.random() * 10 },
        { a: 45, d: Math.random() * 10 },
        { a: 90, d: Math.random() * 10 },
      ],
      error: {
        d: errorState,
      },
    },
  };

  await LawnData.create(fakeData);
};

// API Routes
app.get("/api/realtime-data", async (req, res) => {
  try {
    const data = await LawnData.find().sort({ Timestamp: -1 }).limit(50);
    res.json({ RealTimeLawnMowerData: data.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/history-data", async (req, res) => {
  try {
    const history = await LawnData.find().sort({ Timestamp: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/delete-all-history", async (req, res) => {
  try {
    await LawnData.deleteMany({});
    res.status(200).json({ message: "All history deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/delete-history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await LawnData.findByIdAndDelete(id);
    res.status(200).json({ message: "Entry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule fake data generation
setInterval(generateFakeData, 5000);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

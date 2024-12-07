const mongoose = require("mongoose");

const lawnDataSchema = new mongoose.Schema({
  Timestamp: { type: Date, default: Date.now },
  sD: {
    pos: { type: String, required: true }, // GPS coordinates: "latitude,longitude,altitude"
    prox: [
      {
        id: { type: String, required: true }, // Sensor ID: "fc", "fl", "fr"
        d: { type: Number, required: true }, // Distance to object (meters)
      },
    ],
    obj: [
      {
        t: { type: String, required: true }, // Object type
        c: { type: Number, required: true }, // Confidence level (0-100)
        p: [{ type: Number, required: true }], // Object position [latitude, longitude]
        d: { type: Number, required: true }, // Additional data (e.g., grass length in cm)
      },
    ],
    blade: {
      sp: { type: Number, required: true }, // Blade speed (RPM)
      cur: { type: Number, required: true }, // Motor current (amps)
      eng: { type: Boolean, required: true }, // Engagement status
    },
    bat: {
      cap: { type: Number, required: true }, // Battery capacity (%)
      volt: { type: Number, required: true }, // Battery voltage (V)
      temp: { type: Number, required: true }, // Battery temperature (°C)
      power: { type: Number, required: true }, // Power usage (W)
      stat: { type: String, required: true }, // Battery status ("c" or "d")
    },
    env: {
      temp: { type: Number, required: true }, // Ambient temperature (°C)
      hum: { type: Number, required: true }, // Humidity (%)
      lux: { type: Number, required: true }, // Light intensity (lux)
    },
    imu: {
      p: { type: Number, required: true }, // Pitch angle (degrees)
      r: { type: Number, required: true }, // Roll angle (degrees)
      y: { type: Number, required: true }, // Yaw angle (degrees)
    },
    lidar: [
      {
        a: { type: Number, required: true }, // Angle (degrees, 0-360)
        d: { type: Number, required: true }, // Distance to object (meters)
      },
    ],
    error: {
      d: { type: String, default: null }, // Error name, null if no error
    },
  },
});

module.exports = mongoose.model("LawnData", lawnDataSchema);

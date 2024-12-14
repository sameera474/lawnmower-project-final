import React, { useEffect, useState, useCallback, useRef } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Grid,
  Button,
  Snackbar,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { Line, Radar } from "react-chartjs-2";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import RadarIcon from "@mui/icons-material/Radar";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SpeedIcon from "@mui/icons-material/Speed";
import ReactSpeedometer from "react-d3-speedometer";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const Dashboard = () => {
  const [lawnData, setLawnData] = useState([]);
  const [latestMetrics, setLatestMetrics] = useState({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [batteryWarning, setBatteryWarning] = useState(false);
  const intervalRef = useRef(null);

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/realtime-data`);
      const data = response.data.RealTimeLawnMowerData;
      setLawnData(data);
      const latest = data[data.length - 1]?.sD || {};
      setLatestMetrics(latest);

      // Check battery level and show warning if below 20%
      setBatteryWarning(latest.bat?.cap < 20);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }, []);

  // Generate fake data
  const generateData = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/generate-fake-data`);
      await fetchData();
      alert("Fake data generated successfully!");
    } catch (error) {
      console.error("Error generating data:", error.message);
      alert("Failed to generate fake data!");
    }
  };

  // Stop generating fake data
  const stopGenerating = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsGenerating(false);
    }
  };

  // Start generating fake data
  const startGenerating = () => {
    if (!intervalRef.current) {
      setIsGenerating(true);
      fetchData();
      intervalRef.current = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    }
  };

  // Guide to charging dock
  const guideToChargingDock = () => {
    setIsCharging(true);
    setTimeout(() => {
      setIsCharging(false);
      setSnackbarOpen(true);
    }, 3000);
  };

  // Chart data helper function
  const chartData = (label, dataKey, color) => ({
    labels: lawnData.map((item) =>
      new Date(item.Timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label,
        data: lawnData.map((item) => item.sD?.bat?.[dataKey] || 0),
        borderColor: color,
        backgroundColor: `${color}33`,
        fill: true,
      },
    ],
  });
  // LiDAR Chart Data
  const lidarChartData = {
    labels: latestMetrics.lidar?.map((item) => `${item.a}°`) || [],
    datasets: [
      {
        label: "LiDAR Distance (m)",
        data: latestMetrics.lidar?.map((item) => item.d) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        fill: true,
      },
    ],
  };

  // IMU Chart Data
  const imuChartData = {
    labels: ["Pitch (°)", "Roll (°)", "Yaw (°)"],
    datasets: [
      {
        label: "IMU Data",
        data: [
          latestMetrics.imu?.p || 0,
          latestMetrics.imu?.r || 0,
          latestMetrics.imu?.y || 0,
        ],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        fill: true,
      },
    ],
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    startGenerating();
  };

  useEffect(() => {
    startGenerating();
    return () => {
      stopGenerating();
    };
  }, [fetchData]);

  return (
    <Box
      sx={{
        padding: 3,
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
        color: isDarkMode ? "#b0bec5" : "#000000",
      }}
    >
      <Typography variant="h4" gutterBottom>
        LawnMower Dashboard
      </Typography>

      {/* Battery Warning */}
      {batteryWarning && !isCharging && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={guideToChargingDock}>
              Guide to Dock
            </Button>
          }
        >
          Battery level is below 20%. Please recharge.
        </Alert>
      )}

      {/* Buttons */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  color="secondary"
                />
              }
              label="Dark Mode"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={generateData}
              disabled={isCharging}
            >
              Generate Data
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/history")}
              disabled={isCharging}
            >
              Go to History
            </Button>
            {isGenerating && !isCharging ? (
              <Button
                variant="contained"
                color="error"
                onClick={stopGenerating}
              >
                Stop Machine
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={startGenerating}
              >
                Start Machine
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Metrics Cards */}
      <Grid container spacing={4} sx={{ marginTop: 2 }}>
        {/* Battery Level */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BatteryChargingFullIcon fontSize="large" />
                <Typography variant="h6">Battery Level</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={latestMetrics.bat?.cap || 0}
                sx={{ height: 10, marginTop: 1 }}
              />
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {latestMetrics.bat?.cap || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Blade Speed */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                <SpeedIcon fontSize="large" />
                <Typography variant="h6" sx={{ marginTop: 1 }}>
                  Blade Speed
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ReactSpeedometer
                  maxValue={5000}
                  value={latestMetrics.blade?.sp || 0}
                  needleColor="red"
                  startColor="green"
                  segments={5}
                  endColor="blue"
                  height={200}
                  width={250}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{ textAlign: "center", marginTop: 2 }}
              >
                {latestMetrics.blade?.sp || 0} RPM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ThermostatIcon fontSize="large" />
                <Typography variant="h6">Temperature</Typography>
              </Box>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {latestMetrics.env?.temp || "N/A"}°C
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Humidity */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WaterDropIcon fontSize="large" />
                <Typography variant="h6">Humidity</Typography>
              </Box>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {latestMetrics.env?.hum || "N/A"}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Proximity Sensors */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RadarIcon fontSize="large" />
                <Typography variant="h6">Proximity Sensors</Typography>
              </Box>
              {latestMetrics.prox?.length ? (
                latestMetrics.prox.map((sensor, index) => (
                  <Typography
                    key={index}
                    sx={{
                      color: sensor.d < 0.5 ? "red" : "inherit",
                    }}
                  >
                    {sensor.id.toUpperCase()}: {sensor.d.toFixed(2)} m
                  </Typography>
                ))
              ) : (
                <Typography>No Sensor Data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Obstacle Detection */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon fontSize="large" />
                <Typography variant="h6">Obstacle Detection</Typography>
              </Box>
              {latestMetrics.obj?.length ? (
                latestMetrics.obj.map((obj, index) => (
                  <Typography key={index}>
                    Type: {obj.t}, Confidence: {obj.c}%, Position:{" "}
                    {obj.p.join(", ")}
                  </Typography>
                ))
              ) : (
                <Typography>No Obstacles Detected</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* LiDAR Data */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">LiDAR Data</Typography>
              <Radar data={lidarChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* IMU Data */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">IMU Data</Typography>
              <Radar data={imuChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* AI Camera */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CameraAltIcon fontSize="large" />
                <Typography variant="h6">AI Camera</Typography>
              </Box>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                {latestMetrics.obj?.length
                  ? latestMetrics.obj
                      .map(
                        (obj) =>
                          `${obj.t} detected with ${
                            obj.c
                          }% confidence at [${obj.p.join(", ")}]`
                      )
                      .join("; ")
                  : "No objects detected"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Battery Level Over Time</Typography>
              <Line
                data={chartData(
                  "Battery Level (%)",
                  "cap",
                  "rgba(75,192,192,1)"
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Power Usage Over Time</Typography>
              <Line
                data={chartData(
                  "Power Usage (W)",
                  "power",
                  "rgba(54,162,235,1)"
                )}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Machine successfully sent to charging dock!"
      />
    </Box>
  );
};

export default Dashboard;

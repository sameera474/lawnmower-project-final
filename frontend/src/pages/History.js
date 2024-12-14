import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch data from the backend
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history-data`);
      setHistoryData(response.data.history);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  // Delete all history
  const deleteAllHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-all-history`);
      setHistoryData([]);
      alert("All history deleted successfully!");
    } catch (err) {
      console.error("Error deleting all history:", err);
      alert("Failed to delete all history!");
    }
  };

  // Delete a single row
  const deleteRow = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-history/${id}`);
      setHistoryData(historyData.filter((item) => item._id !== id));
      alert("Entry deleted successfully!");
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry!");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        LawnMower History
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
        <Button variant="contained" color="error" onClick={deleteAllHistory}>
          Delete All History
        </Button>
      </Box>
      <Box
        sx={{
          overflowX: "auto", // Enable horizontal scrolling for the table
          width: "100%",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Position (GPS)</TableCell>
                <TableCell>Battery Level</TableCell>
                <TableCell>Blade Speed</TableCell>
                <TableCell>Power Usage</TableCell>
                <TableCell>Proximity Sensors</TableCell>
                <TableCell>Detected Objects</TableCell>
                <TableCell>Errors</TableCell>
                <TableCell>LiDAR Data</TableCell>
                <TableCell>IMU Data</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((item) => {
                const { sD } = item;
                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      {new Date(item.Timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{sD?.pos || "N/A"}</TableCell>
                    <TableCell>{sD?.bat?.cap?.toFixed(1) || "N/A"}%</TableCell>
                    <TableCell>{sD?.blade?.sp || "N/A"} RPM</TableCell>
                    <TableCell>
                      {sD?.bat?.power?.toFixed(1) || "N/A"} W
                    </TableCell>
                    <TableCell>
                      {sD?.prox
                        ?.map(
                          (sensor) =>
                            `${sensor.id.toUpperCase()}: ${sensor.d.toFixed(
                              2
                            )} m`
                        )
                        .join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      {sD?.obj
                        ?.map(
                          (obj) =>
                            `${obj.t} (${obj.c}%) at [${obj.p.join(", ")}]`
                        )
                        .join("; ") || "None"}
                    </TableCell>
                    <TableCell>{sD?.error?.d || "None"}</TableCell>
                    <TableCell>
                      {sD?.lidar
                        ?.map(
                          (lidar) =>
                            `Angle: ${lidar.a}°, Distance: ${lidar.d.toFixed(
                              2
                            )} m`
                        )
                        .join("; ") || "None"}
                    </TableCell>
                    <TableCell>
                      {sD?.imu
                        ? `Pitch: ${sD.imu.p.toFixed(
                            2
                          )}°, Roll: ${sD.imu.r.toFixed(
                            2
                          )}°, Yaw: ${sD.imu.y.toFixed(2)}°`
                        : "None"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => deleteRow(item._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default History;

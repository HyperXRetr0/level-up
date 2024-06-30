import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import {
  getBarChart,
  getDashboardStatistics,
  getLineChart,
  getPieChart,
} from "../controllers/statistics.js";
const app = express.Router();

// route - /api/v1/dashboard/statistics
app.get("/statistics", adminAuth, getDashboardStatistics);

// route - /api/v1/dashboard/pie
app.get("/pie", adminAuth, getPieChart);

// route - /api/v1/dashboard/bar
app.get("/bar", adminAuth, getBarChart);

// route - /api/v1/dashboard/line
app.get("/line", adminAuth, getLineChart);

export default app;

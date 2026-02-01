//dahboards routes
import express from "express";
import {
  getDashboardSummary,
  getPieChartData,
  getBarChartData,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Route for getting dashboard data
router.get("/summary", getDashboardSummary);
router.get("/pie-chart", getPieChartData);
router.get("/bar-chart", getBarChartData);

export default router;

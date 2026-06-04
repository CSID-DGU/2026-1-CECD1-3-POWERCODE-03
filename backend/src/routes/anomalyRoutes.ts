import { Router } from "express";
import {
  evaluate_logs,
  register_stream_client,
  receive_realtime_log,
} from "../controllers/anomalyController.js";

const anomalyRouter = Router();

// POST /api/anomaly/evaluate-risk
anomalyRouter.post("/evaluate-risk", evaluate_logs);

// GET /api/anomaly/realtime-stream (SSE)
anomalyRouter.get("/realtime-stream", register_stream_client);

// POST /api/anomaly/logs (log sender ingestion)
anomalyRouter.post("/logs", receive_realtime_log);

export default anomalyRouter;

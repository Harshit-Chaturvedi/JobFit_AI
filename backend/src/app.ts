import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { resumeRouter } from "./routes/resume";
import { matchingRouter } from "./routes/matching";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api", healthRouter);
app.use("/api", resumeRouter);
app.use("/api", matchingRouter);

// Global error handler for multer and other errors
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err.message === "Only PDF files are allowed.") {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err.message?.includes("File too large")) {
      res.status(400).json({ error: "File size exceeds the 5MB limit." });
      return;
    }
    console.error("[server] Unhandled error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
);

export default app;

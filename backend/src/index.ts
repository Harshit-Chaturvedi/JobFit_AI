import app from "./app";
import { config } from "./config/env";
import { initializeDatabase } from "./services/databaseService";

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`[server] JobFit AI backend running on http://localhost:${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/api/health`);

  if (config.databaseUrl) {
    try {
      await initializeDatabase();
    } catch (err) {
      console.warn("[server] PostgreSQL initialization deferred or failed:", err);
    }
  } else {
    console.log("[server] Running without PostgreSQL (semantic matching will use in-memory cosine comparison)");
  }
});

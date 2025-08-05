import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import routes from "../routes/api.js";
import { sendError } from "../utils/responseHandler.js";

const app = express();

// -------------------------------------------
// ✅ Middleware
// -------------------------------------------

// Security HTTP headers
app.use(helmet());

// JSON body parser
app.use(express.json());

// CORS config (allow only whitelisted origins in prod)
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// -------------------------------------------
// ✅ Routes
// -------------------------------------------
app.use("/api", routes);

// -------------------------------------------
// ✅ Global Error Handler
// -------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  return sendError(res, err);
});

export default app;

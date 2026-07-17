import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";

import connectDB from "./config/database";
import "./config/passport";

// Routes
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import adminRoutes from "./routes/adminRoutes";
import eventRoutes from "./routes/eventRoutes";
import jobRoutes from "./routes/jobRoutes";


// Middleware
import { errorHandler } from "./middleware/errorHandler";
import startupRoutes from "./routes/startupRoutes";
import aboutRoutes from "./routes/aboutRoutes";
import galleryRoutes from "./routes/galleryRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { verifyEmailConnection } from "./services/emailService";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

/* ----------------------------
   Database
----------------------------- */

connectDB();

/* ----------------------------
   CORS
----------------------------- */



const allowedOrigins = [
  process.env.FRONTEND_URL,      // production frontend, set in Render env vars
  "http://localhost:8080",       // local dev
  "https://cadec.org.in",
  "https://www.cadec.org.in",
].filter(Boolean); // removes undefined if FRONTEND_URL isn't set
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`❌ Blocked by CORS: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* ----------------------------
   Body Parsers
----------------------------- */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ----------------------------
   Passport
----------------------------- */

app.use(passport.initialize());

/* ----------------------------
   Routes
----------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/upload", uploadRoutes);

/* ----------------------------
   Health Check
----------------------------- */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

import net from "net";

app.get("/api/test-smtp-raw", (req, res) => {
  const socket = net.createConnection(
    { host: "smtp.hostinger.com", port: 465, family: 4 },
    () => {
      res.json({ success: true, message: "Raw TCP connection succeeded" });
      socket.end();
    }
  );

  socket.setTimeout(8000);

  socket.on("timeout", () => {
    socket.destroy();
    res.status(500).json({ success: false, error: "Raw TCP connection timed out" });
  });

  socket.on("error", (err: any) => {
    res.status(500).json({ success: false, error: err.message, code: err.code });
  });
});

/* ----------------------------
   Error Handler
----------------------------- */

app.use(errorHandler);

/* ----------------------------
   Start Server
----------------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
//Vaerify email connection
verifyEmailConnection();
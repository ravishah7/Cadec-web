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
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

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

/* ----------------------------
   Error Handler
----------------------------- */

app.use(errorHandler);

/* ----------------------------
   Start Server
----------------------------- */

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  console.log(
    `🌐 Frontend: ${
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    }`
  );

  console.log(
    `Environment: ${
      process.env.NODE_ENV ||
      "development"
    }`
  );
});
// -------------------------------
// Jobryan Offert Service Backend
// -------------------------------

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// -------------------------------
// Setup paths
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// Create Express app
// -------------------------------
const app = express();
const PORT = process.env.PORT || 8080;

// -------------------------------
// Middleware
// -------------------------------
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*" })); // you can later restrict to https://www.jobryan.se
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

// -------------------------------
// Static files (frontend)
// -------------------------------
app.use(express.static("public"));

// -------------------------------
// Simple health check
// -------------------------------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// -------------------------------
// Price data endpoint
// -------------------------------
app.get("/api/prices", (req, res) => {
  try {
    const dataPath = path.join(__dirname, "price.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("Error reading price.json:", err);
    res.status(500).json({ error: "Could not read price data." });
  }
});

// -------------------------------
// File upload (optional)
// -------------------------------
const upload = multer({ dest: "uploads/" });

// -------------------------------
// Email sending endpoint
// -------------------------------
app.post("/api/send-offer", upload.none(), async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // --- set up transporter ---
    const transporter = nodemailer.createTransport({
      host: "smtp.one.com", // change to your email provider’s SMTP
      port: 465,
      secure: true,
      auth: {
        user: "info@jobryan.se", // your email
        pass: process.env.EMAIL_PASS || "yourpassword", // add real password in Render environment vars
      },
    });

    // --- email details ---
    const mailOptions = {
      from: `"Offertförfrågan" <info@jobryan.se>`,
      to: "info@jobryan.se",
      subject: `Ny offertförfrågan från ${name || "kund"}`,
      text: `Från: ${name}\nE-post: ${email}\n\nMeddelande:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Offert skickad!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Kunde inte skicka e-post." });
  }
});

// -------------------------------
// 404 fallback (redirect to index.html for frontend routing)
// -------------------------------
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------------------
// Start server
// -------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

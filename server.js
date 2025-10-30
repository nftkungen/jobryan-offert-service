// server.js (ESM)
// ----------------
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ---------- Security & CORS ----------
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  // for quick testing; later restrict to https://www.jobryan.se
  origin: "*"
}));

app.use(rateLimit({ windowMs: 60 * 1000, max: 30 }));

// Optional: serve static files in public/
app.use(express.static(path.join(__dirname, "public")));

// Multer for files
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB, 5 files
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
    cb(ok ? null : new Error("Otillåten filtyp"), ok);
  },
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ---------- Helpers ----------
function loadPricesSync() {
  const p = path.join(__dirname, "price.json"); // price.json in repo root
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

// ---------- Routes ----------
app.get("/health", (req, res) => res.json({ ok: true }));

// return price list to the frontend
app.get("/api/prices", (req, res) => {
  try {
    const prices = loadPricesSync();
    res.json(prices);
  } catch (err) {
    console.error("price load error:", err);
    res.status(500).json({ ok: false, error: "Could not load prices" });
  }
});

// accept form submit and send email
app.post(
  "/api/send-offer",
  upload.array("files", 5),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const fields = req.body || {};
      const files = req.files || [];

      // honeypot
      if (fields.company && fields.company.trim() !== "") {
        return res.status(400).json({ ok: false, error: "Spam blocked" });
      }

      // minimal required
      const required = ["namn", "epost", "adress", "postnr"];
      const missing = required.filter((k) => !String(fields[k] || "").trim());
      if (missing.length) {
        return res.status(400).json({ ok: false, error: "Fyll i namn, e-post, adress och postnummer." });
      }

      // optional reCAPTCHA v3
      if (process.env.RECAPTCHA_SECRET && fields._recaptcha_token) {
        const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        const params = new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET,
          response: fields._recaptcha_token,
        });
        const resp = await fetch(verifyUrl, { method: "POST", body: params });
        const data = await resp.json();
        if (!data.success || (data.score !== undefined && data.score < (Number(process.env.RECAPTCHA_MIN_SCORE || 0.4)))) {
          return res.status(400).json({ ok: false, error: "reCAPTCHA verification failed" });
        }
      }

      // compose plain text
      const lines = ["Ny offertförfrågan från hemsidan", "--------------------------------", ""];
      for (const [k, v] of Object.entries(fields)) {
        if (String(k).startsWith("_")) continue;
        lines.push(`${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
      }
      const text = lines.join("\n");

      const attachments = files.map((f) => ({
        filename: f.originalname,
        content: f.buffer,
        contentType: f.mimetype,
      }));

      // send to office inbox
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: process.env.TO_EMAIL, // info@jobryan.se
        subject: fields._meta_title || "Ny offertförfrågan",
        text,
        attachments,
      });

      // auto-ack to customer
      if (fields.epost) {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: fields.epost,
          subject: "Tack för din offertförfrågan",
          text: `Hej ${fields.namn || ""}!\n\nTack för din förfrågan till Jobryan Bygg. Vi återkommer snart.\n\nMvh\nJobryan Bygg`,
        });
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("send-offer error:", err);
      res.status(500).json({ ok: false, error: "Serverfel, försök igen senare." });
    }
  }
);

app.listen(PORT, () => console.log(`Server running on :${PORT}`));

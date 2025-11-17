import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Load price config safely
let priceConfig = {};
try {
  if (fs.existsSync(path.join(__dirname, "price.json"))) {
    const json = fs.readFileSync(path.join(__dirname, "price.json"), "utf8");
    priceConfig = JSON.parse(json);
  }
} catch (err) {
  console.error("Warning: Could not read price.json", err.message);
}

// Health check
app.get("/api/ping", (req, res) => res.json({ ok: true, msg: "pong" }));

// Estimate proxy
app.post("/api/estimate/badrum", async (req, res) => {
  try {
    const url = process.env.SHEETS_WEBAPP_URL;
    if (!url) return res.status(500).json({ ok: false, error: "Serverfel: Ingen koppling till Excel (URL saknas)." });

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: JSON.stringify(req.body) }), // Double stringify for Google Apps Script
    });

    const data = await r.json();
    if (!data.ok) return res.json({ ok: false, error: data.error || "Okänt fel från Google Sheet." });
    
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ ok: false, error: "Kunde inte kontakta kalkylbladet." });
  }
});

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ======= Jobryan Offert Service =======

import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// ---------- BASIC MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// ---------- API: TEST ----------
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

// ---------- API: PRICELIST (from price.json) ----------
app.get("/api/prices", (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "price.json"), "utf8");
    const prices = JSON.parse(raw);
    res.json(prices);
  } catch (err) {
    console.error("[/api/prices] error:", err);
    res.status(500).json({ ok: false, error: "prices_not_found" });
  }
});

// ---------- API: CONNECT TO GOOGLE SHEETS ----------
app.post("/api/estimate/badrum", async (req, res) => {
  try {
    if (!process.env.SHEETS_WEBAPP_URL) {
      return res
        .status(500)
        .json({ ok: false, error: "Missing SHEETS_WEBAPP_URL env var" });
    }

    const r = await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await r.json();
    return res.json(data);
  } catch (err) {
    console.error("Estimate error:", err);
    res.status(500).json({ ok: false, error: "proxy_failed" });
  }
});

// ---------- FALLBACK (SPA) ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Jobryan server running on port ${PORT}`);
});

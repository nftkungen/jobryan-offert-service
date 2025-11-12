// ======= Jobryan Offert Service =======

import express from "express";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ---------- BASIC MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from /public
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// ---------- API: TEST ----------
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

// ---------- API: CONNECT TO GOOGLE SHEETS ----------
app.post("/api/estimate/badrum", async (req, res) => {
  try {
    if (!process.env.SHEETS_WEBAPP_URL) {
      return res.status(500).json({ ok: false, error: "Missing SHEETS_WEBAPP_URL env var" });
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

// ---------- FALLBACK ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Jobryan server running on port ${PORT}`);
});

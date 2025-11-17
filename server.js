// ===== Jobryan Offert Server (Lokal Kalkylator) =====

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { calculatePrice } from "./public/calculator.js"; // Importera den nya kalkylatorn

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Hälso-check
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

// === NY PRISBERÄKNINGS-ENDPOINT ===
app.post("/api/estimate/badrum", async (req, res) => {
  try {
    const inputs = req.body || {};
    
    // Anropa den lokala, omedelbara kalkylatorn
    const priceResult = calculatePrice(inputs);
    
    res.json({
      ok: true,
      ...priceResult // Skicka tillbaka hela pris-objektet
    });

  } catch (err) {
    console.error("Calculation error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// Fallback till frontend-appen
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Jobryan offert server (LOKAL) körs på port ${PORT}`);
});

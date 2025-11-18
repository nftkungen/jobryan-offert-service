// ===== Jobryan Offert Server (Stabil) =====
import express from "express";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/estimate/badrum", async (req, res) => {
  try {
    const url = process.env.SHEETS_WEBAPP_URL;
    if (!url) {
      return res.status(500).json({ ok: false, error: "Servern saknar koppling till Google Sheets." });
    }

    // SKICKA DATAN DIREKT (Ingen dubbel-paketering)
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), 
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Okänt fel från Google Sheet.");
    res.json(data);

  } catch (err) {
    console.error("Estimate error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server körs på port ${PORT}`));

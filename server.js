// server.js  (Node 18+, ESM)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 8080;

// --- Security (CSP allows self only; no inline scripts used) ---
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"], // allow inline styles if needed
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// --- Static files ---
const publicDir = path.join(__dirname, "public");
// Serve /public at site root: / -> index.html, /app.js -> /public/app.js, etc.
app.use(express.static(publicDir, { index: false }));

// Root -> index.html (so / returns the HTML instead of a 404 page)
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Prices (reads price.json in repo)
app.get("/api/prices", (_req, res) => {
  res.sendFile(path.join(__dirname, "price.json"));
});
// ====== Proxy to Google Apps Script (Sheet calculator) ======
app.post("/api/estimate/badrum", express.json(), async (req, res) => {
  try {
    const r = await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("estimate proxy error:", e);
    res.status(500).json({ ok:false, error:"proxy_failed" });
  }
});

// Submit (stub you can wire to email later)
app.post("/api/send-offer", async (req, res) => {
  // TODO: send email/Store — for now just ack
  res.json({ ok: true });
});

// 404 fallthrough for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  return next();
});

app.listen(PORT, () => console.log(`Server on :${PORT}`));

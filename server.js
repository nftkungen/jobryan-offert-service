// ===== Jobryan Offert Server =====

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

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ---------- LOAD PRICE LIST ----------
let priceConfig = {};
try {
  const json = fs.readFileSync(path.join(__dirname, "price.json"), "utf8");
  priceConfig = JSON.parse(json);
} catch (err) {
  console.error("Could not read price.json:", err.message);
}

// ---------- HEALTH & TEST ----------
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

app.get("/api/prices", (req, res) => {
  res.json(priceConfig);
});

// ---------- PROXY TO GOOGLE SHEETS ----------
app.post("/api/estimate/badrum", async (req, res) => {
  try {
    const url = process.env.SHEETS_WEBAPP_URL;
    if (!url) {
      return res
        .status(500)
        .json({ ok: false, error: "Serverfel: SHEETS_WEBAPP_URL saknas." });
    }

    // **SANITIZE INPUTS**
    // Ensure numbers are numbers, not strings or nulls, to prevent Sheet errors.
    const raw = req.body || {};
    const cleanData = {
      ...raw,
      zon: Number(raw.zon) || 0,
      kvm_golv: Number(raw.kvm_golv) || 0,
      kvm_vagg: Number(raw.kvm_vagg) || 0,
      takhojd: Number(raw.takhojd) || 0,
      rivning_vaggar: Number(raw.rivning_vaggar) || 0,
      gerade_horn_meter: Number(raw.gerade_horn_meter) || 0,
      fyll_i_antal_meter: Number(raw.fyll_i_antal_meter) || 0,
      spotlight_antal: Number(raw.spotlight_antal) || 0,
      
      // Ensure text fields are at least empty strings, never null/undefined
      microcement_golv: raw.microcement_golv || "Nej",
      microcement_vagg: raw.microcement_vagg || "Nej",
      // ... (add other critical fields if your sheet is picky)
    };

    const body = {
      contents: JSON.stringify(cleanData),
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    
    // Validate response from Sheet
    if (!data || (!data.ok && !data.pris_totalt_ink_moms)) {
        console.error("Sheet returned invalid data:", data);
        return res.json({ ok: false, error: "Kunde inte beräkna pris (Google Sheet-fel)." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Estimate error:", err);
    return res.status(500).json({ ok: false, error: "Nätverksfel mot kalkylservern." });
  }
});

// ---------- SEND OFFER BY EMAIL ----------
app.post("/api/send-offer", async (req, res) => {
  try {
    const { contact, form, estimate } = req.body || {};

    if (!contact || !estimate) {
      return res
        .status(400)
        .json({ ok: false, error: "Kontaktuppgifter eller pris saknas." });
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL,
      SALES_EMAIL,
    } = process.env;

    if (!SMTP_HOST || !FROM_EMAIL || !SALES_EMAIL) {
      return res.status(500).json({
        ok: false,
        error: "Serverfel: Email-konfiguration saknas.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: false,
      auth: SMTP_USER
        ? {
            user: SMTP_USER,
            pass: SMTP_PASS,
          }
        : undefined,
    });

    const baseSubject = `Ny badrumsförfrågan – ${contact.namn || "Okänd kund"}`;

    const estimateLines = [
      `Arbete exkl. moms: ${estimate.pris_arbete_ex_moms}`,
      `Grundmaterial exkl. moms: ${estimate.pris_grundmaterial_ex_moms}`,
      `Resekostnad exkl. moms: ${estimate.pris_resekostnad_ex_moms}`,
      `Sop & övrigt exkl. moms: ${estimate.pris_sophantering_ex_moms}`,
      `Totalt exkl. moms: ${estimate.pris_totalt_ex_moms}`,
      `Pris efter ROT: ${estimate.pris_efter_rot}`,
    ].join("\n");

    const contactLines = [
      `Namn: ${contact.namn || "-"}`,
      `E-post: ${contact.email || "-"}`,
      `Telefon: ${contact.telefon || "-"}`,
      `Adress: ${contact.adress || "-"}`,
      `Postnummer: ${contact.postnummer || "-"}`,
    ].join("\n");

    const textForSales = [
      "Ny badrumsförfrågan från webbformuläret.",
      "",
      "=== Kunduppgifter ===",
      contactLines,
      "",
      "=== Valda parametrar ===",
      JSON.stringify(form, null, 2),
      "",
      "=== Beräknad offert ===",
      estimateLines,
      "",
      "Skickad automatiskt från Jobryan offert-systemet.",
    ].join("\n");

    // mail to Jobryan
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: SALES_EMAIL,
      subject: baseSubject,
      text: textForSales,
    });

    // mail to customer (if email)
    if (contact.email) {
      const textForCustomer = [
        `Hej ${contact.namn || ""}!`,
        "",
        "Tack för din förfrågan till Jobryan Bygg.",
        "Här är en preliminär sammanställning av din badrumsrenovering.",
        "",
        "=== Beräknad offert (ca-pris) ===",
        estimateLines,
        "",
        "En säljare från Jobryan kontaktar dig inom kort för att gå igenom detaljerna och boka ett eventuellt platsbesök.",
        "",
        "Vänliga hälsningar,",
        "Jobryan Bygg Service",
      ].join("\n");

      await transporter.sendMail({
        from: FROM_EMAIL,
        to: contact.email,
        subject: "Din preliminära badrumsoffert från Jobryan",
        text: textForCustomer,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("send-offer error:", err);
    return res.status(500).json({ ok: false, error: "Kunde inte skicka email." });
  }
});

// ---------- FALLBACK TO FRONTEND ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Jobryan offert server running on port ${PORT}`);
});

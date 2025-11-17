// ===================================
// PRIS-KALKYLATOR FÖR BADRUM
// Detta är din nya "prisdatabas".
// Ändra priser här istället för i Google Sheets.
// ===================================

// --- PRISLISTA (HÄMTAD FRÅN DINA BILDER) ---
const PRICES = {
  // Grundpriser (från image_4834dd.png, rad 77-80)
  // Priser per zon för "Grundkostnad ex. moms"
  grundkostnad: {
    1: 140000,
    2: 130000,
    3: 125000,
    4: 125000, // Antar att zon 4 är samma som 3
  },
  // "Storlek >5m2 extra / m2"
  extra_m2: {
    1: 15000,
    2: 10000,
    3: 7500,
    4: 7500,
  },
  // "Grundmaterial ex. moms"
  grundmaterial: {
    1: 37500,
    2: 32000,
    3: 32000,
    4: 32000,
  },
  // "Resekostnader & Sophantering"
  resa_sop: {
    1: 4000 + 3500, // 7500 (antar att det är totalsumman)
    2: 2800 + 2400, // 5200
    3: 2800 + 2400, // 5200
    4: 2800 + 2400, // 5200
  },

  // --- TILLÄGG (från "tillkommande" i dina bilder) ---
  addons: {
    // Ytskikt
    microcement_golv: 2000, // Egen gissning, fyll i rätt
    microcement_vagg: 2000, // Egen gissning
    gerade_horn_meter: 1500, // Pris per meter (från "Gerade hörn" D20)
    
    // Snickeri (från image_483465.png)
    ny_troskel: 1100, // Grundpris?
    byta_dorrblad: 900,
    byta_karm_dorr: 2200,
    slipning_dorr: 1000,
    bankskiva_ovan_tm_tt: 1900,
    vaggskap: 500, // Egen gissning
    nytt_innertak: 6000,
    rivning_vaggar: 10000, // Per vägg?
    nya_vaggar_material: 5000,

    // VVS (från image_483465 & 48349b.png)
    dolda_ror: 10000,
    wc_golvmonterad: 2100,
    wc_vaggmonterad: 7600 + 5500, // 13100
    byte_av_avloppsgroda: 15000,
    ny_slitsbotten: 4500,
    brunn_linje: 0, // Behöver pris
    duschblandare_inbyggnad: 12000,
    tvattstallsblandare_inbyggnad: 8000,
    tvattstall_kommod_el: 4000 + 2000, // 6000
    inklakat_badkar: 8800,
    tvattmaskin: 3500, // Anslutning?
    torktumlare: 2000,
    torkskap: 2000,
    varme_vp: 15000, // "Värmepump endast"
    
    // El (från image_4834bc.png)
    takbylsning_spotlights: 15000, // Pris för "Spotlights"
    spotlight_antal: 1500, // Pris per extra spot?
    golvvärme: 4000,
    handdukstork: 2500,
  },
  
  // Priser som *ingår* i grundpriset (för logikens skull)
  included: {
    wc_inget: 0,
    brunn_standard: 2000, // Ingår?
    duschblandare_standard: 2000,
    tvattstallsblandare_standard: 1500,
    tvattstall_kommod_utan_el: 2000,
    takbelysning_standard: 2000
  }
};

const MOMS_RATE = 0.25;
const ROT_RATE = 0.30;

// --- KALKYLATOR-FUNKTION ---
export function calculatePrice(data) {
  // Säkerställ att vi har numeriska värden
  const zon = parseInt(data.zon) || 3;
  const kvm_golv = parseFloat(String(data.kvm_golv).replace(",", ".")) || 0;
  
  // --- Grundpriser ---
  let cost_work = PRICES.grundkostnad[zon] || PRICES.grundkostnad[3];
  let cost_material = PRICES.grundmaterial[zon] || PRICES.grundmaterial[3];
  let cost_travel = PRICES.resa_sop[zon] || PRICES.resa_sop[3];
  
  // M2-tillägg
  if (kvm_golv > 5) {
    const extra_m2 = kvm_golv - 5;
    cost_work += extra_m2 * (PRICES.extra_m2[zon] || PRICES.extra_m2[3]);
  }

  // --- Tillägg (Arbete) ---
  if (data.microcement_golv === "Ja") cost_work += PRICES.addons.microcement_golv;
  if (data.microcement_vagg === "Ja") cost_work += PRICES.addons.microcement_vagg;
  if (data.ny_troskel === "Ja") cost_work += PRICES.addons.ny_troskel;
  if (data.byta_dorrblad === "Ja") cost_work += PRICES.addons.byta_dorrblad;
  if (data.byta_karm_dorr === "Ja") cost_work += PRICES.addons.byta_karm_dorr;
  if (data.slipning_dorr === "Ja") cost_work += PRICES.addons.slipning_dorr;
  if (data.bankskiva_ovan_tm_tt === "Ja") cost_work += PRICES.addons.bankskiva_ovan_tm_tt;
  if (data.vaggskap === "Ja") cost_work += PRICES.addons.vaggskap;
  if (data.nytt_innertak === "Ja") cost_work += PRICES.addons.nytt_innertak;
  
  // Tillägg med antal
  cost_work += (parseInt(data.rivning_vaggar) || 0) * PRICES.addons.rivning_vaggar;
  cost_work += (parseFloat(String(data.gerade_horn_meter).replace(",",".")) || 0) * PRICES.addons.gerade_horn_meter;

  // VVS Tillägg
  if (data.dolda_ror === "Ja") cost_work += PRICES.addons.dolda_ror;
  if (data.wc === "Golvmonterad WC") cost_work += PRICES.addons.wc_golvmonterad;
  if (data.wc === "Väggmonterad WC") cost_work += PRICES.addons.wc_vaggmonterad;
  if (data.byte_av_avloppsgroda === "Ja") cost_work += PRICES.addons.byte_av_avloppsgroda;
  if (data.ny_slitsbotten === "Ja") cost_work += PRICES.addons.ny_slitsbotten;
  if (data.duschblandare === "Inbyggnadsdusch") cost_work += PRICES.addons.duschblandare_inbyggnad;
  if (data.tvattstallsblandare === "Övrigt") cost_work += PRICES.addons.tvattstallsblandare_inbyggnad; // Antar "Övrigt" = inbyggnad
  if (data.tvattstall_kommod === "Med el / special") cost_work += PRICES.addons.tvattstall_kommod_el;
  if (data.inklakat_badkar === "Ja") cost_work += PRICES.addons.inklakat_badkar;

  // Maskiner
  if (data.tvattmaskin === "Ja") cost_work += PRICES.addons.tvattmaskin;
  if (data.torktumlare === "Ja") cost_work += PRICES.addons.torktumlare;
  if (data.torkskap === "Ja") cost_work += PRICES.addons.torkskap;
  if (data.varme_vp === "Ja") cost_work += PRICES.addons.varme_vp;

  // El
  if (data.golvvärme === "Ja") cost_work += PRICES.addons.golvvärme;
  if (data.handdukstork === "Ja") cost_work += PRICES.addons.handdukstork;
  if (data.takbelysning === "Spotlights") {
      cost_work += PRICES.addons.takbylsning_spotlights;
      cost_work += (parseInt(data.spotlight_antal) || 0) * PRICES.addons.spotlight_antal;
  }
  
  // --- Summering ---
  const total_ex_moms = cost_work + cost_material + cost_travel;
  const moms = total_ex_moms * MOMS_RATE;
  const total_ink_moms = total_ex_moms + moms;
  
  // ROT är 30% av *endast* arbetskostnaden
  const rot_avdrag = (cost_work * (1 + MOMS_RATE)) * ROT_RATE; 
  const total_efter_rot = total_ink_moms - rot_avdrag;

  return {
    cost_work: cost_work,
    cost_material: cost_material,
    cost_travel: cost_travel,
    cost_rot: rot_avdrag * -1, // Skicka som negativt tal
    pris_totalt_ink_moms: total_efter_rot // Detta är slutpriset kunden betalar
  };
}
```

### **Steg 3: Uppdatera `public/app.js` (Frontend)**

**Instruktion:** Ersätt **all** kod i `public/app.js`. Den är nu inställd på att hämta priset live och visa hela specifikationen.

```javascript
// ===== Jobryan Offert Wizard – Badrum (LOKAL KALKYL) =====

const API_URL = "/api/estimate/badrum";

const initialState = {
  step: 1, 
  // Kontakt
  kund_namn: "", kund_tel: "", kund_email: "", address: "",
  propertyType: "Lägenhet", era: "60-tal", floor: "3 tr", elevator: "Stor",
  // Storlek
  postnummer: "", zon: "3", kvm_golv: 8.5, kvm_vagg: 0, takhojd: 2.4,
  // Val
  microcement_golv: "Nej", microcement_vagg: "Nej", gerade_horn_meter: 0, fyll_i_antal_meter: 0,
  ny_troskel: "Nej", byta_dorrblad: "Nej", byta_karm_dorr: "Nej", slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej", vaggskap: "Nej", nytt_innertak: "Nej",
  rivning_vaggar: 0, nya_vaggar_material: "Nej / bestäms senare",
  dolda_ror: "Nej", wc: "Ingen WC", byte_av_avloppsgroda: "Nej", ny_slitsbotten: "Nej",
  brunn: "Standard", duschblandare: "Standard", tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el", inklakat_badkar: "Nej",
  tvattmaskin: "Nej", torktumlare: "Nej", torkskap: "Nej", varme_vp: "Nej",
  golvvärme: "Nej", handdukstork: "Nej", 
  takbelysning: "Standard", spotlight_antal: 0,
  // System
  loading: false, error: "", priceResult: null // { cost_work, cost_material, ... }
};

let state = { ...initialState };

// Lists
const YES_NO = ["Nej", "Ja"];
const WC_OPTS = ["Ingen WC", "Golvmonterad WC", "Väggmonterad WC"];
const TAKBELYSNING_OPTS = ["Standard", "Spotlights"];

const INCLUDED_OPTIONS = {
  duschblandare: ["Standard"], tvattstallsblandare: ["Standard"], tvattstall_kommod: ["Kommod utan el"],
  wc: ["Ingen WC"], brunn: ["Standard"], golvvärme: ["Nej"], handdukstork: ["Nej"],
  takbelysning: ["Standard"], tvattmaskin: ["Nej"], torktumlare: ["Nej"], torkskap: ["Nej"],
  inklakat_badkar: ["Nej"], varme_vp: ["Nej"], dolda_ror: ["Nej"]
};
const SUMMARY_LABELS = {
  microcement_golv: "Microcement golv", microcement_vagg: "Microcement vägg", gerade_horn_meter: "Gerade hörn",
  fyll_i_antal_meter: "Fris", ny_troskel: "Ny tröskel", byta_dorrblad: "Byte av dörrblad",
  byta_karm_dorr: "Byte av karm + dörr", slipning_dorr: "Slipning av dörr", bankskiva_ovan_tm_tt: "Bänkskiva",
  vaggskap: "Väggskåp", nytt_innertak: "Nytt innertak", rivning_vaggar: "Rivning väggar",
  nya_vaggar_material: "Nya väggar", dolda_ror: "Dolda rör", wc: "WC", byte_av_avloppsgroda: "Byte av avloppsgroda",
  ny_slitsbotten: "Ny slitsbotten", brunn: "Brunn", duschblandare: "Duschblandare",
  tvattstallsblandare: "Tvättställsblandare", tvattstall_kommod: "Kommod", inklakat_badkar: "Inklätt badkar",
  tvattmaskin: "Tvättmaskin", torktumlare: "Torktumlare", torkskap: "Torkskåp", varme_vp: "Värme VP",
  golvvärme: "Golvvärme", handdukstork: "Handdukstork", takbelysning: "Takbelysning", spotlight_antal: "Spotlights",
};
const DEFAULT_VALUES = {
  microcement_golv: "Nej", microcement_vagg: "Nej", gerade_horn_meter: "0", fyll_i_antal_meter: "0",
  ny_troskel: "Nej", byta_dorrblad: "Nej", byta_karm_dorr: "Nej", slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej", vaggskap: "Nej", nytt_innertak: "Nej", rivning_vaggar: "0",
  nya_vaggar_material: "Nej / bestäms senare", dolda_ror: "Nej", wc: "Ingen WC", byte_av_avloppsgroda: "Nej",
  ny_slitsbotten: "Nej", brunn: "Standard", duschblandare: "Standard", tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el", inklakat_badkar: "Nej", tvattmaskin: "Nej", torktumlare: "Nej",
  torkskap: "Nej", varme_vp: "Nej", golvvärme: "Nej", handdukstork: "Nej", 
  takbelysning: "Standard", spotlight_antal: "0",
};

// --- Live Calculation Debouncer ---
const triggerLivePrice = debounce(() => handleCalculate(true), 500); // 0.5s fördröjning
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// --- Render ---
function getRoot() { return document.getElementById("js-root") || document.getElementById("app"); }

function setState(patch, shouldRender = true) {
  state = { ...state, ...patch };
  if (shouldRender) render();
  else renderSummaryOnly();

  const ignoreFields = ["loading", "error", "priceResult", "step"];
  const hasChanges = Object.keys(patch).some(k => !ignoreFields.includes(k));
  if (hasChanges) {
    state.loading = true;
    renderSummaryOnly(); 
    triggerLivePrice();
  }
}

function render() {
  const root = getRoot();
  if (!root) return;
  let layout = root.querySelector(".layout");
  if (!layout) {
    root.innerHTML = `<div class="layout"><div class="wizard"><div id="header"></div><div id="step"></div></div><div id="summary"></div></div>`;
  }
  document.getElementById("header").innerHTML = renderHeader();
  document.getElementById("step").innerHTML = renderStep();
  renderSummaryOnly();
}

function renderSummaryOnly() {
  const el = document.getElementById("summary");
  if(el) el.innerHTML = renderSummary();
}

const TOTAL_STEPS = 9;
function renderHeader() {
  return `<div class="wizard-header"><div><h1 class="title">Offertkalkyl – Badrum</h1><p class="subtitle">Priset uppdateras live i summeringen till höger.</p><div class="step-indicator">Steg ${state.step} av ${TOTAL_STEPS}</div></div></div>`;
}

function renderStep() {
  switch (state.step) {
    case 1: return renderStep1(); 
    case 2: return renderStep2();
    case 3: return renderStep3();
    case 4: return renderStep4();
    case 5: return renderStep5();
    case 6: return renderStep6();
    case 7: return renderStep7();
    case 8: return renderStep8();
    case 9: return renderStep9();
    default: return "";
  }
}

// Steps
function renderStep1() {
  return `<section class="card"><h2>1. Grunddata & Fastighet</h2><h3 class="section-title" style="margin-top:0;">Kontakt</h3><div class="grid grid-2">${inp("Namn", "kund_namn")} ${inp("Telefon", "kund_tel")} ${inp("E-post", "kund_email", "email")}${inp("Adress", "address")} ${inp("Postnummer", "postnummer")}<div class="field"><label>Zon</label><select data-field="zon">${opts(["1", "2", "3", "4"], state.zon)}</select></div></div><h3 class="section-title">Fastighet</h3><div class="grid grid-2"><div class="field"><label>Fastighetstyp</label><select data-field="propertyType">${opts(["Villa", "Lägenhet", "Radhus"], state.propertyType)}</select></div><div class="field"><label>Era</label><select data-field="era">${opts(["20-tal", "30-tal", "40-tal", "50-tal", "60-tal", "70-tal", "80-tal", "90-tal", "2000-tal"], state.era)}</select></div><div class="field"><label>Våning</label><select data-field="floor">${opts(["BV", "1 tr", "2 tr", "3 tr", "4 tr", "5 tr+"], state.floor)}</select></div><div class="field"><label>Hiss</label><select data-field="elevator">${opts(["Ingen", "Liten", "Stor"], state.elevator)}</select></div><div class="field" style="grid-column:1/-1;"><label>Storlek (golvyta)</label><div class="slider-container"><input type="range" min="2" max="20" step="0.5" data-field="kvm_golv" value="${state.kvm_golv}" class="slider-range"><div class="slider-input-wrap"><input type="number" data-field="kvm_golv" value="${state.kvm_golv}" class="slider-number"><span class="suffix">m²</span></div></div></div>${inp("Väggyta (m²)", "kvm_vagg", "number")} ${inp("Takhöjd (m)", "takhojd", "number")}</div><div class="actions"><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`;
}
function renderStep2() { return `<section class="card"><h2>2. Ytskikt</h2><div class="grid grid-2">${pill("Microcement golv", "microcement_golv", YES_NO)}${pill("Microcement vägg", "microcement_vagg", YES_NO)}${pill("Gerade hörn (meter)", "gerade_horn_meter", ["0","2","4","6","8","10","12"])}${inp("Fyll i antal meter fris", "fyll_i_antal_meter", "number")}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep3() { return `<section class="card"><h2>3. Snickeri</h2><div class="grid grid-2">${pill("Ny tröskel", "ny_troskel", YES_NO)}${pill("Byta dörrblad", "byta_dorrblad", YES_NO)}${pill("Byta karm", "byta_karm_dorr", YES_NO)}${pill("Slipning dörr", "slipning_dorr", YES_NO)}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep4() { return `<section class="card"><h2>4. Inredning</h2><div class="grid grid-2">${pill("Bänkskiva TM/TT", "bankskiva_ovan_tm_tt", YES_NO)}${pill("Väggskåp", "vaggskap", YES_NO)}${pill("Nytt innertak", "nytt_innertak", YES_NO)}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep5() { return `<section class="card"><h2>5. Rivning</h2><div class="grid grid-2">${pill("Rivning väggar (st)", "rivning_vaggar", ["0","1","2","3","4"])}${pill("Nya väggar", "nya_vaggar_material", ["Nej / bestäms senare","Lättvägg","Massiv"])}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep6() { return `<section class="card"><h2>6. VVS</h2><div class="grid grid-2">${pill("Dolda rör", "dolda_ror", YES_NO)}${pill("WC", "wc", WC_OPTS)}${pill("Byte avloppsgroda", "byte_av_avloppsgroda", YES_NO)}${pill("Ny slitsbotten", "ny_slitsbotten", YES_NO)}${pill("Brunn", "brunn", ["Standard","Övrigt"])}${pill("Duschblandare", "duschblandare", ["Standard","Inbyggnadsdusch"])}${pill("Tvättställsblandare", "tvattstallsblandare", ["Standard","Övrigt"])}${pill("Kommod", "tvattstall_kommod", ["Kommod utan el","Med el / special"])}${pill("Inkläkat badkar", "inklakat_badkar", YES_NO)}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep7() { return `<section class="card"><h2>7. Maskiner</h2><div class="grid grid-2">${pill("Tvättmaskin", "tvattmaskin", YES_NO)}${pill("Torktumlare", "torktumlare", YES_NO)}${pill("Torkskåp", "torkskap", YES_NO)}${pill("Värmepump", "varme_vp", YES_NO)}${pill("Golvvärme", "golvvärme", YES_NO)}${pill("Handdukstork", "handdukstork", YES_NO)}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }
function renderStep8() { return `<section class="card"><h2>8. El</h2><div class="grid grid-2">${pill("Takbelysning", "takbelysning", TAKBELYSNING_OPTS)}${inp("Spotlight antal", "spotlight_antal", "number")}</div><div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" data-next>Nästa steg</button></div></section>`; }

function renderStep9() {
  const { priceResult } = state;
  const total = priceResult?.pris_totalt_ink_moms ? formatKr(priceResult.pris_totalt_ink_moms) : "–";
  
  return `
    <section class="card">
      <h2>9. Spara & Skicka</h2>
      <p>Kontrollera uppgifterna nedan. Priset ser du i summeringen till höger.</p>
      <div class="price-result">
        <h3>Preliminärt totalpris: ${total}</h3>
        <p class="muted">Specifikation skickas till e-post vid bekräftelse.</p>
      </div>
      <div class="actions"><button class="btn btn-ghost" data-prev>Tillbaka</button><button class="btn btn-primary" onclick="alert('Offert sparad!')">Skicka offert</button></div>
    </section>`;
}

// --- DEN NYA LIVE-SUMMERINGEN ---
function renderSummary() {
  const p = state.priceResult;
  const isLoading = state.loading;
  const errorMsg = state.error;

  // Lista med valda tillval
  const listItems = Object.keys(SUMMARY_LABELS).map(key => {
      const val = String(state[key]);
      const def = String(DEFAULT_VALUES[key]);
      if(!val || val === def) return null;
      if(val === "Ja") return `<li class="summary-item">${SUMMARY_LABELS[key]}</li>`;
      return `<li class="summary-item">${SUMMARY_LABELS[key]}: <strong>${escapeHtml(val)}</strong></li>`;
  }).filter(Boolean).join("");

  // Pris-rutan
  let priceContent = "";
  if (isLoading) {
    priceContent = `<div class="summary-price-box loading"><div class="label">Uppdaterar pris...</div><div class="value">...</div></div>`;
  } else if (errorMsg) {
    priceContent = `<div class="summary-price-box" style="background:#7f1d1d;"><div class="label">Fel</div><div class="value" style="font-size:14px;">${escapeHtml(errorMsg)}</div></div>`;
  } else if (p && p.ok) {
    // HELA SPECIFIKATIONEN
    priceContent = `
      <div class="price-breakdown-list">
        <div class="price-item"><span>Arbetskostnad (ink moms):</span> <span>${formatKr(p.cost_work * (1 + 0.25))}</span></div>
        <div class="price-item"><span>Material (ink moms):</span> <span>${formatKr(p.cost_material * (1 + 0.25))}</span></div>
        <div class="price-item"><span>Resa & Sop (ink moms):</span> <span>${formatKr(p.cost_travel * (1 + 0.25))}</span></div>
        <div class="price-item rot"><span>ROT-avdrag:</span> <span>${formatKr(p.cost_rot)}</span></div>
      </div>
      <div class="summary-price-box">
        <div class="label">Preliminärt totalpris</div>
        <div class="value">${formatKr(p.pris_totalt_ink_moms)}</div>
      </div>
    `;
  } else {
    // Startläge
    priceContent = `<div class="summary-price-box"><div class="label">Preliminärt totalpris</div><div class="value">–</div></div><small class="muted">Priset uppdateras automatiskt.</small>`;
  }

  return `
    <aside class="summary card">
      <div class="summary-header"><h2>Summering</h2><p class="muted">Dina val.</p></div>
      <div class="summary-block"><h3>Fastighet</h3><div class="summary-text">${state.address||"-"}, ${state.era}<br>${state.floor}, hiss: ${state.elevator}</div></div>
      <div class="summary-block"><h3>Badrum</h3><div class="summary-text">Golv: ${state.kvm_golv} m²</div></div>
      <div class="summary-block"><h3>Tillval</h3><ul class="summary-item-list">${listItems || '<li class="summary-item-empty">Inga valda</li>'}</ul></div>
      <div class="summary-block"><h3>Kostnad</h3>${priceContent}</div>
    </aside>`;
}


// --- VERKTYG ---
function inp(lbl, field, type="text") { return `<div class="field"><label>${lbl}</label><input type="${type}" data-field="${field}" value="${escapeHtml(state[field])}"></div>`; }
function opts(arr, sel) { return arr.map(v => `<option value="${escapeHtml(v)}" ${v===sel?"selected":""}>${escapeHtml(v)}</option>`).join(""); }
function pill(lbl, field, optsArr) { return `<div class="field field-pills"><label>${lbl}</label><div class="pill-row">${optsArr.map(o => { const active = String(state[field]) === String(o); const included = INCLUDED_OPTIONS[field]?.includes(String(o)); return `<button type="button" class="pill ${active?(included?"pill--on pill--included":"pill--on"):"pill--off"}" data-pill data-field="${field}" data-value="${escapeHtml(String(o))}">${escapeHtml(String(o))}</button>`; }).join("")}</div></div>`; }
function formatKr(num) { if (num == null || num === "") return "–"; return Math.round(Number(num)).toLocaleString("sv-SE") + " kr"; }
function escapeHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// --- EVENTS ---
function wireEvents() {
  const root = getRoot();
  if(!root) return;
  
  root.onclick = e => {
    const p = e.target.closest("[data-pill]");
    if(p) setState({[p.dataset.field]: p.dataset.value}, true);
    if(e.target.closest("[data-next]")) { if(state.step<9) setState({step:state.step+1}, true); }
    if(e.target.closest("[data-prev]")) { if(state.step>1) setState({step:state.step-1}, true); }
  };
  root.oninput = e => {
    const t = e.target;
    if(t.dataset.field) {
      let v = t.value;
      if(t.type==="range" || t.type==="number") {
        v = v===""?"":Number(v);
        if(t.classList.contains("slider-range")) t.nextElementSibling.querySelector("input").value=v;
        if(t.classList.contains("slider-number")) t.closest(".slider-container").querySelector("input").value=v;
      }
      setState({[t.dataset.field]: v}, false);
    }
  };
}

async function handleCalculate(bg) {
  if(!bg) setState({loading:true, error:""}, true);
  try {
    const payload = { ...state }; 
    delete payload.loading; delete payload.error; delete payload.priceResult; delete payload.step;
    
    const r = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const data = await r.json();
    
    if(!data.ok) throw new Error(data.error || "Kunde inte hämta pris.");
    
    state.loading=false; state.priceResult=data;
    renderSummaryOnly();
    if(state.step === 9) document.getElementById("step").innerHTML = renderStep9();

  } catch(e) {
    console.error(e);
    state.loading=false; state.error=e.message;
    renderSummaryOnly();
  }
}

// STARTA APPEN
document.addEventListener("DOMContentLoaded", () => { 
  render(); 
  wireEvents();
  handleCalculate(true); // Hämta startpriset direkt
});

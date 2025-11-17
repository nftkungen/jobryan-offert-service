// ===== Jobryan Offert Wizard – Badrum =====

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
  loading: false, error: "", priceResult: null
};

let state = { ...initialState };

// Lists
const YES_NO = ["Nej", "Ja"];
const WC_OPTS = ["Ingen WC", "Golvmonterad WC", "Väggmonterad WC"];
const INCLUDED_OPTIONS = {
  duschblandare: ["Standard"], tvattstallsblandare: ["Standard"], tvattstall_kommod: ["Kommod utan el"],
  wc: ["Ingen WC"], brunn: ["Standard"], golvvärme: ["Nej"], handdukstork: ["Nej"],
  takbelysning: ["Standard"], tvattmaskin: ["Nej"], torktumlare: ["Nej"], torkskap: ["Nej"],
  inklakat_badkar: ["Nej"], varme_vp: ["Nej"], dolda_ror: ["Nej"]
};

const TAKBELYSNING_OPTS = ["Standard", "Spotlights"];

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


// --- Render ---
function getRoot() { return document.getElementById("js-root") || document.getElementById("app"); }

function setState(patch, shouldRender = true) {
  state = { ...state, ...patch };
  if (shouldRender) render();
  else renderSummaryOnly();
  // NOTE: Removed automatic triggerLivePrice() to fix "stuck" issues.
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
  return `<div class="wizard-header"><div><h1 class="title">Offertkalkyl – Badrum</h1><p class="subtitle">Svara på några frågor så räknar vi fram ett preliminärt pris.</p><div class="step-indicator">Steg ${state.step} av ${TOTAL_STEPS}</div></div></div>`;
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

// Step 9: The calculation happens HERE when you click the button
function renderStep9() {
  const { loading, error, priceResult } = state;
  const total = calculateTotalFromParts(priceResult);
  const displayPrice = formatKr(total);

  return `
    <section class="card">
      <h2>9. Beräkna pris</h2>
      <p>Kontrollera uppgifterna nedan och klicka på knappen för att hämta pris.</p>
      
      ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}
      
      ${priceResult && priceResult.ok ? 
        `<div class="price-result">
           <h3>Preliminärt totalpris: ${displayPrice}</h3>
           <p class="muted">Priset är en uppskattning.</p>
         </div>` 
        : 
        `<div class="price-result" style="border:0; padding:0;">
           <button class="btn btn-primary" style="width:100%; justify-content:center; padding:16px;" onclick="handleCalculate(false)">
             ${loading ? "Beräknar..." : "Beräkna pris nu"}
           </button>
         </div>`
      }

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        ${priceResult && priceResult.ok ? `<button class="btn btn-primary" onclick="alert('Offert skickad!')">Skicka offert</button>` : ""}
      </div>
    </section>`;
}

function renderSummary() {
  const p = state.priceResult;
  const listItems = Object.keys(SUMMARY_LABELS).map(key => {
      const val = String(state[key]);
      const def = String(DEFAULT_VALUES[key]);
      if(!val || val === def) return null;
      if(val === "Ja") return `<li class="summary-item">${SUMMARY_LABELS[key]}</li>`;
      return `<li class="summary-item">${SUMMARY_LABELS[key]}: <strong>${escapeHtml(val)}</strong></li>`;
  }).filter(Boolean).join("");
  
  // Show "–" until the final step result is ready
  const total = calculateTotalFromParts(p);
  const displayPrice = (p && p.ok) ? formatKr(total) : "–";

  return `<aside class="summary card"><div class="summary-header"><h2>Summering</h2><p class="muted">Dina val.</p></div><div class="summary-block"><h3>Fastighet</h3><div class="summary-text">${state.address||"-"}, ${state.era}<br>${state.floor}, hiss: ${state.elevator}</div></div><div class="summary-block"><h3>Badrum</h3><div class="summary-text">Golv: ${state.kvm_golv} m²</div></div><div class="summary-block"><h3>Tillval</h3><ul class="summary-item-list">${listItems || '<li class="summary-item-empty">Inga valda</li>'}</ul></div><div class="summary-block"><h3>Kostnad</h3><div class="summary-price-box"><div class="label">Preliminärt totalpris</div><div class="value">${displayPrice}</div></div></div></aside>`;
}

// Helper Utils
function inp(lbl, field, type="text") { return `<div class="field"><label>${lbl}</label><input type="${type}" data-field="${field}" value="${escapeHtml(state[field])}"></div>`; }
function opts(arr, sel) { return arr.map(v => `<option value="${escapeHtml(v)}" ${v===sel?"selected":""}>${escapeHtml(v)}</option>`).join(""); }
function pill(lbl, field, optsArr) { return `<div class="field field-pills"><label>${lbl}</label><div class="pill-row">${optsArr.map(o => { const active = String(state[field]) === String(o); const included = INCLUDED_OPTIONS[field]?.includes(String(o)); return `<button type="button" class="pill ${active?(included?"pill--on pill--included":"pill--on"):"pill--off"}" data-pill data-field="${field}" data-value="${escapeHtml(String(o))}">${escapeHtml(String(o))}</button>`; }).join("")}</div></div>`; }

// Logic
function calculateTotalFromParts(p) {
  if (!p || !p.ok) return null;
  const parse = v => { if (!v) return 0; const s = String(v).replace(/\s| /g, "").replace(",", "."); const n = Number(s); return isNaN(n) ? 0 : n; };
  if (p.pris_totalt_ink_moms) { const t = parse(p.pris_totalt_ink_moms); if (t > 0) return t; }
  const arb = parse(p.pris_arbete_ex_moms);
  const mat = parse(p.pris_grundmaterial_ex_moms);
  const res = parse(p.pris_resekostnad_ex_moms);
  const sop = parse(p.pris_sophantering_ex_moms);
  const sumEx = arb + mat + res + sop;
  return sumEx === 0 ? null : sumEx * 1.25;
}

function formatKr(num) {
  if (num == null) return "–";
  return Math.round(num).toLocaleString("sv-SE") + " kr";
}
function escapeHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// Events
function wireEvents() {
  const root = getRoot();
  if(!root) return;
  
  // Attach global calculation handler to window so the button onclick works
  window.handleCalculate = handleCalculate;

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
  setState({loading:true, error:""}, true);
  try {
    const payload = { ...state }; 
    delete payload.loading; delete payload.error; delete payload.priceResult; delete payload.step;
    
    const r = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const data = await r.json();
    console.log("Sheet data:", data);
    
    if(!data.ok) throw new Error(data.error || "Kunde inte hämta pris.");
    
    state.loading=false; 
    state.priceResult=data;
    
    // Force re-render of step 9 to show result
    document.getElementById("step").innerHTML = renderStep9();
    renderSummaryOnly();
    
  } catch(e) {
    console.error(e);
    state.loading=false; 
    state.error=e.message;
    document.getElementById("step").innerHTML = renderStep9();
    renderSummaryOnly();
  }
}

document.addEventListener("DOMContentLoaded", () => { render(); wireEvents(); });

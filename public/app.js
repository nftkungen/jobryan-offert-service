// ===== Jobryan Offert Wizard – Badrum =====

// API endpoint
const API_URL = "/api/estimate/badrum";

// All state for the wizard
const initialState = {
  step: 1,                 // 1-9

  // --- Kontakt + fastighet (steg 1) ---
  kund_namn: "",
  kund_tel: "",
  kund_email: "",
  address: "",
  propertyType: "Lägenhet",
  era: "60-tal",
  floor: "3 tr",
  elevator: "Stor",

  // --- Storlek (steg 1) ---
  postnummer: "",
  zon: "3",
  kvm_golv: 8.5,
  kvm_vagg: "",
  takhojd: 2.4,

  // --- Ytskikt (steg 2) ---
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  gerade_horn_meter: "0",
  fyll_i_antal_meter: "0",

  // --- Snickeri (steg 3) ---
  ny_troskel: "Nej",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  
  // --- Inredning (steg 4) ---
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Nej",

  // --- Rivning & Väggar (steg 5) ---
  rivning_vaggar: "0",
  nya_vaggar_material: "Nej / bestäms senare",
  
  // --- VVS (steg 6) ---
  dolda_ror: "Nej",
  wc: "Ingen WC",
  byte_av_avloppsgroda: "Nej",
  ny_slitsbotten: "Nej",
  brunn: "Standard",
  duschblandare: "Standard",
  tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el",
  inklakat_badkar: "Nej",
  
  // --- Maskiner & Värme (steg 7) ---
  tvattmaskin: "Nej",
  torktumlare: "Nej",
  torkskap: "Nej",
  varme_vp: "Nej",
  golvvärme: "Nej",
  handdukstork: "Nej",

  // --- El (steg 8) ---
  takbelysning: "Plafond",
  spotlight_antal: "0",

  // --- API-resultat (steg 9) ---
  loading: false,
  error: "",
  priceResult: null
};

let state = { ...initialState };

// --------- OPTION LISTS ----------

const YES_NO = ["Nej", "Ja"];
const WC_OPTS = ["Ingen WC", "Golvmonterad WC", "Väggmonterad WC"];
const TAKBELYSNING_OPTS = ["Plafond", "Spots i tak"];

const INCLUDED_OPTIONS = {
  duschblandare: ["Standard"],
  tvattstallsblandare: ["Standard"],
  tvattstall_kommod: ["Kommod utan el"],
  wc: ["Ingen WC"],
  brunn: ["Standard"],
  golvvärme: ["Nej"],
  handdukstork: ["Nej"],
  takbelysning: ["Plafond"],
  tvattmaskin: ["Nej"],
  torktumlare: ["Nej"],
  torkskap: ["Nej"],
  inklakat_badkar: ["Nej"],
  varme_vp: ["Nej"],
  dolda_ror: ["Nej"]
};

// Labels for the dynamic summary
const SUMMARY_LABELS = {
  // Ytskikt
  microcement_golv: "Microcement golv",
  microcement_vagg: "Microcement vägg",
  gerade_horn_meter: "Gerade hörn",
  fyll_i_antal_meter: "Fris",
  // Snickeri
  ny_troskel: "Ny tröskel",
  byta_dorrblad: "Byte av dörrblad",
  byta_karm_dorr: "Byte av karm + dörr",
  slipning_dorr: "Slipning av dörr",
  // Inredning
  bankskiva_ovan_tm_tt: "Bänkskiva",
  vaggskap: "Väggskåp",
  nytt_innertak: "Nytt innertak",
  // Rivning
  rivning_vaggar: "Rivning väggar",
  nya_vaggar_material: "Nya väggar",
  // VVS
  dolda_ror: "Dolda rör",
  wc: "WC",
  byte_av_avloppsgroda: "Byte av avloppsgroda",
  ny_slitsbotten: "Ny slitsbotten",
  brunn: "Brunn",
  duschblandare: "Duschblandare",
  tvattstallsblandare: "Tvättställsblandare",
  tvattstall_kommod: "Kommod",
  inklakat_badkar: "Inklätt badkar",
  // Maskiner
  tvattmaskin: "Tvättmaskin",
  torktumlare: "Torktumlare",
  torkskap: "Torkskåp",
  varme_vp: "Värme VP",
  golvvärme: "Golvvärme",
  handdukstork: "Handdukstork",
  // El
  takbelysning: "Takbelysning",
  spotlight_antal: "Spotlights",
};

const DEFAULT_VALUES = {
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  gerade_horn_meter: "0",
  fyll_i_antal_meter: "0",
  ny_troskel: "Nej",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Nej",
  rivning_vaggar: "0",
  nya_vaggar_material: "Nej / bestäms senare",
  dolda_ror: "Nej",
  wc: "Ingen WC",
  byte_av_avloppsgroda: "Nej",
  ny_slitsbotten: "Nej",
  brunn: "Standard",
  duschblandare: "Standard",
  tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el",
  inklakat_badkar: "Nej",
  tvattmaskin: "Nej",
  torktumlare: "Nej",
  torkskap: "Nej",
  varme_vp: "Nej",
  golvvärme: "Nej",
  handdukstork: "Nej",
  takbelysning: "Plafond",
  spotlight_antal: "0",
};


// ---------- RENDER ROOT ----------

function getRoot() {
  return (
    document.getElementById("js-root") ||
    document.getElementById("app") ||
    document.getElementById("app-root")
  );
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function render() {
  const root = getRoot();
  if (!root) return;

  root.innerHTML = `
    <div class="layout">
      <div class="wizard">
        ${renderHeader()}
        ${renderStep()}
      </div>
      ${renderSummary()}
    </div>
  `;

  wireEvents();
}

const TOTAL_STEPS = 9;

function renderHeader() {
  return `
    <div class="wizard-header">
      <div>
        <h1 class="title">Offertkalkyl – Badrum</h1>
        <p class="subtitle">Svara på några frågor så räknar vi fram ett preliminärt pris.</p>
        <div class="step-indicator">Steg ${state.step} av ${TOTAL_STEPS}</div>
      </div>
    </div>
  `;
}

// ---------- STEP CONTENT ----------

function renderStep() {
  switch (state.step) {
    case 1:
      return renderStep1_Grunddata(); 
    case 2:
      return renderStep2_Ytskikt();
    case 3:
      return renderStep3_Snickeri();
    case 4:
      return renderStep4_Inredning();
    case 5:
      return renderStep5_Rivning();
    case 6:
      return renderStep6_VVS();
    case 7:
      return renderStep7_Maskiner();
    case 8:
      return renderStep8_El();
    case 9:
      return renderStep9_Pris();
    default:
      return "";
  }
}

// --- Step 1: Grunddata & Fastighet ---
function renderStep1_Grunddata() {
  return `
    <section class="card">
      <h2>1. Grunddata & Fastighet</h2>
      
      <h3 class="section-title" style="margin-top:0;">Kontakt & Adress</h3>
      <div class="grid grid-2">
        <div class="field">
          <label>Namn</label>
          <input type="text" data-field="kund_namn" value="${escapeHtml(state.kund_namn)}" placeholder="För- och efternamn">
        </div>
        <div class="field">
          <label>Telefon</label>
          <input type="text" data-field="kund_tel" value="${escapeHtml(state.kund_tel)}" placeholder="070-xxx xx xx">
        </div>
        <div class="field">
          <label>E-post</label>
          <input type="email" data-field="kund_email" value="${escapeHtml(state.kund_email)}" placeholder="namn@email.se">
        </div>
        <div class="field">
          <label>Adress</label>
          <input type="text" data-field="address" value="${escapeHtml(state.address)}" placeholder="Gatuadress">
        </div>
        <div class="field">
          <label>Postnummer</label>
          <input type="text" data-field="postnummer" value="${escapeHtml(state.postnummer)}" placeholder="123 45">
        </div>
        <div class="field">
          <label>Zon (1–4)</label>
          <select data-field="zon">
            ${selectOptions(["1", "2", "3", "4"], String(state.zon))}
          </select>
        </div>
      </div>

      <h3 class="section-title">Fastighet & Storlek</h3>
      <div class="grid grid-2">
        <div class="field">
          <label>Fastighetstyp</label>
          <select data-field="propertyType">
            ${selectOptions(["Villa", "Lägenhet", "Radhus"], state.propertyType)}
          </select>
        </div>
        <div class="field">
          <label>Byggår / era</label>
          <select data-field="era">
            ${selectOptions(["20-tal", "30-tal", "40-tal", "50-tal", "60-tal", "70-tal", "80-tal", "90-tal", "2000-tal"], state.era)}
          </select>
        </div>
        <div class="field">
          <label>Våningsplan</label>
          <select data-field="floor">
            ${selectOptions(["BV", "1 tr", "2 tr", "3 tr", "4 tr", "5 tr+"], state.floor)}
          </select>
        </div>
        <div class="field">
          <label>Hiss</label>
          <select data-field="elevator">
            ${selectOptions(["Ingen", "Liten", "Stor"], state.elevator)}
          </select>
        </div>

        <div class="field" style="grid-column: 1 / -1;">
          <label>Storlek (golvyta)</label>
          <div class="slider-container">
             <input type="range" min="2" max="20" step="0.5" 
                    data-field="kvm_golv" value="${state.kvm_golv}" class="slider-range">
             <div class="slider-input-wrap">
               <input type="number" min="0" step="0.1" 
                      data-field="kvm_golv" value="${state.kvm_golv}" class="slider-number">
               <span class="suffix">m²</span>
             </div>
          </div>
        </div>

        <div class="field">
          <label>Väggyta (m²)</label>
          <input type="number" data-field="kvm_vagg" value="${state.kvm_vagg}" placeholder="t.ex. 30">
        </div>
        
        <div class="field">
          <label>Takhöjd (m)</label>
          <input type="number" step="0.1" data-field="takhojd" value="${state.takhojd}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 2 – Ytskikt ---
function renderStep2_Ytskikt() {
  return `
    <section class="card">
      <h2>2. Ytskikt</h2>
      <p class="muted">Välj ytskikt för golv och väggar.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Microcement golv", "microcement_golv", YES_NO)}
        ${pillGroup("Microcement vägg", "microcement_vagg", YES_NO)}
        ${pillGroup("Gerade hörn (meter)", "gerade_horn_meter", ["0", "2", "4", "6", "8", "10", "12"])}
        <div class="field">
          <label>Fyll i antal meter fris</label>
          <input type="number" data-field="fyll_i_antal_meter" value="${state.fyll_i_antal_meter}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 3 – Snickeri ---
function renderStep3_Snickeri() {
  return `
    <section class="card">
      <h2>3. Snickeri (Dörrar & Tröskel)</h2>
      <p class="muted">Behöver dörr, karm eller tröskel åtgärdas?</p>
      
      <div class="grid grid-2">
        ${pillGroup("Ny tröskel", "ny_troskel", YES_NO)}
        ${pillGroup("Byta dörrblad", "byta_dorrblad", YES_NO)}
        ${pillGroup("Byta karm + dörr", "byta_karm_dorr", YES_NO)}
        ${pillGroup("Slipning dörr", "slipning_dorr", YES_NO)}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 4 – Inredning ---
function renderStep4_Inredning() {
  return `
    <section class="card">
      <h2>4. Inredning & Tak</h2>
      <p class="muted">Fast inredning som skåp och bänkskivor.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Bänkskiva ovan TM/TT", "bankskiva_ovan_tm_tt", YES_NO)}
        ${pillGroup("Väggskåp", "vaggskap", YES_NO)}
        ${pillGroup("Nytt innertak", "nytt_innertak", YES_NO)}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 5 – Rivning & Väggar ---
function renderStep5_Rivning() {
  return `
    <section class="card">
      <h2>5. Rivning & Nya Väggar</h2>
      <p class="muted">Ska befintliga väggar rivas eller nya byggas?</p>
      
      <div class="grid grid-2">
        ${pillGroup("Rivning av väggar (antal)", "rivning_vaggar", ["0", "1", "2", "3", "4"])}
        ${pillGroup("Nya väggar (material)", "nya_vaggar_material", ["Nej / bestäms senare", "Lättvägg", "Massiv"])}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 6 – VVS ---
function renderStep6_VVS() {
  return `
    <section class="card">
      <h2>6. VVS (Rör & Installationer)</h2>
      <p class="muted">Välj VVS-installationer.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Dolda rör (enbart arbete)", "dolda_ror", YES_NO)}
        ${pillGroup("WC", "wc", WC_OPTS)}
        ${pillGroup("Byte av avloppsgroda", "byte_av_avloppsgroda", YES_NO)}
        ${pillGroup("Ny slitsbotten", "ny_slitsbotten", YES_NO)}
        ${pillGroup("Brunn", "brunn", ["Standard", "Övrigt"])}
        ${pillGroup("Duschblandare", "duschblandare", ["Standard", "Inbyggnadsdusch"])}
        ${pillGroup("Tvättställsblandare", "tvattstallsblandare", ["Standard", "Övrigt"])}
        ${pillGroup("Tvättställ / kommod", "tvattstall_kommod", ["Kommod utan el", "Med el / special"])}
        ${pillGroup("Inkläkat badkar", "inklakat_badkar", YES_NO)}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 7 – Maskiner & Värme ---
function renderStep7_Maskiner() {
  return `
    <section class="card">
      <h2>7. Maskiner & Värme</h2>
      <p class="muted">Värme och anslutning av maskiner.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Tvättmaskin", "tvattmaskin", YES_NO)}
        ${pillGroup("Torktumlare", "torktumlare", YES_NO)}
        ${pillGroup("Torkskåp", "torkskap", YES_NO)}
        ${pillGroup("Värmepump / värme", "varme_vp", YES_NO)}
        ${pillGroup("Golvvärme", "golvvärme", YES_NO)}
        ${pillGroup("Handdukstork", "handdukstork", YES_NO)}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 8 – El ---
function renderStep8_El() {
  return `
    <section class="card">
      <h2>8. El & Belysning</h2>
      <p class="muted">Välj typ av belysning.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Takbelysning", "takbelysning", TAKBELYSNING_OPTS)}
        <div class="field">
          <label>Spotlight antal</label>
          <input type="number" min="0" step="1" data-field="spotlight_antal" value="${state.spotlight_antal}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 9 – Beräkna pris ---
function renderStep9_Pris() {
  const { loading, error, priceResult } = state;

  return `
    <section class="card">
      <h2>9. Beräkna pris</h2>
      <p>Nu kan du beräkna ett preliminärt pris baserat på dina val.</p>

      ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-calc ${loading ? "disabled" : ""}>
          ${loading ? "Beräknar..." : "Beräkna pris"}
        </button>
      </div>

      ${
        priceResult && priceResult.ok
          ? `
            <div class="price-result">
              <h3>Preliminärt totalpris</h3>
              <p class="price">${formatKr(priceResult.pris_totalt_ink_moms)}</p>
              <ul class="price-breakdown">
                <li><strong>Arbete exkl. moms:</strong> ${formatKr(priceResult.pris_arbete_ex_moms)}</li>
                <li><strong>Grundmaterial exkl. moms:</strong> ${formatKr(priceResult.pris_grundmaterial_ex_moms)}</li>
                <li><strong>Resekostnad exkl. moms:</strong> ${formatKr(priceResult.pris_resekostnad_ex_moms)}</li>
              </ul>
              <p class="muted">Säljare från Jobryan kontaktar dig för att gå igenom detaljer och ta fram en skarp offert.</p>
            </div>
          `
          : ""
      }
    </section>
  `;
}

// ---------- PILL HELPERS ----------

function pillGroup(label, field, options) {
  const value = String(state[field] ?? "");

  return `
    <div class="field field-pills">
      <label>${label}</label>
      <div class="pill-row">
        ${options
          .map((opt) => {
            const isActive = value === String(opt);
            const includedList = INCLUDED_OPTIONS[field] || [];
            const isIncluded = includedList.includes(String(opt));
            const classes = ["pill"];

            if (isActive) {
              classes.push("pill--on");
              if (isIncluded) classes.push("pill--included");
            } else {
              classes.push("pill--off");
            }

            return `
              <button
                type="button"
                class="${classes.join(" ")}"
                data-pill
                data-field="${field}"
                data-value="${escapeHtml(String(opt))}">
                ${escapeHtml(String(opt))}
              </button>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

// ---------- SUMMARY CARD ----------

function renderSummary() {
  const p = state.priceResult;

  const selectedOptions = Object.keys(SUMMARY_LABELS)
    .map(key => {
      const value = String(state[key]);
      const defaultValue = String(DEFAULT_VALUES[key]);
      
      if (!value || value === defaultValue) return null;
      
      const label = SUMMARY_LABELS[key];
      if (value === "Ja") return `<li class="summary-item">${label}</li>`;
      
      return `<li class="summary-item">${label}: <strong>${escapeHtml(value)}</strong></li>`;
    })
    .filter(Boolean);

  return `
    <aside class="summary card">
      <div class="summary-header">
        <h2>Summering</h2>
        <p class="muted">Dina val visas här allt eftersom.</p>
      </div>

      <div class="summary-block">
        <h3>Fastighetsinfo</h3>
        <div class="summary-text">
          ${state.address ? escapeHtml(state.address) : "Adress ej angiven"}<br>
          ${escapeHtml(state.propertyType)}, ${escapeHtml(state.era)}<br>
          Våningsplan: ${escapeHtml(state.floor)}, hiss: ${escapeHtml(state.elevator)}
        </div>
      </div>

      <div class="summary-block">
        <h3>Badrum</h3>
        <div class="summary-text">
          Golv: ${state.kvm_golv || "-"} m² · Vägg: ${state.kvm_vagg || "-"} m² · Takhöjd: ${state.takhojd || "-"} m<br>
          Zon: ${state.zon || "-"}
        </div>
      </div>
      
      <div class="summary-block">
        <h3>Valda Tillval</h3>
        <ul class="summary-item-list">
          ${selectedOptions.length > 0 ? selectedOptions.join("") : `<li class="summary-item-empty">Inga tillval valda.</li>`}
        </ul>
      </div>

      <div class="summary-block">
        <h3>Kostnadsuppdelning</h3>
        ${
          p && p.ok
            ? `
              <div class="summary-price-box">
                <div class="label">Preliminärt totalpris</div>
                <div class="value">${formatKr(p.pris_totalt_ink_moms)}</div>
              </div>
              <small class="muted">
                Priset är en uppskattning. Vi kontaktar dig för en skarp offert.
              </small>
            `
            : `<small class="muted">Priset beräknas i sista steget.</small>`
        }
      </div>
    </aside>
  `;
}

// ---------- WIRING EVENTS ----------

function wireEvents() {
  const root = getRoot();
  if (!root) return;

  root.querySelectorAll("input[data-field], select[data-field]").forEach((el) => {
    el.addEventListener("input", (e) => {
      const field = e.target.dataset.field;
      let value = e.target.value;
      if (e.target.type === "number" || e.target.type === "range") {
        value = value === "" ? "" : Number(value);
      }
      setState({ [field]: value });
    });
  });

  root.querySelectorAll("[data-pill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.field;
      const value = btn.dataset.value;
      setState({ [field]: value });
    });
  });

  const nextBtn = root.querySelector("[data-next]");
  if (nextBtn) nextBtn.addEventListener("click", handleNext);

  const prevBtn = root.querySelector("[data-prev]");
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);

  const calcBtn = root.querySelector("[data-calc]");
  if (calcBtn) calcBtn.addEventListener("click", handleCalculate);
}

function handleNext() {
  if (state.step < TOTAL_STEPS) {
    setState({ step: state.step + 1 });
  }
}

function handlePrev() {
  if (state.step > 1) {
    setState({ step: state.step - 1 });
  }
}

async function handleCalculate() {
  try {
    setState({ loading: true, error: "" });

    const payload = {
      kund_namn: state.kund_namn,
      kund_tel: state.kund_tel,
      kund_email: state.kund_email,
      address: state.address,
      propertyType: state.propertyType,
      era: state.era,
      floor: state.floor,
      elevator: state.elevator,
      postnummer: state.postnummer,
      zon: Number(state.zon) || 0,
      kvm_golv: Number(state.kvm_golv) || 0,
      kvm_vagg: Number(state.kvm_vagg) || 0,
      takhojd: Number(state.takhojd) || 0,
      microcement_golv: state.microcement_golv,
      microcement_vagg: state.microcement_vagg,
      gerade_horn_meter: Number(state.gerade_horn_meter) || 0,
      fyll_i_antal_meter: Number(state.fyll_i_antal_meter) || 0,
      ny_troskel: state.ny_troskel,
      byta_dorrblad: state.byta_dorrblad,
      byta_karm_dorr: state.byta_karm_dorr,
      slipning_dorr: state.slipning_dorr,
      bankskiva_ovan_tm_tt: state.bankskiva_ovan_tm_tt,
      vaggskap: state.vaggskap,
      nytt_innertak: state.nytt_innertak,
      rivning_vaggar: Number(state.rivning_vaggar) || 0,
      nya_vaggar_material: state.nya_vaggar_material,
      dolda_ror: state.dolda_ror,
      wc: state.wc,
      byte_av_avloppsgroda: state.byte_av_avloppsgroda,
      ny_slitsbotten: state.ny_slitsbotten,
      brunn: state.brunn,
      duschblandare: state.duschblandare,
      tvattstallsblandare: state.tvattstallsblandare,
      tvattstall_kommod: state.tvattstall_kommod,
      inklakat_badkar: state.inklakat_badkar,
      tvattmaskin: state.tvattmaskin,
      torktumlare: state.torktumlare,
      torkskap: state.torkskap,
      varme_vp: state.varme_vp,
      golvvärme: state.golvvärme,
      handdukstork: state.handdukstork,
      takbelysning: state.takbelysning,
      spotlight_antal: Number(state.spotlight_antal) || 0,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || "Beräkningen misslyckades");
    }

    setState({ loading: false, priceResult: data });
  } catch (err) {
    console.error(err);
    setState({
      loading: false,
      error: err.message || "Något gick fel vid beräkningen"
    });
  }
}

function selectOptions(list, selected) {
  return list.map(v => `<option value="${escapeHtml(v)}" ${v === selected ? "selected" : ""}>${escapeHtml(v)}</option>`).join("");
}

function formatKr(value) {
  if (value == null || value === "" || isNaN(Number(value))) return "–";
  const n = Math.round(Number(value));
  return n.toLocaleString("sv-SE") + " kr";
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", render);

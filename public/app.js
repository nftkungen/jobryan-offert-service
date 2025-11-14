// ===== Jobryan Offert Wizard – Badrum =====

// API endpoint (relative – works on Render when frontend & backend are same app)
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

  // --- Storlek (steg 2) ---
  postnummer: "",
  zon: "3",
  kvm_golv: 8.5,
  kvm_vagg: "",
  takhojd: 2.4,

  // --- Ytskikt (steg 3) ---
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  gerade_horn_meter: "0",
  fyll_i_antal_meter: "0",

  // --- Snickeri (steg 4) ---
  ny_troskel: "Nej",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  
  // --- Inredning (steg 5) ---
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Nej",

  // --- Rivning & Väggar (steg 6) ---
  rivning_vaggar: "0",
  nya_vaggar_material: "Nej / bestäms senare",
  
  // --- VVS (steg 7) ---
  dolda_ror: "Nej",
  wc: "Ingen WC",
  byte_av_avloppsgroda: "Nej",
  ny_slitsbotten: "Nej",
  brunn: "Standard",
  duschblandare: "Standard",
  tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el",
  inklakat_badkar: "Nej",
  
  // --- Maskiner & Värme (steg 8) ---
  tvattmaskin: "Nej",
  torktumlare: "Nej",
  torkskap: "Nej",
  varme_vp: "Nej",
  golvvärme: "Nej",
  handdukstork: "Nej",

  // --- El (steg 9) ---
  takbelysning: "Plafond",
  spotlight_antal: "0",

  // --- API-resultat (steg 10) ---
  loading: false,
  error: "",
  priceResult: null
};

let state = { ...initialState };

// --------- OPTION LISTS ----------

// Small helpers to avoid typos
const YES_NO = ["Nej", "Ja"];
const WC_OPTS = ["Ingen WC", "Golvmonterad WC", "Väggmonterad WC"];
const TAKBELYSNING_OPTS = ["Plafond", "Spots i tak"];

// Which choices are “ingår i grundpris” (green when selected)
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

// Default values to ignore in summary
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

const TOTAL_STEPS = 10;

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
      return renderStep1();
    case 2:
      return renderStep2();
    case 3:
      return renderStep3_Ytskikt();
    case 4:
      return renderStep4_Snickeri();
    case 5:
      return renderStep5_Inredning();
    case 6:
      return renderStep6_Rivning();
    case 7:
      return renderStep7_VVS();
    case 8:
      return renderStep8_Maskiner();
    case 9:
      return renderStep9_El();
    case 10:
      return renderStep10_Pris();
    default:
      return "";
  }
}

// --- Step 1 – Fastighet + kontakt ---
function renderStep1() {
  return `
    <section class="card">
      <h2>1. Fastighetsinformation</h2>
      <div class="grid grid-2">
        <div class="field">
          <label>Namn</label>
          <input type="text" data-field="kund_namn" value="${escapeHtml(
            state.kund_namn
          )}" placeholder="För- och efternamn">
        </div>
        <div class="field">
          <label>Telefon</label>
          <input type="text" data-field="kund_tel" value="${escapeHtml(
            state.kund_tel
          )}" placeholder="t.ex. 070-123 45 67">
        </div>
        <div class="field">
          <label>E-post</label>
          <input type="email" data-field="kund_email" value="${escapeHtml(
            state.kund_email
          )}" placeholder="din@adress.se">
        </div>
        <div class="field">
          <label>Adress</label>
          <input type="text" data-field="address" value="${escapeHtml(
            state.address
          )}" placeholder="t.ex. Slätbaksvägen 17">
        </div>

        <div class="field">
          <label>Fastighetstyp</label>
          <select data-field="propertyType">
            ${selectOptions(
              ["Villa", "Lägenhet", "Radhus"],
              state.propertyType
            )}
          </select>
        </div>

        <div class="field">
          <label>Byggår / era</label>
          <select data-field="era">
            ${selectOptions(
              ["20-tal", "30-tal", "40-tal", "50-tal", "60-tal", "70-tal", "80-tal", "90-tal", "2000-tal"],
              state.era
            )}
          </select>
        </div>

        <div class="field">
          <label>Våningsplan</label>
          <select data-field="floor">
            ${selectOptions(
              ["BV", "1 tr", "2 tr", "3 tr", "4 tr", "5 tr+"],
              state.floor
            )}
          </select>
        </div>

        <div class="field">
          <label>Hiss</label>
          <select data-field="elevator">
            ${selectOptions(["Ingen", "Liten", "Stor"], state.elevator)}
          </select>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 2 – Storlek & grunddata ---
function renderStep2() {
  return `
    <section class="card">
      <h2>2. Storlek och grunddata</h2>
      <div class="grid grid-2">
        <div class="field">
          <label>Postnummer</label>
          <input type="text" data-field="postnummer" value="${escapeHtml(
            state.postnummer
          )}" placeholder="t.ex. 12051">
        </div>

        <div class="field">
          <label>Zone (1–4)</label>
          <select data-field="zon">
            ${selectOptions(["1", "2", "3", "4"], String(state.zon))}
          </select>
          <small class="help">För att beräkna resekostnad</small>
        </div>

        <div class="field field-slider">
          <label>Storlek (golvyta)</label>
          <input type="range" min="2" max="20" step="0.5"
                 data-field="kvm_golv" value="${state.kvm_golv}">
          <div class="slider-value">${state.kvm_golv} m²</div>
        </div>

        <div class="field">
          <label>Väggyta (m²)</label>
          <input type="number" data-field="kvm_vagg"
                 value="${state.kvm_vagg}"
                 placeholder="t.ex. 30">
        </div>

        <div class="field">
          <label>Takhöjd (m)</label>
          <input type="number" step="0.1" data-field="takhojd"
                 value="${state.takhojd}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 3 – Ytskikt ---
function renderStep3_Ytskikt() {
  return `
    <section class="card">
      <h2>3. Ytskikt</h2>
      <p class="muted">Välj ytskikt för golv och väggar.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Microcement golv", "microcement_golv", YES_NO)}
        ${pillGroup("Microcement vägg", "microcement_vagg", YES_NO)}
        ${pillGroup("Gerade hörn (meter)", "gerade_horn_meter", [
          "0", "2", "4", "6", "8", "10", "12"
        ])}
        <div class="field">
          <label>Fyll i antal meter fris</label>
          <input type="number" data-field="fyll_i_antal_meter"
                 value="${state.fyll_i_antal_meter}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 4 – Snickeri ---
function renderStep4_Snickeri() {
  return `
    <section class="card">
      <h2>4. Snickeri (Dörrar & Tröskel)</h2>
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

// --- Step 5 – Inredning ---
function renderStep5_Inredning() {
  return `
    <section class="card">
      <h2>5. Inredning & Tak</h2>
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

// --- Step 6 – Rivning & Väggar ---
function renderStep6_Rivning() {
  return `
    <section class="card">
      <h2>6. Rivning & Nya Väggar</h2>
      <p class="muted">Ska befintliga väggar rivas eller nya byggas?</p>
      
      <div class="grid grid-2">
        ${pillGroup("Rivning av väggar (antal)", "rivning_vaggar", [
          "0", "1", "2", "3", "4"
        ])}
        ${pillGroup(
          "Nya väggar (material)",
          "nya_vaggar_material",
          ["Nej / bestäms senare", "Lättvägg", "Massiv"]
        )}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 7 – VVS ---
function renderStep7_VVS() {
  return `
    <section class="card">
      <h2>7. VVS (Rör & Installationer)</h2>
      <p class="muted">Välj VVS-installationer.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Dolda rör (enbart arbete)", "dolda_ror", YES_NO)}
        ${pillGroup("WC", "wc", WC_OPTS)}
        ${pillGroup("Byte av avloppsgroda", "byte_av_avloppsgroda", YES_NO)}
        ${pillGroup("Ny slitsbotten", "ny_slitsbotten", YES_NO)}
        ${pillGroup("Brunn", "brunn", ["Standard", "Övrigt"])}
        ${pillGroup("Duschblandare", "duschblandare", [
          "Standard",
          "Inbyggnadsdusch"
        ])}
        ${pillGroup("Tvättställsblandare", "tvattstallsblandare", [
          "Standard",
          "Övrigt"
        ])}
        ${pillGroup("Tvättställ / kommod", "tvattstall_kommod", [
          "Kommod utan el",
          "Med el / special"
        ])}
        ${pillGroup("Inkläkat badkar", "inklakat_badkar", YES_NO)}
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

// --- Step 8 – Maskiner & Värme ---
function renderStep8_Maskiner() {
  return `
    <section class="card">
      <h2>8. Maskiner & Värme</h2>
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

// --- Step 9 – El ---
function renderStep9_El() {
  return `
    <section class="card">
      <h2>9. El & Belysning</h2>
      <p class="muted">Välj typ av belysning.</p>
      
      <div class="grid grid-2">
        ${pillGroup("Takbelysning", "takbelysning", TAKBELYSNING_OPTS)}
        <div class="field">
          <label>Spotlight antal</label>
          <input type="number" min="0" step="1"
                 data-field="spotlight_antal"
                 value="${state.spotlight_antal}">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}


// --- Step 10 – Beräkna pris ---
function renderStep10_Pris() {
  const { loading, error, priceResult } = state;

  return `
    <section class="card">
      <h2>10. Beräkna pris</h2>
      <p>Nu kan du beräkna ett preliminärt pris baserat på dina val.</p>

      ${
        error
          ? `<div class="alert alert-error">${escapeHtml(error)}</div>`
          : ""
      }

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-calc ${
          loading ? "disabled" : ""
        }>
          ${loading ? "Beräknar..." : "Beräkna pris"}
        </button>
      </div>

      ${
        priceResult && priceResult.ok
          ? `
            <div class="price-result">
              <h3>Preliminärt totalpris</h3>
              <p class="price">
                ${formatKr(priceResult.pris_totalt_ink_moms)}
              </p>
              <ul class="price-breakdown">
                <li><strong>Arbete exkl. moms:</strong> ${formatKr(
                  priceResult.pris_arbete_ex_moms
                )}</li>
                <li><strong>Grundmaterial exkl. moms:</strong> ${formatKr(
                  priceResult.pris_grundmaterial_ex_moms
                )}</li>
                <li><strong>Resekostnad exkl. moms:</strong> ${formatKr(
                  priceResult.pris_resekostnad_ex_moms
                )}</li>
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

  // Build the dynamic list of selected options
  const selectedOptions = Object.keys(SUMMARY_LABELS)
    .map(key => {
      const value = String(state[key]);
      const defaultValue = String(DEFAULT_VALUES[key]);
      
      // Ignore if value is default (e.g., "Nej", "0", "Standard")
      if (!value || value === defaultValue) {
        return null;
      }
      
      const label = SUMMARY_LABELS[key];
      
      // For "Ja" values, just show the label
      if (value === "Ja") {
        return `<li class="summary-item">${label}</li>`;
      }
      
      // For other values (like numbers or specific choices), show "Label: Value"
      return `<li class="summary-item">${label}: <strong>${escapeHtml(value)}</strong></li>`;
    })
    .filter(Boolean); // Remove null entries

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
          ${escapeHtml(state.propertyType)}, ${escapeHtml(
    state.era
  )}<br>
          Våningsplan: ${escapeHtml(state.floor)}, hiss: ${escapeHtml(
    state.elevator
  )}
        </div>
      </div>

      <div class="summary-block">
        <h3>Badrum</h3>
        <div class="summary-text">
          Golv: ${state.kvm_golv || "-"} m² · Vägg: ${
    state.kvm_vagg || "-"
  } m² · Takhöjd: ${state.takhojd || "-"} m<br>
          Zon: ${state.zon || "-"}
        </div>
      </div>
      
      <div class="summary-block">
        <h3>Valda Tillval</h3>
        <ul class="summary-item-list">
          ${
            selectedOptions.length > 0
              ? selectedOptions.join("")
              : `<li class="summary-item-empty">Inga tillval valda.</li>`
          }
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
            : `<small class="muted">
                Priset beräknas i sista steget.
              </small>`
        }
      </div>
    </aside>
  `;
}

// ---------- WIRING EVENTS ----------

function wireEvents() {
  const root = getRoot();
  if (!root) return;

  // Text / number / select inputs
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

  // Pills
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

    const payload = { ...initialState, ...state }; // Send all state
    delete payload.loading;
    delete payload.error;
    delete payload.priceResult;

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

// ---------- SMALL UTILS ----------

function selectOptions(list, selected) {
  return list
    .map(
      (v) =>
        `<option value="${escapeHtml(v)}" ${
          v === selected ? "selected" : ""
        }>${escapeHtml(v)}</option>`
    )
    .join("");
}

function formatKr(value) {
  if (value == null || value === "" || isNaN(Number(value))) return "–";
  const n = Math.round(Number(value));
  return n.toLocaleString("sv-SE") + " kr";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", render);

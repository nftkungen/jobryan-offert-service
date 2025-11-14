// ===== Jobryan Offert Wizard – Badrum =====

// API endpoint (relative – works on Render when frontend & backend are same app)
const API_URL = "/api/estimate/badrum";

// All state for the wizard
const initialState = {
  step: 1,                 // 1-5

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

  // --- Snickeri / ytskikt (steg 3) ---
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  ny_troskel: "Nej",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Nej",
  rivning_vaggar: "0",
  nya_vaggar_material: "Nej / bestäms senare",
  gerade_horn_meter: "0",
  fyll_i_antal_meter: "0",

  // --- VVS (steg 4) ---
  dolda_ror: "Nej",
  wc: "Ingen WC",
  byte_av_avloppsgroda: "Nej",
  ny_slitsbotten: "Nej",
  brunn: "Standard",
  duschblandare: "Standard",
  tvattstallsblandare: "Standard",
  tvattstall_kommod: "Kommod utan el",
  tvattmaskin: "Nej",
  torktumlare: "Nej",
  torkskap: "Nej",
  inklakat_badkar: "Nej",
  varme_vp: "Nej",

  // --- El (steg 4) ---
  takbelysning: "Plafond",
  spotlight_antal: "0",
  golvvärme: "Nej",
  handdukstork: "Nej",

  // --- API-resultat (steg 5) ---
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

function renderHeader() {
  return `
    <div class="wizard-header">
      <div>
        <h1 class="title">Offertkalkyl – Badrum</h1>
        <p class="subtitle">Svara på några frågor så räknar vi fram ett preliminärt pris.</p>
        <div class="step-indicator">Steg ${state.step} av 5</div>
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
      return renderStep3_Snickeri();
    case 4:
      return renderStep4_VvsEl();
    case 5:
      return renderStep5_Pris();
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

// --- Step 3 – Snickeri ---
function renderStep3_Snickeri() {
  return `
    <section class="card">
      <h2>3. Utförande – Ytskikt & snickeri</h2>
      <p class="muted">Välj ytskikt, dörrar och andra snickeridetaljer.</p>

      ${renderSnickeriSection()} 
      
      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

function renderSnickeriSection() {
  return `
    <h3 class="section-title">Ytskikt & snickeri</h3>
    <div class="grid grid-2">
      ${pillGroup("Microcement golv", "microcement_golv", YES_NO)}
      ${pillGroup("Microcement vägg", "microcement_vagg", YES_NO)}

      ${pillGroup("Ny tröskel", "ny_troskel", YES_NO)}
      ${pillGroup("Byta dörrblad", "byta_dorrblad", YES_NO)}

      ${pillGroup("Byta karm + dörr", "byta_karm_dorr", YES_NO)}
      ${pillGroup("Slipning dörr", "slipning_dorr", YES_NO)}

      ${pillGroup("Bänkskiva ovan TM/TT", "bankskiva_ovan_tm_tt", YES_NO)}
      ${pillGroup("Väggskåp", "vaggskap", YES_NO)}

      ${pillGroup("Nytt innertak", "nytt_innertak", YES_NO)}
      ${pillGroup("Rivning av väggar (antal)", "rivning_vaggar", [
        "0",
        "1",
        "2",
        "3",
        "4"
      ])}

      ${pillGroup(
        "Nya väggar (material)",
        "nya_vaggar_material",
        ["Nej / bestäms senare", "Lättvägg", "Massiv"]
      )}

      ${pillGroup("Gerade hörn (meter)", "gerade_horn_meter", [
        "0",
        "2",
        "4",
        "6",
        "8",
        "10",
        "12"
      ])}

      <div class="field">
        <label>Fyll i antal meter fris</label>
        <input type="number" data-field="fyll_i_antal_meter"
               value="${state.fyll_i_antal_meter}">
      </div>
    </div>
  `;
}

// --- Step 4 – VVS & El ---
function renderStep4_VvsEl() {
  return `
    <section class="card">
      <h2>4. Utförande – VVS & El</h2>
      <p class="muted">Välj installationer för VVS och el.</p>
      
      ${renderVvsElSection()} 

      <div class="actions">
        <button class="btn btn-ghost" data-prev>Tillbaka</button>
        <button class="btn btn-primary" data-next>Nästa steg</button>
      </div>
    </section>
  `;
}

function renderVvsElSection() {
  return `
    <h3 class="section-title">VVS</h3>
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

      ${pillGroup("Tvättmaskin", "tvattmaskin", YES_NO)}
      ${pillGroup("Torktumlare", "torktumlare", YES_NO)}

      ${pillGroup("Torkskåp", "torkskap", YES_NO)}
      ${pillGroup("Inkläkat badkar", "inklakat_badkar", YES_NO)}

      ${pillGroup("Värmepump / värme", "varme_vp", YES_NO)}
    </div>

    <h3 class="section-title">El</h3>
    <div class="grid grid-2">
      ${pillGroup("Takbelysning", "takbelysning", TAKBELYSNING_OPTS)}
      <div class="field">
        <label>Spotlight antal</label>
        <input type="number" min="0" step="1"
               data-field="spotlight_antal"
               value="${state.spotlight_antal}">
      </div>

      ${pillGroup("Golvvärme", "golvvärme", YES_NO)}
      ${pillGroup("Handdukstork", "handdukstork", YES_NO)}
    </div>
  `;
}

// --- Step 5 – Beräkna pris ---
function renderStep5_Pris() {
  const { loading, error, priceResult } = state;

  return `
    <section class="card">
      <h2>5. Beräkna pris</h2>
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

  return `
    <aside class="summary card">
      <div class="summary-header">
        <h2>Summering</h2>
        <p class="muted">Fyll i formuläret för att se preliminärt pris.</p>
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

        <div class="summary-tags">
          <div><strong>Snickeri:</strong> ${
            state.nytt_innertak === "Ja" ? "Nytt innertak" : "Standardutförande"
          }</div>
          <div><strong>VVS:</strong> WC: ${state.wc}, Duschblandare: ${
    state.duschblandare
  }</div>
          <div><strong>El:</strong> ${state.takbelysning}${
    Number(state.spotlight_antal) > 0
      ? ", " + state.spotlight_antal + " spotlights"
      : ""
  }</div>
        </div>
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
                Arbete, material m.m. uppdelas i den skarpa offerten.
              </small>
            `
            : `<small class="muted">
                Arbete, material m.m. visas efter beräkning.
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

  // REMOVED Subtabs on step 3
  
  // REMOVED const gotoVvs

  const nextBtn = root.querySelector("[data-next]");
  if (nextBtn) nextBtn.addEventListener("click", handleNext);

  const prevBtn = root.querySelector("[data-prev]");
  if (prevBtn) prevBtn.addEventListener("click", handlePrev);

  const calcBtn = root.querySelector("[data-calc]");
  if (calcBtn) calcBtn.addEventListener("click", handleCalculate);
}

function handleNext() {
  if (state.step < 5) {
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
      postnummer: state.postnummer,
      zon: Number(state.zon) || 0,
      kvm_golv: Number(state.kvm_golv) || 0,
      kvm_vagg: Number(state.kvm_vagg) || 0,
      takhojd: Number(state.takhojd) || 0,

      microcement_golv: state.microcement_golv,
      microcement_vagg: state.microcement_vagg,
      ny_troskel: state.ny_troskel,
      byta_dorrblad: state.byta_dorrblad,
      byta_karm_dorr: state.byta_karm_dorr,
      slipning_dorr: state.slipning_dorr,
      bankskiva_ovan_tm_tt: state.bankskiva_ovan_tm_tt,
      vaggskap: state.vaggskap,
      nytt_innertak: state.nytt_innertak,
      rivning_vaggar: Number(state.rivning_vaggar) || 0,
      nya_vaggar_material: state.nya_vaggar_material,
      gerade_horn_meter: Number(state.gerade_horn_meter) || 0,
      fyll_i_antal_meter: Number(state.fyll_i_antal_meter) || 0,

      dolda_ror: state.dolda_ror,
      wc: state.wc,
      byte_av_avloppsgroda: state.byte_av_avloppsgroda,
      ny_slitsbotten: state.ny_slitsbotten,
      brunn: state.brunn,
      duschblandare: state.duschblandare,
      tvattstallsblandare: state.tvattstallsblandare,
      tvattstall_kommod: state.tvattstall_kommod,
      tvattmaskin: state.tvattmaskin,
      torktumlare: state.torktumlare,
      torkskap: state.torkskap,
      inklakat_badkar: state.inklakat_badkar,
      varme_vp: state.varme_vp,

      takbelysning: state.takbelysning,
      spotlight_antal: Number(state.spotlight_antal) || 0,
      golvvärme: state.golvvärme,
      handdukstork: state.handdukstork
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

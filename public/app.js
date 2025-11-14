// SIMPLE STATE OBJECT
const state = {
  // step 1
  address: "",
  propertyType: "Lägenhet",
  era: "60-tal",
  floor: "3 tr",
  lift: "Stor",

  // step 2
  postnummer: "",
  zon: "3",
  kvm_golv: 8.5,
  kvm_vagg: "",
  takhojd: 2.4,

  // step 3 – snickeri
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  ny_troskel: "Ja",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Ja",
  rivning_vaggar: "Nej",
  nya_vaggar_material: "Nej",
  gerade_horn_meter: "Nej",
  fyll_i_antal_meter: 0,

  // VVS
  dolda_ror: "Nej",
  wc: "Ingen WC",
  duschblandare: "Standard",
  tvattmaskin: "Nej",
  torktumlare: "Nej",
  torkskap: "Nej",

  // El
  takbelysning: "Plafond",
  spotlight_antal: 0,
  golvvarme: "Nej",
  handdukstork: "Nej",

  // contact
  contact_namn: "",
  contact_tel: "",
  contact_mail: "",

  // price result
  price: null,
  price_breakdown: null
};

// ---------- STEP / WIZARD ----------
function initSteps() {
  const steps = Array.from(document.querySelectorAll(".js-step"));
  const nextBtns = document.querySelectorAll(".js-next");
  const prevBtns = document.querySelectorAll(".js-prev");
  const stepIndicator = document.getElementById("step-indicator");
  const progressBar = document.getElementById("progress-bar");

  let currentStep = 1;
  const maxStep = 4;

  function showStep(step) {
    currentStep = Math.min(Math.max(step, 1), maxStep);
    steps.forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle("is-active", s === currentStep);
    });
    stepIndicator.textContent = `Steg ${currentStep} av ${maxStep}`;
    progressBar.style.width = `${((currentStep - 1) / (maxStep - 1)) * 100}%`;
  }

  nextBtns.forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (currentStep === 3) {
        // calculate price when leaving step 3
        await calculatePrice();
      }
      showStep(currentStep + 1);
      renderSummary();
    })
  );

  prevBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      showStep(currentStep - 1);
      renderSummary();
    })
  );

  showStep(1);
}

// ---------- FORM BINDINGS ----------
function bindInputs() {
  // text / number inputs
  document
    .querySelectorAll("[data-field]")
    .forEach((input) => {
      const field = input.dataset.field;

      // initial from state
      if (input.type === "range" || input.type === "number") {
        if (state[field] !== undefined) input.value = state[field];
      } else if (input.tagName === "SELECT") {
        if (state[field] !== undefined) input.value = state[field];
      } else {
        if (state[field]) input.value = state[field];
      }

      const evt =
        input.tagName === "SELECT" || input.type === "range"
          ? "change"
          : "input";

      input.addEventListener(evt, (e) => {
        let v = e.target.value;
        if (e.target.type === "number" || e.target.type === "range") {
          v = e.target.value === "" ? "" : Number(e.target.value);
        }
        state[field] = v;
        if (field === "kvm_golv") {
          updateRangeLabel();
        }
        renderSummary();
      });
    });

  updateRangeLabel();
}

function updateRangeLabel() {
  const label = document.getElementById("kvm-golv-value");
  if (label) {
    label.textContent = `${state.kvm_golv} m²`;
  }
}

// ---------- CONVERT SELECTS TO PILL BUTTONS ----------
function convertSelectsToPills() {
  const selects = document.querySelectorAll("select[data-field]");

  selects.forEach((select) => {
    // keep original select hidden for safety
    select.style.display = "none";

    const wrapper = document.createElement("div");
    wrapper.className = "pill-group";

    Array.from(select.options).forEach((opt) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "pill";
      pill.textContent = opt.textContent;
      if (opt.value === select.value) pill.classList.add("is-active");

      pill.addEventListener("click", () => {
        select.value = opt.value;
        // trigger change on select for state binding
        select.dispatchEvent(new Event("change", { bubbles: true }));

        wrapper
          .querySelectorAll(".pill")
          .forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
      });

      wrapper.appendChild(pill);
    });

    select.parentNode.insertBefore(wrapper, select.nextSibling);
  });
}

// ---------- SUMMARY RENDERING ----------
function renderSummary() {
  // Fastighetsinfo
  document.getElementById("sum-address").textContent =
    state.address && state.address.trim().length > 0
      ? state.address
      : "Adress ej angiven";

  document.getElementById(
    "sum-fastighet"
  ).textContent = `${state.propertyType}, ${state.era}, våning ${state.floor}, hiss: ${state.lift}`;

  // Badrum size
  const kvmGolv =
    state.kvm_golv && !isNaN(state.kvm_golv) ? `${state.kvm_golv} m²` : "– m²";
  const kvmVagg =
    state.kvm_vagg && !isNaN(state.kvm_vagg)
      ? `${state.kvm_vagg} m²`
      : "– m²";
  const tak =
    state.takhojd && !isNaN(state.takhojd) ? `${state.takhojd} m` : "– m";

  document.getElementById(
    "sum-size"
  ).textContent = `Golv: ${kvmGolv} · Vägg: ${kvmVagg} · Takhöjd: ${tak}`;

  document.getElementById("sum-zon").textContent = `Zon: ${
    state.zon || "–"
  }`;

  // Snickeri chips
  const snickeriContainer = document.getElementById("sum-snickeri-chips");
  snickeriContainer.innerHTML = "";

  function addChipSnickeri(condition, label) {
    if (!condition) return;
    const chip = document.createElement("span");
    chip.className = "summary-chip summary-chip--accent";
    chip.textContent = label;
    snickeriContainer.appendChild(chip);
  }

  addChipSnickeri(state.microcement_golv === "Ja", "Microcement golv");
  addChipSnickeri(state.microcement_vagg === "Ja", "Microcement vägg");
  addChipSnickeri(state.ny_troskel === "Ja", "Ny tröskel");
  addChipSnickeri(state.byta_dorrblad === "Ja", "Byta dörrblad");
  addChipSnickeri(state.byta_karm_dorr === "Ja", "Byta karm + dörr");
  addChipSnickeri(state.slipning_dorr === "Ja", "Slipning dörr");
  addChipSnickeri(state.bankskiva_ovan_tm_tt === "Ja", "Bänkskiva TM/TT");
  addChipSnickeri(state.vaggskap === "Ja", "Väggskåp");
  addChipSnickeri(state.nytt_innertak === "Ja", "Nytt innertak");
  if (state.rivning_vaggar !== "Nej") {
    addChipSnickeri(true, `Rivning väggar: ${state.rivning_vaggar} st`);
  }
  if (state.nya_vaggar_material !== "Nej") {
    addChipSnickeri(true, `Nya väggar: ${state.nya_vaggar_material}`);
  }
  if (state.gerade_horn_meter !== "Nej") {
    addChipSnickeri(true, `Gerade hörn: ${state.gerade_horn_meter} m`);
  }
  if (state.fyll_i_antal_meter > 0) {
    addChipSnickeri(true, `Fris: ${state.fyll_i_antal_meter} m`);
  }

  // VVS chips
  const vvsContainer = document.getElementById("sum-vvs-chips");
  vvsContainer.innerHTML = "";
  function addChipVVS(condition, label) {
    if (!condition) return;
    const chip = document.createElement("span");
    chip.className = "summary-chip";
    chip.textContent = label;
    vvsContainer.appendChild(chip);
  }

  addChipVVS(state.dolda_ror === "Ja", "Dolda rör");
  addChipVVS(true, `WC: ${state.wc}`);
  addChipVVS(true, `Duschblandare: ${state.duschblandare}`);
  addChipVVS(state.tvattmaskin === "Ja", "Tvättmaskin");
  addChipVVS(state.torktumlare === "Ja", "Torktumlare");
  addChipVVS(state.torkskap === "Ja", "Torkskåp");

  // El chips
  const elContainer = document.getElementById("sum-el-chips");
  elContainer.innerHTML = "";
  function addChipEl(condition, label) {
    if (!condition) return;
    const chip = document.createElement("span");
    chip.className = "summary-chip";
    chip.textContent = label;
    elContainer.appendChild(chip);
  }

  addChipEl(true, `Tak: ${state.takbelysning}`);
  if (state.spotlight_antal > 0) {
    addChipEl(true, `Spotlights: ${state.spotlight_antal} st`);
  }
  addChipEl(state.golvvarme === "Ja", "Golvvärme");
  addChipEl(state.handdukstork === "Ja", "Handdukstork");

  // Price box
  const priceMain = document.getElementById("price-main");
  const priceSub = document.getElementById("price-sub");
  const priceRow = document.getElementById("price-pill-row");
  priceRow.innerHTML = "";

  if (state.price && state.price.pris_totalt_ink_moms) {
    priceMain.textContent = formatKr(state.price.pris_totalt_ink_moms);

    priceSub.textContent =
      "Preliminär total inkl. moms. Exakt pris efter platsbesök.";

    function addPricePill(label, value) {
      const pill = document.createElement("span");
      pill.className = "price-pill";
      pill.textContent = `${label}: ${formatKr(value)}`;
      priceRow.appendChild(pill);
    }

    addPricePill("Arbete", state.price.pris_arbete_ex_moms);
    addPricePill("Material", state.price.pris_grundmaterial_ex_moms);
    addPricePill("Resa & sophantering", state.price.pris_resekostnad_ex_moms);
  } else {
    priceMain.textContent = "–";
    priceSub.textContent =
      "Arbete, material m.m. visas efter beräkning.";
  }
}

function formatKr(num) {
  if (num === undefined || num === null || num === "" || isNaN(num)) {
    return "–";
  }
  const n = Number(num);
  return n.toLocaleString("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0
  });
}

// ---------- CALL BACKEND ----------
async function calculatePrice() {
  try {
    const body = {
      postnummer: state.postnummer,
      zon: Number(state.zon || 1),
      kvm_golv: Number(state.kvm_golv || 0),
      kvm_vagg: Number(state.kvm_vagg || 0),
      takhojd: Number(state.takhojd || 2.4),

      microcement_golv: state.microcement_golv,
      microcement_vagg: state.microcement_vagg,
      ny_troskel: state.ny_troskel,
      byta_dorrblad: state.byta_dorrblad,
      byta_karm_dorr: state.byta_karm_dorr,
      slipning_dorr: state.slipning_dorr,
      bankskiva_ovan_tm_tt: state.bankskiva_ovan_tm_tt,
      vaggskap: state.vaggskap,
      nytt_innertak: state.nytt_innertak,
      rivning_vaggar: state.rivning_vaggar,
      nya_vaggar_material: state.nya_vaggar_material,
      gerade_horn_meter: state.gerade_horn_meter,
      fyll_i_antal_meter: Number(state.fyll_i_antal_meter || 0),

      dolda_ror: state.dolda_ror,
      wc: state.wc,
      duschblandare: state.duschblandare,
      tvattmaskin: state.tvattmaskin,
      torktumlare: state.torktumlare,
      torkskap: state.torkskap,

      takbelysning: state.takbelysning,
      spotlight_antal: Number(state.spotlight_antal || 0),
      golvvarme: state.golvvarme,
      handdukstork: state.handdukstork
    };

    const priceSub = document.getElementById("price-sub");
    priceSub.textContent = "Beräknar pris…";

    const res = await fetch("/api/estimate/badrum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Estimate error:", data.error);
      priceSub.textContent =
        "Kunde inte beräkna pris just nu. Försök igen eller kontakta Jobryan.";
      state.price = null;
    } else {
      state.price = data;
    }
  } catch (err) {
    console.error(err);
    document.getElementById("price-sub").textContent =
      "Tekniskt fel vid beräkning.";
    state.price = null;
  }

  renderSummary();
}

// ---------- CONTACT SEND (just console for now) ----------
function initSendOfferButton() {
  const btn = document.getElementById("send-offer-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Here you can later POST to your own email-service / CRM.
    console.log("OFFERT DATA TO SEND:", state);
    btn.textContent = "Skickad!";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "Skicka offert";
      btn.disabled = false;
    }, 2500);
  });
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  bindInputs();
  convertSelectsToPills();
  initSteps();
  initSendOfferButton();
  renderSummary();
});

// =======================
// DOM helper (FIXED)
// =======================
function el(tag, attrs = {}, ...children) {
  if (attrs === null || typeof attrs !== "object" || Array.isArray(attrs)) {
    children.unshift(attrs);
    attrs = {};
  }

  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "for") node.htmlFor = v;
    else if (k.startsWith("on")) node.addEventListener(k.substring(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  });

  children.flat().forEach(ch => {
    if (ch === null || ch === undefined) return;
    node.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch);
  });

  return node;
}

// ========================================
// Multi-step wizard system
// ========================================

let currentStep = 0;

// ⭐ All fields the user will fill in
let formData = {
  postnummer: "",
  zon: "",
  kvm_golv: "",
  kvm_vagg: "",
  takhojd: "",
  microcement_golv: "Nej",
  microcement_vagg: "Nej",
  ny_troskel: "Nej",
  byta_dorrblad: "Nej",
  byta_karm_dorr: "Nej",
  slipning_dorr: "Nej",
  bankskiva_ovan_tm_tt: "Nej",
  vaggskap: "Nej",
  nytt_innertak: "Nej",
  rivning_vaggar: 0,
  nya_vaggar_material: "Nej",
  gerade_horn_meter: 0,
  fyll_i_antal_meter: 0,
  dolda_ror: "Nej",

  // Contact details
  kund_namn: "",
  kund_telefon: "",
  kund_adress: ""
};

// Steps configured here
const steps = [
  // STEP 0 — Basic info
  () => el("div", null,
    el("div", { class: "step-title" }, "Grunduppgifter"),
    textInput("Postnummer", "postnummer"),
    selectInput("Zon", "zon", ["1","2","3","4"]),
    textInput("Kvm golv", "kvm_golv"),
    textInput("Kvm vägg", "kvm_vagg"),
    textInput("Takhöjd", "takhöjd"),
    nextBtn()
  ),

  // STEP 1 — Execution
  () => el("div", null,
    el("div", { class: "step-title" }, "Utförande"),
    selectInput("Microcement golv", "microcement_golv", ["Ja","Nej"]),
    selectInput("Microcement vägg", "microcement_vagg", ["Ja","Nej"]),
    selectInput("Ny tröskel", "ny_troskel", ["Ja","Nej"]),
    selectInput("Byta dörrblad", "byta_dorrblad", ["Ja","Nej"]),
    selectInput("Byta karm + dörr", "byta_karm_dorr", ["Ja","Nej"]),
    selectInput("Slipning dörr", "slipning_dorr", ["Ja","Nej"]),
    selectInput("Bänkskiva ovan TM/TT", "bankskiva_ovan_tm_tt", ["Ja","Nej"]),
    selectInput("Väggskåp", "vaggskap", ["Ja","Nej"]),
    selectInput("Nytt innertak", "nytt_innertak", ["Ja","Nej"]),
    textInput("Rivning av väggar (antal)", "rivning_vaggar"),
    selectInput("Nya väggar (material)", "nya_vaggar_material", ["Ja","Nej"]),
    textInput("Gerade hörn (meter)", "gerade_horn_meter"),
    textInput("Fyll i antal meter", "fyll_i_antal_meter"),
    selectInput("Dolda rör", "dolda_ror", ["Ja","Nej"]),
    backBtn(),
    nextBtn()
  ),

  // STEP 2 — Contact info
  () => el("div", null,
    el("div", { class: "step-title" }, "Kontaktuppgifter"),
    textInput("Fullständigt namn", "kund_namn"),
    textInput("Telefonnummer", "kund_telefon"),
    textInput("Adress", "kund_adress"),
    backBtn(),
    nextBtn("Visa sammanfattning")
  ),

  // STEP 3 — Summary + API call
  () => summaryScreen()
];

// ========================================
// Form helpers
// ========================================

function textInput(labelText, field) {
  return el("div", { class: "input-group" },
    el("label", null, labelText),
    el("input", {
      value: formData[field],
      oninput: e => formData[field] = e.target.value
    })
  );
}

function selectInput(labelText, field, options) {
  return el("div", { class: "input-group" },
    el("label", null, labelText),
    el("select", {
      oninput: e => formData[field] = e.target.value
    },
      ...options.map(o =>
        el("option", { value: o, selected: formData[field] === o }, o)
      )
    )
  );
}

function nextBtn(txt = "Nästa") {
  return el("button", { onclick: () => goStep(currentStep + 1) }, txt);
}

function backBtn() {
  return el("button", { onclick: () => goStep(currentStep - 1) }, "Tillbaka");
}

// ========================================
// Summary + API
// ========================================

function summaryScreen() {
  return el("div", null,
    el("div", { class: "step-title" }, "Sammanfattning"),
    el("div", { class: "summary-box" },
      ...Object.entries(formData).map(([key, val]) =>
        el("div", null, `${key}: ${val}`)
      )
    ),
    backBtn(),
    el("button", { onclick: sendToAPI }, "Beräkna pris")
  );
}

async function sendToAPI() {
  const r = await fetch("/api/estimate/badrum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });

  const data = await r.json();

  document.getElementById("app").innerHTML = "";
  document.getElementById("app").appendChild(
    el("div", null,
      el("h2", null, "Ditt preliminära pris"),
      el("pre", null, JSON.stringify(data, null, 2)),
      el("p", null, "Jobryan kontaktar dig inom kort.")
    )
  );
}

// ========================================
// Render function
// ========================================

function goStep(n) {
  currentStep = Math.max(0, Math.min(steps.length - 1, n));
  render();
}

function render() {
  const root = document.getElementById("app");
  root.innerHTML = "";
  root.appendChild(steps[currentStep]());
}

render();

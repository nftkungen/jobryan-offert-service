/* -----------------------------
   JOBRYAN STEP WIZARD (A FLOW)
-------------------------------- */

let currentStep = 0;

// ALL FORM DATA STORED HERE
let formData = {
  address: "",
  property_type: "",
  era: "",
  floor: "",
  elevator: "",
  kvm: "",
  floor_surface: "",
  floor_tile_size: "",
  wall_surface: "",
  wall_tile_size: "",
  dolda_ror: "",
  nytt_innertak: "",
  rivning_vaggar: "",
  name: "",
  phone: "",
  email: ""
};

// ----- STEP DEFINITIONS -----

const steps = [
  {
    title: "Fastighetsinformation",
    render: () => `
      <div class="step-block">
        <label>Adress</label>
        <input type="text" id="address" placeholder="Ex: Slätbaksvägen 17" value="${formData.address}">
      </div>

      <div class="step-block">
        <label>Fastighetstyp</label>
        <div id="option-buttons">
          ${optionButton("property_type","Villa")}
          ${optionButton("property_type","Lägenhet")}
          ${optionButton("property_type","Radhus")}
        </div>
      </div>

      <div class="step-block">
        <label>Era</label>
        <div id="option-buttons">
          ${optionButton("era","20-tal")}
          ${optionButton("era","30-tal")}
          ${optionButton("era","40-tal")}
          ${optionButton("era","50-tal")}
          ${optionButton("era","60-tal")}
          ${optionButton("era","70-tal")}
          ${optionButton("era","80-tal")}
          ${optionButton("era","90-tal")}
        </div>
      </div>

      <div class="step-block">
        <label>Våningsplan</label>
        <div id="option-buttons">
          ${optionButton("floor","BV")}
          ${optionButton("floor","1tr")}
          ${optionButton("floor","2tr")}
          ${optionButton("floor","3tr")}
          ${optionButton("floor","4tr")}
        </div>
      </div>

      <div class="step-block">
        <label>Hiss</label>
        <div id="option-buttons">
          ${optionButton("elevator","Stor")}
          ${optionButton("elevator","Liten")}
          ${optionButton("elevator","Ingen")}
        </div>
      </div>
    `
  },

  {
    title: "Badrum – Golv",
    render: () => `
      <div class="step-block">
        <label>Storlek (kvm)</label>
        <input type="number" id="kvm" value="${formData.kvm}" placeholder="Ex: 3.5">
      </div>

      <div class="step-block">
        <label>Ytskikt golv</label>
        <div id="option-buttons">
          ${optionButton("floor_surface","Plattor")}
          ${optionButton("floor_surface","Våtrumsmatta")}
          ${optionButton("floor_surface","Microcement","orange")}
        </div>
      </div>

      <div class="step-block">
        <label>Plattstorlek</label>
        <div id="option-buttons">
          ${optionButton("floor_tile_size","<60x60")}
          ${optionButton("floor_tile_size",">60x60")}
        </div>
      </div>
    `
  },

  {
    title: "Badrum – Väggar",
    render: () => `
      <div class="step-block">
        <label>Ytskikt väggar</label>
        <div id="option-buttons">
          ${optionButton("wall_surface","Plattor")}
          ${optionButton("wall_surface","Våtrumsmatta")}
          ${optionButton("wall_surface","Microcement","orange")}
        </div>
      </div>

      <div class="step-block">
        <label>Plattstorlek vägg</label>
        <div id="option-buttons">
          ${optionButton("wall_tile_size","<60x60")}
          ${optionButton("wall_tile_size",">60x60")}
        </div>
      </div>
    `
  },

  {
    title: "Extra val",
    render: () => `
      <div class="step-block">
        <label>Dolda rör</label>
        <div id="option-buttons">
          ${optionButton("dolda_ror","Ja")}
          ${optionButton("dolda_ror","Nej")}
        </div>
      </div>

      <div class="step-block">
        <label>Nytt innertak</label>
        <div id="option-buttons">
          ${optionButton("nytt_innertak","Ja")}
          ${optionButton("nytt_innertak","Nej")}
        </div>
      </div>

      <div class="step-block">
        <label>Rivning av väggar</label>
        <input type="number" id="rivning_vaggar" value="${formData.rivning_vaggar}" placeholder="Antal väggar">
      </div>
    `
  },

  {
    title: "Dina uppgifter",
    render: () => `
      <div class="step-block">
        <label>Namn</label>
        <input type="text" id="name" value="${formData.name}">
      </div>

      <div class="step-block">
        <label>Telefonnummer</label>
        <input type="text" id="phone" value="${formData.phone}">
      </div>

      <div class="step-block">
        <label>Email</label>
        <input type="email" id="email" value="${formData.email}">
      </div>

      <div id="summary-box">
        <strong>Sammanfattning kommer på nästa sida</strong>
      </div>
    `
  }
];

// ----------------------------------
// Option Button Generator
// ----------------------------------
function optionButton(field, value, color = "green") {
  let selected = formData[field] === value;
  let cls = selected
    ? (color === "orange" ? "selected-orange" : "selected-green")
    : "";

  return `<div class="option-btn ${cls}" onclick="selectOption('${field}','${value}','${color}')">${value}</div>`;
}

// Handle option selection
window.selectOption = function(field, value, color) {
  formData[field] = value;
  renderStep(); // re-render to update selection color
};

// ----------------------------------
// Render a step
// ----------------------------------
function renderStep() {
  document.getElementById("wizard-step").innerHTML = steps[currentStep].render();
  document.getElementById("step-title").innerText = steps[currentStep].title;
  document.getElementById("step-progress").innerText =
    `Steg ${currentStep+1} av ${steps.length}`;
  
  document.getElementById("prev-btn").classList.toggle("hidden", currentStep === 0);

  document.getElementById("next-btn").innerText =
    currentStep === steps.length - 1 ? "Visa resultat" : "Nästa";
}

// ----------------------------------
// Validate + Save inputs every step
// ----------------------------------
function saveInputs() {
  // Generic read of inputs that exist on current step
  const ids = ["address","kvm","rivning_vaggar","name","phone","email"];
  ids.forEach(id => {
    let el = document.getElementById(id);
    if (el) formData[id] = el.value;
  });
}

// ----------------------------------
// Go NEXT
// ----------------------------------
document.getElementById("next-btn").onclick = () => {
  saveInputs();

  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep();
  } else {
    showSummaryScreen();
  }
};

// ----------------------------------
// Go BACK
// ----------------------------------
document.getElementById("prev-btn").onclick = () => {
  saveInputs();
  currentStep--;
  renderStep();
};

// ----------------------------------
// SUMMARY + PRICE FETCH
// ----------------------------------
function showSummaryScreen() {
  document.getElementById("wizard-step").innerHTML = `
    <h3>Ditt preliminära pris</h3>
    <div id="summary-box">Hämtar pris...</div>
  `;

  // CALL YOUR BACKEND
  fetch("/api/estimate/badrum", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      postnummer: "12051",
      zon: 3,
      kvm_golv: formData.kvm,
      kvm_vagg: formData.kvm * 2.78,
      takhojd: 2.6,

      microcement_golv: formData.floor_surface === "Microcement" ? "Ja" : "Nej",
      microcement_vagg: formData.wall_surface === "Microcement" ? "Ja" : "Nej",
      ny_troskel: "Nej",

      byta_dorrblad: "Nej",
      byta_karm_dorr: "Nej",
      slipning_dorr: "Nej",
      bankskiva_ovan_tm_tt: "Nej",
      vaggskap: "Nej",

      nytt_innertak: formData.nytt_innertak,
      rivning_vaggar: formData.rivning_vaggar,
      nya_vaggar_material: "Nej",

      gerade_horn_meter: 0,
      fyll_i_antal_meter: 0,

      dolda_ror: formData.dolda_ror
    })
  })
  .then(r => r.json())
  .then(data => {
    document.getElementById("summary-box").innerHTML = `
      <p><strong>Arbete ex moms:</strong> ${data.pris_arbete_ex_moms} kr</p>
      <p><strong>Material ex moms:</strong> ${data.pris_grundmaterial_ex_moms} kr</p>
      <p><strong>Resekostnad:</strong> ${data.pris_resekostnad_ex_moms} kr</p>
      <p><strong>Sophantering:</strong> ${data.pris_sophantering_ex_moms} kr</p>
      <hr>
      <p><strong>Totalt preliminärt pris:</strong> ${data.pris_totalt_ink_moms} kr</p>
      <hr>
      <button id="send-offert-btn" class="nav-btn">Skicka offert</button>
    `;

    document.getElementById("send-offert-btn").onclick = sendOffert;
  });
}

// ----------------------------------
// SEND OFFER EMAIL
// ----------------------------------
function sendOffert() {
  alert("Offert skickad! (backend to implement)");
}

// ----------------------------------
// INITIAL RENDER
// ----------------------------------
renderStep();

// Simple multi-step wizard for Jobryan badrums-offert

const root = document.getElementById("app");

// --- state --------------------------------------------------

const steps = [
  { id: "kontakt", label: "Kontakt" },
  { id: "matt", label: "Mått" },
  { id: "utforande", label: "Utförande" },
  { id: "sammanfattning", label: "Sammanfattning" },
];

let state = {
  stepIndex: 0,
  loading: false,
  error: "",
  success: "",
  estimate: null,
  form: {
    // Kontakt
    kund_namn: "",
    kund_email: "",
    kund_tel: "",
    kund_adress: "",
    postnummer: "",
    zon: "3",

    // Mått
    kvm_golv: "",
    kvm_vagg: "",
    takhojd: "2.4",

    // Utförande
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
    nya_vaggar_material: "Nej",
    gerade_horn_meter: "0",
    fyll_i_antal_meter: "0",
    dolda_ror: "Nej",
  },
};

// --- helpers ------------------------------------------------

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function updateField(name, value) {
  setState({ form: { ...state.form, [name]: value }, error: "", success: "" });
}

function formatCurrency(sek) {
  if (sek == null || isNaN(sek)) return "-";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(sek);
}

// --- DOM helpers --------------------------------------------

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "for") node.htmlFor = v;
    else if (k === "value") node.value = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.substring(2).toLowerCase(), v);
    } else {
      node.setAttribute(k, v);
    }
  });
  children.flat().forEach((ch) => {
    if (ch == null) return;
    node.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch);
  });
  return node;
}

function inputField(opts) {
  const { name, label, type = "text", placeholder = "", helper } = opts;
  const value = state.form[name] ?? "";
  return el(
    "div",
    { class: "field-group" },
    el("div", { class: "field-label" }, label),
    el("input", {
      class: "field-input",
      type,
      value,
      placeholder,
      oninput: (e) => updateField(name, e.target.value),
    }),
    helper ? el("div", { class: "helper" }, helper) : null
  );
}

function selectField(opts) {
  const { name, label, options, helper } = opts;
  const value = state.form[name] ?? "";
  return el(
    "div",
    { class: "field-group" },
    el("div", { class: "field-label" }, label),
    el(
      "select",
      {
        class: "field-select",
        value,
        onchange: (e) => updateField(name, e.target.value),
      },
      options.map((opt) =>
        el(
          "option",
          { value: typeof opt === "string" ? opt : opt.value },
          typeof opt === "string" ? opt : opt.label
        )
      )
    ),
    helper ? el("div", { class: "helper" }, helper) : null
  );
}

function numberField(opts) {
  const { name, label, min = 0, step = "1", helper } = opts;
  const value = state.form[name] ?? "";
  return el(
    "div",
    { class: "field-group" },
    el("div", { class: "field-label" }, label),
    el("input", {
      class: "field-input",
      type: "number",
      min,
      step,
      value,
      oninput: (e) => updateField(name, e.target.value),
    }),
    helper ? el("div", { class: "helper" }, helper) : null
  );
}

// --- steps --------------------------------------------------

function renderKontaktStep() {
  return el(
    "div",
    null,
    inputField({
      name: "kund_namn",
      label: "Namn",
      placeholder: "För- och efternamn",
    }),
    inputField({
      name: "kund_email",
      label: "E-post",
      type: "email",
      placeholder: "namn@example.se",
      helper: "Vi skickar offerten till den här adressen.",
    }),
    inputField({
      name: "kund_tel",
      label: "Telefonnummer",
      placeholder: "07x-xxx xx xx",
    }),
    inputField({
      name: "kund_adress",
      label: "Adress",
      placeholder: "Gata, nummer, våning",
    }),
    el(
      "div",
      { class: "field-row" },
      inputField({
        name: "postnummer",
        label: "Postnummer",
        helper: "För zon/avstånd.",
      }),
      selectField({
        name: "zon",
        label: "Zon",
        options: [
          { value: "1", label: "Zon 1 (nära)" },
          { value: "2", label: "Zon 2" },
          { value: "3", label: "Zon 3" },
          { value: "4", label: "Zon 4 (längre bort)" },
        ],
      })
    )
  );
}

function renderMattStep() {
  return el(
    "div",
    null,
    el(
      "div",
      { class: "field-row" },
      numberField({
        name: "kvm_golv",
        label: "Kvm golv",
        helper: "Golvytan i m²",
      }),
      numberField({
        name: "kvm_vagg",
        label: "Kvm vägg",
        helper: "Väggytan i m²",
      })
    ),
    numberField({
      name: "takhojd",
      label: "Takhöjd (m)",
      step: "0.1",
      helper: "Vanligtvis 2.4–2.7 m",
    })
  );
}

function renderUtforandeStep() {
  const jaNej = ["Nej", "Ja"];
  return el(
    "div",
    null,
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "microcement_golv",
        label: "Microcement golv",
        options: jaNej,
      }),
      selectField({
        name: "microcement_vagg",
        label: "Microcement vägg",
        options: jaNej,
      })
    ),
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "ny_troskel",
        label: "Ny tröskel",
        options: jaNej,
      }),
      selectField({
        name: "byta_dorrblad",
        label: "Byta dörrblad",
        options: jaNej,
      })
    ),
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "byta_karm_dorr",
        label: "Byta karm + dörr",
        options: jaNej,
      }),
      selectField({
        name: "slipning_dorr",
        label: "Slipning dörr",
        options: jaNej,
      })
    ),
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "bankskiva_ovan_tm_tt",
        label: "Bänkskiva ovan TM/TT",
        options: jaNej,
      }),
      selectField({
        name: "vaggskap",
        label: "Väggskåp",
        options: jaNej,
      })
    ),
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "nytt_innertak",
        label: "Nytt innertak",
        options: jaNej,
      }),
      numberField({
        name: "rivning_vaggar",
        label: "Rivning av väggar (antal)",
        min: 0,
      })
    ),
    el(
      "div",
      { class: "field-row" },
      selectField({
        name: "nya_vaggar_material",
        label: "Nya väggar (material)",
        options: jaNej,
      }),
      numberField({
        name: "gerade_horn_meter",
        label: "Gerade hörn / meter",
        min: 0,
      })
    ),
    numberField({
      name: "fyll_i_antal_meter",
      label: "Fyll i antal meter (fris mm)",
      min: 0,
    }),
    selectField({
      name: "dolda_ror",
      label: "Dolda rör",
      options: jaNej,
    })
  );
}

function renderSammanfattningStep() {
  const e = state.estimate;
  return el(
    "div",
    null,
    el(
      "div",
      { class: "summary-box" },
      el(
        "div",
        { class: "summary-row" },
        el("div", { class: "summary-label" }, "Arbete exkl. moms"),
        el("div", { class: "summary-value" }, formatCurrency(e?.pris_arbete_ex_moms))
      ),
      el(
        "div",
        { class: "summary-row" },
        el("div", { class: "summary-label" }, "Grundmaterial exkl. moms"),
        el(
          "div",
          { class: "summary-value" },
          formatCurrency(e?.pris_grundmaterial_ex_moms)
        )
      ),
      el(
        "div",
        { class: "summary-row" },
        el("div", { class: "summary-label" }, "Resekostnad exkl. moms"),
        el(
          "div",
          { class: "summary-value" },
          formatCurrency(e?.pris_resekostnad_ex_moms)
        )
      ),
      el("div", { class: "summary-total" }, "Totalt efter ROT: ", formatCurrency(e?.pris_efter_rot))
    ),
    el(
      "div",
      { class: "helper" },
      "Detta är en preliminär uppskattning baserad på era val. En säljare från Jobryan kontaktar dig för att gå igenom detaljerna."
    )
  );
}

// --- navigation & actions -----------------------------------

function validateCurrentStep() {
  const f = state.form;
  const idx = state.stepIndex;

  if (idx === 0) {
    if (!f.kund_namn || !f.kund_tel || !f.kund_email) {
      return "Fyll i namn, telefon och e-post.";
    }
    if (!f.postnummer) return "Fyll i postnummer.";
  }

  if (idx === 1) {
    if (!f.kvm_golv || !f.kvm_vagg) {
      return "Fyll i golv- och väggyta.";
    }
  }

  return "";
}

async function goNext() {
  const error = validateCurrentStep();
  if (error) {
    setState({ error, success: "" });
    return;
  }

  // Last step? then nothing more
  if (state.stepIndex >= steps.length - 1) return;

  // If we are about to enter summary step, calculate estimate first
  if (state.stepIndex === 2) {
    await calculateEstimate();
  }

  setState({ stepIndex: state.stepIndex + 1 });
}

function goPrev() {
  if (state.stepIndex === 0 || state.loading) return;
  setState({ stepIndex: state.stepIndex - 1, error: "", success: "" });
}

async function calculateEstimate() {
  try {
    setState({ loading: true, error: "", success: "" });

    const f = state.form;

    const payload = {
      postnummer: f.postnummer,
      zon: Number(f.zon || 0),
      kvm_golv: Number(f.kvm_golv || 0),
      kvm_vagg: Number(f.kvm_vagg || 0),
      takhojd: Number(f.takhojd || 0),

      microcement_golv: f.microcement_golv,
      microcement_vagg: f.microcement_vagg,
      ny_troskel: f.ny_troskel,
      byta_dorrblad: f.byta_dorrblad,
      byta_karm_dorr: f.byta_karm_dorr,
      slipning_dorr: f.slipning_dorr,
      bankskiva_ovan_tm_tt: f.bankskiva_ovan_tm_tt,
      vaggskap: f.vaggskap,
      nytt_innertak: f.nytt_innertak,
      rivning_vaggar: Number(f.rivning_vaggar || 0),
      nya_vaggar_material: f.nya_vaggar_material,
      gerade_horn_meter: Number(f.gerade_horn_meter || 0),
      fyll_i_antal_meter: Number(f.fyll_i_antal_meter || 0),
      dolda_ror: f.dolda_ror,
    };

    const res = await fetch("/api/estimate/badrum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || "Kunde inte räkna ut priset.");
    }

    setState({ estimate: data, loading: false });
  } catch (err) {
    console.error(err);
    setState({
      loading: false,
      error: "Något gick fel vid prisberäkningen. Försök igen.",
    });
  }
}

async function sendOffer() {
  if (!state.estimate) {
    setState({ error: "Pris saknas. Klicka på 'Nästa' igen.", success: "" });
    return;
  }

  try {
    setState({ loading: true, error: "", success: "" });

    const body = {
      contact: {
        namn: state.form.kund_namn,
        email: state.form.kund_email,
        telefon: state.form.kund_tel,
        adress: state.form.kund_adress,
        postnummer: state.form.postnummer,
      },
      form: state.form,
      estimate: state.estimate,
    };

    const res = await fetch("/api/send-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || "Kunde inte skicka offerten.");
    }

    setState({
      loading: false,
      success: "Offerten är skickad! Vi hör av oss så snart vi kan.",
    });
  } catch (err) {
    console.error(err);
    setState({
      loading: false,
      error:
        "Kunde inte skicka offerten. Kontrollera uppgifterna eller försök igen senare.",
    });
  }
}

// --- render -------------------------------------------------

function render() {
  root.innerHTML = "";

  const step = steps[state.stepIndex];

  const header = el(
    "div",
    { class: "offert-header" },
    el(
      "div",
      null,
      el("div", { class: "offert-title" }, "Badrumsberäkning"),
      el(
        "div",
        { class: "offert-subtitle" },
        "Svar på några frågor – få en preliminär offert."
      )
    ),
    el(
      "div",
      null,
      el(
        "div",
        { class: "step-indicator" },
        `Steg ${state.stepIndex + 1} av ${steps.length}`
      ),
      el(
        "div",
        { class: "step-dots" },
        steps.map((s, idx) =>
          el("div", {
            class: "step-dot " + (idx === state.stepIndex ? "active" : ""),
          })
        )
      )
    )
  );

  const formEl = el(
    "form",
    {
      onsubmit: (e) => {
        e.preventDefault();
      },
    },
    state.error ? el("div", { class: "error-banner" }, state.error) : null,
    state.success ? el("div", { class: "success-banner" }, state.success) : null,
    step.id === "kontakt"
      ? renderKontaktStep()
      : step.id === "matt"
      ? renderMattStep()
      : step.id === "utforande"
      ? renderUtforandeStep()
      : renderSammanfattningStep()
  );

  const footer = el(
    "div",
    { class: "offert-footer" },
    el(
      "button",
      {
        type: "button",
        class: "btn btn-secondary",
        disabled: state.stepIndex === 0 || state.loading,
        onclick: goPrev,
      },
      "Tillbaka"
    ),
    step.id !== "sammanfattning"
      ? el(
          "button",
          {
            type: "button",
            class: "btn btn-primary",
            disabled: state.loading,
            onclick: goNext,
          },
          state.loading ? "Beräknar..." : "Nästa"
        )
      : el(
          "button",
          {
            type: "button",
            class: "btn btn-primary",
            disabled: state.loading,
            onclick: sendOffer,
          },
          state.loading ? "Skickar..." : "Skicka offert"
        )
  );

  root.appendChild(header);
  root.appendChild(formEl);
  root.appendChild(footer);
}

// initial render
render();

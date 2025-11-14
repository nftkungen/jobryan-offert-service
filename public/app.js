// public/app.js
// Frontend för Jobryan badrums-offert – multi-step wizard + summering

(function () {
  const form = document.getElementById("bathroom-form");
  const steps = Array.from(document.querySelectorAll(".step"));
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");
  const stepCounter = document.getElementById("step-counter");
  const stepBarFill = document.getElementById("step-bar-fill");
  const formStatus = document.getElementById("form-status");

  // summary DOM
  const summaryTagline = document.getElementById("summary-tagline");
  const summaryPriceMain = document.getElementById("summary-price-main");
  const summaryChip = document.getElementById("summary-chip");
  const summaryPropertyList = document.getElementById(
    "summary-property-list"
  );
  const summaryBathroomList = document.getElementById(
    "summary-bathroom-list"
  );
  const summaryPriceBreakdown = document.getElementById(
    "summary-price-breakdown"
  );

  // state
  let currentStep = 0;
  const totalSteps = steps.length;
  const state = {
    price: null,
    breakdown: null,
  };

  // -------- visa steg --------
  function showStep(index) {
    currentStep = Math.max(0, Math.min(totalSteps - 1, index));
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === currentStep);
    });

    btnPrev.disabled = currentStep === 0;
    btnPrev.style.visibility = currentStep === 0 ? "hidden" : "visible";

    if (currentStep === totalSteps - 1) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-flex";
    } else {
      btnNext.style.display = "inline-flex";
      btnSubmit.style.display = "none";
      btnNext.textContent =
        currentStep === totalSteps - 2 ? "Beräkna pris" : "Nästa steg";
    }

    stepCounter.textContent = `Steg ${currentStep + 1} av ${totalSteps}`;
    const pct = ((currentStep + 1) / totalSteps) * 100;
    stepBarFill.style.width = `${pct}%`;

    updateSummary();
  }

  // -------- samla data till payload --------
  function collectEstimatePayload() {
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((value, key) => {
      obj[key] = value;
    });

    // numeriska fält
    const numericKeys = [
      "zon",
      "kvm_golv",
      "kvm_vagg",
      "takhojd",
      "rivning_vaggar",
      "gerade_horn_meter",
      "fyll_i_antal_meter",
      "spotlight_antal",
      "eluttag_antal",
    ];
    numericKeys.forEach((k) => {
      if (obj[k] !== undefined && obj[k] !== "") {
        const num = Number(obj[k]);
        if (!Number.isNaN(num)) obj[k] = num;
      }
    });

    return obj;
  }

  // -------- uppdatera summering --------
  function updateSummary() {
    const fd = new FormData(form);

    // fastighetsinfo
    const address = fd.get("address") || "Adress ej angiven";
    const propertyType = fd.get("property_type") || "–";
    const era = fd.get("era") || "–";
    const floor = fd.get("floor") || "–";
    const elevator = fd.get("elevator") || "–";

    summaryPropertyList.innerHTML = `
      <li><strong>${address}</strong></li>
      <li>${propertyType}, ${era}</li>
      <li>Våningsplan: ${floor}, hiss: ${elevator}</li>
    `;

    // badrum / snickeri / VVS / el
    const kvmGolv = fd.get("kvm_golv") || "–";
    const kvmVagg = fd.get("kvm_vagg") || "–";
    const takhojd = fd.get("takhojd") || "–";
    const zon = fd.get("zon") || "–";

    const microGolv = fd.get("microcement_golv") || "Nej";
    const microVagg = fd.get("microcement_vagg") || "Nej";
    const golvv = fd.get("golvvarme") || "Nej";
    const handdukstork = fd.get("handdukstork") || "Nej";

    const snickeriPills = [];
    if (microGolv === "Ja") snickeriPills.push("Microcement golv");
    if (microVagg === "Ja") snickeriPills.push("Microcement vägg");
    if ((fd.get("nytt_innertak") || "Nej") === "Ja")
      snickeriPills.push("Nytt innertak");
    if ((fd.get("vaggskap") || "Nej") === "Ja") snickeriPills.push("Väggskåp");
    if ((fd.get("ny_troskel") || "Nej") === "Ja") snickeriPills.push("Ny tröskel");
    if ((fd.get("byta_karm_dorr") || "Nej") === "Ja")
      snickeriPills.push("Byta karm + dörr");
    if ((fd.get("byta_dorrblad") || "Nej") === "Ja")
      snickeriPills.push("Byta dörrblad");
    if ((fd.get("bankskiva_ovan_tm_tt") || "Nej") === "Ja")
      snickeriPills.push("Bänkskiva ovan TM/TT");
    if ((fd.get("slipning_dorr") || "Nej") === "Ja")
      snickeriPills.push("Slipa dörr");
    if (Number(fd.get("rivning_vaggar") || 0) > 0)
      snickeriPills.push(
        `Rivning väggar: ${fd.get("rivning_vaggar")} st`
      );
    if ((fd.get("nya_vaggar_material") || "Nej") !== "Nej")
      snickeriPills.push(`Nya väggar: ${fd.get("nya_vaggar_material")}`);
    if (Number(fd.get("gerade_horn_meter") || 0) > 0)
      snickeriPills.push(`Gerade hörn: ${fd.get("gerade_horn_meter")} m`);
    if (Number(fd.get("fyll_i_antal_meter") || 0) > 0)
      snickeriPills.push(`Fris: ${fd.get("fyll_i_antal_meter")} m`);

    const vvsPills = [];
    if ((fd.get("dolda_ror") || "Nej") === "Ja") vvsPills.push("Dolda rör");
    const wc = fd.get("wc");
    if (wc && wc !== "Ingen WC") vvsPills.push(wc);
    if ((fd.get("byte_avloppsgroda") || "Nej") === "Ja")
      vvsPills.push("Byte av avloppsgroda");
    if ((fd.get("ny_slutsbotten") || "Nej") === "Ja")
      vvsPills.push("Ny slutsbotten");
    const brunn = fd.get("brunn");
    if (brunn && brunn !== "Standard") vvsPills.push(brunn);
    const duschblandare = fd.get("duschblandare");
    if (duschblandare && duschblandare !== "Standard")
      vvsPills.push(duschblandare);
    const tvattBlandare = fd.get("tvattstallsblandare");
    if (tvattBlandare && tvattBlandare !== "Standard")
      vvsPills.push(tvattBlandare);
    const tvattKommod = fd.get("tvattstall_kommod");
    if (tvattKommod) vvsPills.push(tvattKommod);
    if ((fd.get("tvattmaskin") || "Nej") === "Ja") vvsPills.push("Tvättmaskin");
    if ((fd.get("torktumlare") || "Nej") === "Ja")
      vvsPills.push("Torktumlare");
    if ((fd.get("torkskap") || "Nej") === "Ja") vvsPills.push("Torkskåp");
    if ((fd.get("inklakat_badkar") || "Nej") === "Ja")
      vvsPills.push("Inklakat badkar");
    if ((fd.get("varmepanna_vvb") || "Nej") === "Ja")
      vvsPills.push("Värmepanna/VVB");

    const elPills = [];
    const takbelysning = fd.get("takbelysning");
    if (takbelysning) elPills.push(`Tak: ${takbelysning}`);
    if (Number(fd.get("spotlight_antal") || 0) > 0)
      elPills.push(fd.get("spotlight_antal") + " spotlights");
    if (golvv === "Ja") elPills.push("Golvvärme");
    if (handdukstork === "Ja") elPills.push("Handdukstork");
    if (Number(fd.get("eluttag_antal") || 0) > 0)
      elPills.push(`Eluttag: ${fd.get("eluttag_antal")} st`);
    if ((fd.get("el_nisch") || "Nej") === "Ja") elPills.push("Nisch");
    const elSpegel = fd.get("el_spegel");
    if (elSpegel && elSpegel !== "Standard") elPills.push(elSpegel);
    if ((fd.get("byte_elcentral") || "Nej") === "Ja")
      elPills.push("Byte av elcentral");
    if ((fd.get("pax_flakt") || "Nej") === "Ja") elPills.push("PAX-fläkt");

    summaryBathroomList.innerHTML = `
      <li>Golv: <strong>${kvmGolv} m²</strong> · Vägg: <strong>${kvmVagg} m²</strong> · Takhöjd: <strong>${takhojd} m</strong></li>
      <li>Zon: <strong>${zon}</strong></li>
      <li style="margin-top:4px;">Snickeri:</li>
      <li>
        <div class="pill-row">
          ${
            snickeriPills.length
              ? snickeriPills
                  .map((t) => `<span class="pill badge-good">${t}</span>`)
                  .join("")
              : '<span class="pill">Standardutförande</span>'
          }
        </div>
      </li>
      <li style="margin-top:4px;">VVS:</li>
      <li>
        <div class="pill-row">
          ${
            vvsPills.length
              ? vvsPills
                  .map((t) => `<span class="pill badge-good">${t}</span>`)
                  .join("")
              : '<span class="pill">Standard</span>'
          }
        </div>
      </li>
      <li style="margin-top:4px;">El:</li>
      <li>
        <div class="pill-row">
          ${
            elPills.length
              ? elPills
                  .map((t) => `<span class="pill badge-good">${t}</span>`)
                  .join("")
              : '<span class="pill">Grundbelysning</span>'
          }
        </div>
      </li>
    `;

    // pris-sammanfattning
    if (state.price && state.price.ok) {
      const total = Number(state.price.pris_totalt_ink_moms || 0);
      if (Number.isFinite(total) && total > 0) {
        summaryPriceMain.textContent =
          total.toLocaleString("sv-SE") + " kr";
        summaryChip.style.display = "inline-flex";
        summaryTagline.textContent =
          "Preliminärt pris – justeras efter platsbesök.";
      }

      const parts = [];
      if (state.price.pris_arbete_ex_moms != null) {
        parts.push(
          `Arbete exkl. moms: <strong>${Number(
            state.price.pris_arbete_ex_moms
          ).toLocaleString("sv-SE")} kr</strong>`
        );
      }
      if (state.price.pris_grundmaterial_ex_moms != null) {
        parts.push(
          `Grundmaterial exkl. moms: <strong>${Number(
            state.price.pris_grundmaterial_ex_moms
          ).toLocaleString("sv-SE")} kr</strong>`
        );
      }
      if (state.price.pris_resekostnad_ex_moms != null) {
        parts.push(
          `Resekostnad exkl. moms: <strong>${Number(
            state.price.pris_resekostnad_ex_moms
          ).toLocaleString("sv-SE")} kr</strong>`
        );
      }

      summaryPriceBreakdown.innerHTML = parts
        .map((p) => `<li>${p}</li>`)
        .join("");
    } else {
      summaryPriceMain.textContent = "–";
      summaryChip.style.display = "none";
      summaryPriceBreakdown.innerHTML =
        "<li>Arbete, material m.m. visas efter beräkning.</li>";
    }
  }

  // -------- API: räkna fram offert --------
  async function calculateEstimate() {
    const payload = collectEstimatePayload();

    formStatus.textContent = "Beräknar pris …";
    btnNext.disabled = true;

    try {
      const res = await fetch("/api/estimate/badrum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[estimate] response", data);
      state.price = data;
      state.breakdown = data.sheet || null;

      if (!data.ok) {
        formStatus.textContent =
          "Kunde inte beräkna pris (kontakta Jobryan om felet kvarstår).";
      } else {
        formStatus.textContent = "Pris beräknat.";
      }
    } catch (err) {
      console.error("estimate error", err);
      state.price = null;
      formStatus.textContent =
        "Tekniskt fel vid beräkning, försök igen om en stund.";
    } finally {
      btnNext.disabled = false;
      updateSummary();
    }
  }

  // -------- API: skicka offert (du kopplar /api/offert i servern) --------
  async function sendOffer() {
    const payload = collectEstimatePayload();
    payload.price_result = state.price || null;

    formStatus.textContent = "Skickar offertförfrågan …";
    btnSubmit.disabled = true;

    try {
      const res = await fetch("/api/offert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      formStatus.textContent = "Offertförfrågan skickad!";
    } catch (err) {
      console.error("send offer error", err);
      formStatus.textContent =
        "Kunde inte skicka automatiskt – prova igen eller kontakta Jobryan.";
    } finally {
      btnSubmit.disabled = false;
    }
  }

  // -------- events --------
  btnPrev.addEventListener("click", () => {
    showStep(currentStep - 1);
  });

  btnNext.addEventListener("click", async () => {
    if (currentStep === 2) {
      // när vi lämnar steg 3 -> kör kalkyl
      await calculateEstimate();
      showStep(currentStep + 1);
    } else {
      showStep(currentStep + 1);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendOffer();
  });

  form.addEventListener("input", (e) => {
    if (e.target.id === "kvm_golv_slider") {
      const v = Number(e.target.value);
      document.getElementById("kvm_golv_text").textContent = v.toString();
      document.getElementById("kvm_golv").value = v.toString();
    }
    updateSummary();
  });

  // init
  const slider = document.getElementById("kvm_golv_slider");
  if (slider) {
    document.getElementById("kvm_golv_text").textContent = slider.value;
    document.getElementById("kvm_golv").value = slider.value;
  }
  showStep(0);
})();

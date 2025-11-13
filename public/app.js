// ========== Jobryan – Offert & prisberäkning frontend ==========

function getField(name) {
  const el = document.querySelector(`[name="${name}"]`);
  if (!el) return undefined;

  if (el.tagName === "SELECT") {
    return el.value || undefined;
  }

  if (el.type === "number") {
    if (!el.value) return undefined;
    return Number(el.value);
  }

  return el.value || undefined;
}

function collectBadrumPayload() {
  return {
    postnummer: getField("postnummer"),
    zon: getField("zon"),
    kvm_golv: getField("kvm_golv"),
    kvm_vagg: getField("kvm_vagg"),
    takhojd: getField("takhojd"),
    microcement_golv: getField("microcement_golv"),
    microcement_vagg: getField("microcement_vagg"),
    ny_troskel: getField("ny_troskel"),
    byta_dorrblad: getField("byta_dorrblad"),
    byta_karm_dorr: getField("byta_karm_dorr"),
    slipning_dorr: getField("slipning_dorr"),
    bankskiva_ovan_tm_tt: getField("bankskiva_ovan_tm_tt"),
    vaggskap: getField("vaggskap"),
    nytt_innertak: getField("nytt_innertak"),
    rivning_vaggar: getField("rivning_vaggar"),
    nya_vaggar_material: getField("nya_vaggar_material"),
    gerade_horn_meter: getField("gerade_horn_meter"),
    fyll_i_antal_meter: getField("fyll_i_antal_meter"),
    dolda_ror: getField("dolda_ror")
  };
}

function updatePriceSummary(result) {
  const box = document.getElementById("price-summary-content");

  if (!result) {
    box.innerHTML = `<div class="error-text">Tekniskt fel – inget svar.</div>`;
    return;
  }

  if (result.ok === false) {
    box.innerHTML = `<div class="error-text">Fel i kalkylen: ${result.error}</div>`;
    return;
  }

  const arbete = result.pris_arbete_ex_moms ?? "-";
  const extra = result.pris_extra_arbete_ex_moms ?? "-";
  const material = result.pris_material_ex_moms ?? "-";
  const total = result.pris_totalt_ink_moms ?? "-";

  box.innerHTML = `
    <div class="summary-grid">
      <div>
        <div class="summary-label">Arbete exkl. moms</div>
        <div class="summary-value">${arbete}</div>
      </div>
      <div>
        <div class="summary-label">Extra arbete exkl. moms</div>
        <div class="summary-value">${extra}</div>
      </div>
      <div>
        <div class="summary-label">Material exkl. moms</div>
        <div class="summary-value">${material}</div>
      </div>
      <div>
        <div class="summary-label">Totalt inkl. moms</div>
        <div class="summary-value">${total}</div>
      </div>
    </div>
    <div class="summary-note">
      Detta är en preliminär prisbild baserad på era uppgifter.
      Slutlig offert skickas efter genomgång av projektet.
    </div>
  `;
}

async function calculateBadrumEstimate() {
  const btn = document.getElementById("calc-price-btn");
  const box = document.getElementById("price-summary-content");

  const payload = collectBadrumPayload();

  if (!payload.postnummer) {
    box.innerHTML = `<div class="error-text">Fyll i postnummer.</div>`;
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Beräknar...";

    box.innerHTML = `<span style="color:#555;">Beräknar pris...</span>`;

    const res = await fetch("/api/estimate/badrum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("RESULT:", data);

    updatePriceSummary(data);

  } catch (err) {
    console.error(err);
    box.innerHTML = `<div class="error-text">Tekniskt fel.</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Beräkna pris för badrum";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calc-price-btn")
    .addEventListener("click", calculateBadrumEstimate);
});

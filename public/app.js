// ========== Jobryan – Offert & prisberäkning frontend ==========

/**
 * Helper: get value from a named input/select.
 */
function getField(name) {
  const el = document.querySelector(`[name="${name}"]`);
  if (!el) return undefined;

  if (el.tagName === "SELECT") {
    return el.value || undefined;
  }

  if (el.type === "number") {
    if (el.value === "" || el.value === null) return undefined;
    const n = Number(el.value);
    return Number.isFinite(n) ? n : undefined;
  }

  return el.value || undefined;
}

/**
 * Build payload for /api/estimate/badrum from the form.
 * Names here MUST match the sheet / Apps Script expectations.
 */
function collectBadrumPayload() {
  return {
    postnummer:           getField("postnummer"),
    zon:                  getField("zon"),
    kvm_golv:             getField("kvm_golv"),
    kvm_vagg:             getField("kvm_vagg"),
    takhojd:              getField("takhojd"),
    microcement_golv:     getField("microcement_golv"),
    microcement_vagg:     getField("microcement_vagg"),
    ny_troskel:           getField("ny_troskel"),
    byta_dorrblad:        getField("byta_dorrblad"),
    byta_karm_dorr:       getField("byta_karm_dorr"),
    slipning_dorr:        getField("slipning_dorr"),
    bankskiva_ovan_tm_tt: getField("bankskiva_ovan_tm_tt"),
    vaggskap:             getField("vaggskap"),
    nytt_innertak:        getField("nytt_innertak"),
    rivning_vaggar:       getField("rivning_vaggar"),
    nya_vaggar_material:  getField("nya_vaggar_material"),
    gerade_horn_meter:    getField("gerade_horn_meter"),
    fyll_i_antal_meter:   getField("fyll_i_antal_meter"),
    dolda_ror:            getField("dolda_ror"),
  };
}

/**
 * Update the summary box with the result from the backend.
 * Expected response shape (from Apps Script):
 * {
 *   ok: true,
 *   pris_arbete_ex_moms: 'Ingår i Grundpris',
 *   pris_extra_arbete_ex_moms: 15000,
 *   pris_material_ex_moms: 'n/a',
 *   pris_totalt_ink_moms: 'Ingår i grundpris'
 * }
 */
function updatePriceSummary(result) {
  const container = document.getElementById("price-summary-content");
  if (!container) return;

  if (!result) {
    container.innerHTML =
      '<div class="error-text">Tekniskt fel – inget svar.</div>';
    return;
  }

  if (result.ok === false && result.error) {
    container.innerHTML =
      '<div class="error-text">Fel från kalkylen: ' +
      String(result.error) +
      "</div>";
    return;
  }

  // Extract values with sane fallbacks
  const arbete = result.pris_arbete_ex_moms ?? "-";
  const extra = result.pris_extra_arbete_ex_moms ?? "-";
  const material = result.pris_material_ex_moms ?? "-";
  const total = result.pris_totalt_ink_moms ?? "-";

  container.innerHTML = `
    <div class="summary-grid">
      <div>
        <div class="summary-label">Arbete exkl. moms</div>
        <div class="summary-value">${arbe
te}</div>
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
      Detta är en preliminär prisbild baserad på era uppgifter och Jobryans interna kalkyl.
      Slutlig offert skickas efter genomgång av projektet.
    </div>
  `;
}

/**
 * Call backend and calculate estimate.
 */
async function calculateBadrumEstimate() {
  const btn = document.getElementById("calc-price-btn");
  const container = document.getElementById("price-summary-content");

  const payload = collectBadrumPayload();

  if (!payload.postnummer) {
    container.innerHTML =
      '<div class="error-text">Fyll i minst postnummer innan du beräknar pris.</div>';
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Beräknar...";
    }
    container.innerHTML =
      '<span style="color:#4b5563;">Beräknar pris utifrån dina uppgifter...</span>';

    const res = await fetch("/api/estimate/badrum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    // For debugging:
    console.log("[offert] estimate result:", data);

    updatePriceSummary(data);
  } catch (err) {
    console.error("[offert] estimate error", err);
    container.innerHTML =
      '<div class="error-text">Tekniskt fel vid beräkning. Försök igen eller kontakta oss.</div>';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Beräkna pris för badrum";
    }
  }
}

// Attach handler on load
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("calc-price-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      calculateBadrumEstimate();
    });
  }
});

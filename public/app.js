// =========================================
//  Jobryan – Badrum offert front-end
// =========================================

// ---------- 1. Grabbing DOM elements ----------

const badrumForm = document.querySelector('#badrum-form');
const calcButton = document.querySelector('#calc-badrum-btn');
const resultBox  = document.querySelector('#badrum-result');
const errorBox   = document.querySelector('#badrum-error');

// safety check
if (badrumForm && calcButton) {
  calcButton.addEventListener('click', (e) => {
    e.preventDefault();
    calculateBadrumPrice();
  });
} else {
  console.warn('[offert] badrum-form or calc button not found in DOM');
}

// ---------- 2. Build payload from form ----------

function getField(name) {
  if (!badrumForm || !badrumForm.elements[name]) return '';
  return badrumForm.elements[name].value;
}

function buildBadrumPayload() {
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? '' : n;
  };

  return {
    postnummer:          getField('postnummer'),
    zon:                 toNumber(getField('zon')),
    kvm_golv:            toNumber(getField('kvm_golv')),
    kvm_vagg:            toNumber(getField('kvm_vagg')),
    takhojd:             toNumber(getField('takhojd')),

    microcement_golv:    getField('microcement_golv'),
    microcement_vagg:    getField('microcement_vagg'),
    ny_troskel:          getField('ny_troskel'),
    byta_dorrblad:       getField('byta_dorrblad'),
    byta_karm_dorr:      getField('byta_karm_dorr'),
    slipning_dorr:       getField('slipning_dorr'),
    bankskiva_ovan_tm_tt:getField('bankskiva_ovan_tm_tt'),
    vaggskap:            getField('vaggskap'),

    nytt_innertak:       getField('nytt_innertak'),
    rivning_vaggar:      getField('rivning_vaggar'),
    nya_vaggar_material: getField('nya_vaggar_material'),
    gerade_horn_meter:   toNumber(getField('gerade_horn_meter')),
    fyll_i_antal_meter:  toNumber(getField('fyll_i_antal_meter')),
    dolda_ror:           getField('dolda_ror'),
  };
}

// ---------- 3. Call backend & handle states ----------

async function calculateBadrumPrice() {
  if (!resultBox) return;

  clearError();
  setLoading(true);

  try {
    const body = buildBadrumPayload();

    const res = await fetch('/api/estimate/badrum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('[offert] RESULT:', data);

    if (!data.ok) {
      showError('Fel vid beräkning: ' + (data.error || 'okänt fel'));
      resultBox.innerHTML = '';
      return;
    }

    renderBadrumResult(data);
  } catch (err) {
    console.error(err);
    showError('Tekniskt fel. Försök igen eller kontakta Jobryan.');
    resultBox.innerHTML = '';
  } finally {
    setLoading(false);
  }
}

// ---------- 4. Render result nicely ----------

function formatMoney(value) {
  if (value === '' || value == null) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString('sv-SE', {
      maximumFractionDigits: 0,
    }) + ' kr';
  }
  // for strings like "Ingår i grundpris"
  return value;
}

function renderBadrumResult(data) {
  if (!resultBox) return;

  const arbete   = formatMoney(data.pris_arbete_ex_moms);
  const material = formatMoney(data.pris_grundmaterial_ex_moms);
  const resa     = formatMoney(data.pris_resekostnad_ex_moms);
  const soph     = formatMoney(data.pris_sophantering_ex_moms);
  const totalEx  = formatMoney(data.totalt_ex_moms);
  const rot      = formatMoney(data.rot);
  const efterRot = formatMoney(data.pris_efter_rot);

  resultBox.innerHTML = `
    <div class="offert-summary">
      <h3 class="offert-summary__title">Sammanfattning & preliminärt pris</h3>

      <div class="offert-summary__cards">
        <div class="offert-card">
          <span class="offert-card__label">Arbetskostnad exkl. moms</span>
          <span class="offert-card__value">${arbete}</span>
        </div>
        <div class="offert-card">
          <span class="offert-card__label">Material exkl. moms</span>
          <span class="offert-card__value">${material}</span>
        </div>
        <div class="offert-card">
          <span class="offert-card__label">Resekostnad exkl. moms</span>
          <span class="offert-card__value">${resa}</span>
        </div>
        <div class="offert-card">
          <span class="offert-card__label">Sophantering exkl. moms</span>
          <span class="offert-card__value">${soph}</span>
        </div>
      </div>

      <div class="offert-summary__total-block">
        <div class="offert-total-row">
          <span>Totalt exkl. moms</span>
          <strong>${totalEx}</strong>
        </div>
        <div class="offert-total-row offert-total-row--muted">
          <span>ROT-avdrag</span>
          <strong>${rot}</strong>
        </div>
        <div class="offert-total-row offert-total-row--highlight">
          <span>Preliminärt pris efter ROT</span>
          <strong>${efterRot}</strong>
        </div>
      </div>

      <p class="offert-summary__disclaimer">
        * Priset är en preliminär uppskattning baserad på de uppgifter du fyllt i.
        Slutligt pris beror på skick, underlag och eventuella tillval/ändringar.
      </p>
    </div>
  `;
}

// ---------- 5. UI helpers (loading + errors) ----------

function setLoading(isLoading) {
  if (!calcButton) return;
  if (isLoading) {
    calcButton.disabled = true;
    calcButton.dataset.originalText = calcButton.textContent;
    calcButton.textContent = 'Beräknar...';
  } else {
    calcButton.disabled = false;
    if (calcButton.dataset.originalText) {
      calcButton.textContent = calcButton.dataset.originalText;
    }
  }
}

function showError(msg) {
  if (!errorBox) {
    alert(msg);
    return;
  }
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}

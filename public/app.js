// ======== FRONTEND – BADRUM OFFERT ========

// 1) Get reference to the form + button + result area
const badrumForm   = document.querySelector('#badrum-form');
const calcButton   = document.querySelector('#calc-badrum-btn');
const resultBox    = document.querySelector('#badrum-result');

if (calcButton && badrumForm && resultBox) {
  calcButton.addEventListener('click', (e) => {
    e.preventDefault();
    calculateBadrumPrice();
  });
}

// 2) Helper: read all inputs from the form and build the payload
function buildBadrumPayload() {
  const form = badrumForm;
  const get = (name) => form.elements[name]?.value ?? '';

  return {
    postnummer:          get('postnummer'),
    zon:                 Number(get('zon')) || '',
    kvm_golv:            Number(get('kvm_golv')) || '',
    kvm_vagg:            Number(get('kvm_vagg')) || '',
    takhojd:             Number(get('takhojd')) || '',

    microcement_golv:    get('microcement_golv'),
    microcement_vagg:    get('microcement_vagg'),
    ny_troskel:          get('ny_troskel'),
    byta_dorrblad:       get('byta_dorrblad'),
    byta_karm_dorr:      get('byta_karm_dorr'),
    slipning_dorr:       get('slipning_dorr'),
    bankskiva_ovan_tm_tt:get('bankskiva_ovan_tm_tt'),
    vaggskap:            get('vaggskap'),

    nytt_innertak:       get('nytt_innertak'),
    rivning_vaggar:      get('rivning_vaggar'),
    nya_vaggar_material: get('nya_vaggar_material'),
    gerade_horn_meter:   get('gerade_horn_meter'),
    fyll_i_antal_meter:  get('fyll_i_antal_meter'),
    dolda_ror:           get('dolda_ror')
  };
}

// 3) Call the backend
async function calculateBadrumPrice() {
  try {
    resultBox.textContent = 'Beräknar pris...';

    const payload = buildBadrumPayload();

    const res = await fetch('/api/estimate/badrum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('[offert] RESULT:', data);

    if (!data.ok) {
      resultBox.textContent = 'Fel vid beräkning: ' + (data.error || 'okänt fel');
      return;
    }

    renderBadrumResult(data);

  } catch (err) {
    console.error(err);
    resultBox.textContent = 'Tekniskt fel. Försök igen.';
  }
}

// 4) Show the prices in the UI
function renderBadrumResult(data) {
  const fmt = (x) =>
    typeof x === 'number'
      ? x.toLocaleString('sv-SE', { maximumFractionDigits: 0 }) + ' kr'
      : x;

  resultBox.innerHTML = `
    <h3>Sammanfattning – Badrum</h3>
    <p><strong>Arbetskostnad exkl. moms:</strong> ${fmt(data.pris_arbete_ex_moms)}</p>
    <p><strong>Material exkl. moms:</strong> ${fmt(data.pris_grundmaterial_ex_moms)}</p>
    <p><strong>Resekostnad exkl. moms:</strong> ${fmt(data.pris_resekostnad_ex_moms)}</p>
    <p><strong>Sophantering exkl. moms:</strong> ${fmt(data.pris_sophantering_ex_moms)}</p>
    <hr>
    <p><strong>Totalt exkl. moms:</strong> ${fmt(data.totalt_ex_moms)}</p>
    <p><strong>ROT-avdrag:</strong> ${fmt(data.rot)}</p>
    <p><strong>Pris efter ROT:</strong> ${fmt(data.pris_efter_rot)}</p>
  `;
}

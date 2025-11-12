/* CSP-safe front-end for Jobryan offertformulär */
(() => {
  const SEND_ENDPOINT = "https://jobryan-offert-service.onrender.com/api/send-offer";
  const PRICE_URL     = "https://jobryan-offert-service.onrender.com/api/prices";

  // Safe defaults so calc() never crashes
  let PRICE = {
    moms: 0.25, rot_rate: 0.30, rut_rate: 0.50, min_debitering: 0,
    zon: {"1":0,"2":0,"3":0},
    kvadrat: { golv: 0, vagg: 0 },
    finish: {},
    grundmaterial: {"Ja":0,"Nej":0},
    vvs: { dolda_ror: {"Ja":0,"Nej":0}, wc_typ: {"Väggmonterad":0,"Golvstående":0} },
    el: { spot:0, golvv:{"Ja El":0,"Nej":0}, handdukt:{"Ja":0,"Nej":0}, nisch:{"Med belysning":0,"Utan belysning":0} }
  };

  const steps = Array.from(document.querySelectorAll('.step'));
  const pbar  = document.getElementById('pbar');
  const plabel= document.getElementById('plabel');
  const back  = document.getElementById('back');
  const next  = document.getElementById('next');
  const save  = document.getElementById('save');

  if (!steps.length) {
    console.error('[offert] No .step sections in DOM');
    return;
  }

  let i = steps.findIndex(s => s.classList.contains('active'));
  if (i < 0) i = 0;

  const state = {
    typer: [], ovrigt: "", adress:"", postnr:"", zon:"1",
    kvm_golv:0, kvm_vagg:0,
    finish:"Kakel/klinker", grundmat:"Ja",
    dolda_ror:"Nej", wc_typ:"Väggmonterad",
    spots:0, golvv:"Nej", handdukt:"Nej", nisch:"Utan belysning",
    tax_deduction:"Ingen", ded_persons:1,
    namn:"", epost:"", telefon:""
  };

  function money(n){ return new Intl.NumberFormat('sv-SE',{style:'currency',currency:'SEK',maximumFractionDigits:0}).format(n||0); }
  function num(v){ const f = parseFloat(v); return isNaN(f)?0:f; }
  function pick(name, def){ const r = document.querySelector(`input[name="${name}"]:checked`); return r? r.value : def; }
  function picks(name){ return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(x=>x.value); }

  function syncFromUI(){
    try{
      state.typer = picks('typer');
      state.ovrigt = (document.getElementById('ovrigt')?.value || "").trim();
      state.adress = (document.getElementById('adress')?.value || "").trim();
      state.postnr = (document.getElementById('postnr')?.value || "").trim();
      state.zon = pick('zon', state.zon);

      state.kvm_golv = num(document.getElementById('kvm_golv')?.value);
      state.kvm_vagg = num(document.getElementById('kvm_vagg')?.value);

      state.finish   = pick('finish', state.finish);
      state.grundmat = pick('grundmat', state.grundmat);

      state.dolda_ror= pick('dolda_ror', state.dolda_ror);
      state.wc_typ   = pick('wc_typ', state.wc_typ);

      state.spots    = num(document.getElementById('spots')?.value);
      state.golvv    = pick('golvv', state.golvv);
      state.handdukt = pick('handdukt', state.handdukt);
      state.nisch    = pick('nisch', state.nisch);

      state.tax_deduction = pick('tax_deduction', state.tax_deduction);
      state.ded_persons = Math.max(1, Math.min(4, num(document.getElementById('ded_persons')?.value || 1)));

      state.namn = (document.getElementById('namn')?.value || "").trim();
      state.epost= (document.getElementById('epost')?.value || "").trim();
      state.telefon = (document.getElementById('telefon')?.value || "").trim();
    }catch(e){ console.warn("[offert] sync warn:", e.message); }
  }

  function calc(){
    const moms   = PRICE.moms ?? 0.25;
    const rotRate= PRICE.rot_rate ?? 0.30;
    const rutRate= PRICE.rut_rate ?? 0.50;

    let arbete=0, material=0;
    const area = (state.kvm_golv||0)+(state.kvm_vagg||0);

    arbete += (PRICE.zon?.[state.zon] || 0);
    arbete += (state.kvm_golv||0) * (PRICE.kvadrat?.golv || 0);
    arbete += (state.kvm_vagg||0) * (PRICE.kvadrat?.vagg || 0);

    const fin = PRICE.finish?.[state.finish] || {base:0, per_m2:0};
    arbete += (fin.base||0) + area*(fin.per_m2||0);

    material += (PRICE.grundmaterial?.[state.grundmat] || 0);
    arbete   += (PRICE.vvs?.dolda_ror?.[state.dolda_ror] || 0);
    arbete   += (PRICE.vvs?.wc_typ?.[state.wc_typ] || 0);

    arbete   += (state.spots||0) * (PRICE.el?.spot || 0);
    if (state.golvv === "Ja El") arbete += (PRICE.el?.golvv?.["Ja El"] || 0);
    if (state.handdukt === "Ja") arbete += (PRICE.el?.handdukt?.Ja || 0);
    if (state.nisch === "Med belysning") arbete += (PRICE.el?.nisch?.["Med belysning"] || 0);

    const minDeb = PRICE.min_debitering || 0;
    if (minDeb && (arbete + material) < minDeb) arbete += (minDeb - (arbete + material));

    const exmoms = arbete + material;
    const momsBelopp = exmoms * moms;
    const inklmoms = exmoms + momsBelopp;

    // ROT/RUT
    let prelimDed=0, after=inklmoms;
    const rate = state.tax_deduction==="ROT" ? rotRate : state.tax_deduction==="RUT" ? rutRate : 0;
    if (rate>0){
      const arbetInk = arbete*(1+moms);
      const capPerPerson = state.tax_deduction==="ROT" ? 50000 : 75000;
      prelimDed = Math.min(state.ded_persons*capPerPerson, Math.round(arbetInk*rate));
      after = Math.max(0, inklmoms - prelimDed);
    }
    return {arbete,material,exmoms,momsBelopp,inklmoms,prelimDed,after};
  }

  function paint(){
    steps.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    if (pbar)  pbar.style.width = ((i+1)/steps.length*100)+'%';
    if (plabel) plabel.textContent = `Steg ${i+1} av ${steps.length}`;
    if (back) back.disabled = (i===0);
    if (next) next.textContent = (i===steps.length-1) ? 'Skicka' : 'Nästa';

    // summary
    try{
      syncFromUI();
      const r = calc();
      const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
      set('sArbete', money(r.arbete));
      set('sMat',    money(r.material));
      set('sMoms',   money(r.momsBelopp));
      set('sTot',    money(r.inklmoms));
      const row = document.getElementById('sDedRow');
      if (row){
        if (r.prelimDed>0){ row.classList.remove('hidden'); set('sDed',money(r.prelimDed)); set('sAfter',money(r.after)); }
        else row.classList.add('hidden');
      }
    }catch(e){ console.warn('[offert] paint warn:', e.message); }
  }

  function go(delta){
    try{
      i = Math.max(0, Math.min(steps.length-1, i + delta));
      paint();
    }catch(e){
      console.error('[offert] go error', e);
      i = Math.max(0, Math.min(steps.length-1, i + delta));
      steps.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    }
  }

  async function submitOffer(){
    syncFromUI();
    try {
      const fd = new FormData();
      fd.append('_meta_title','Offertförfrågan');
      for (const [k,v] of Object.entries(state)){
        fd.append(k, Array.isArray(v)? v.join(', ') : String(v));
      }
      const filesEl = document.getElementById('filer');
      if (filesEl) for (const f of filesEl.files) fd.append('files', f);

      next.disabled = true; next.textContent = 'Skickar…';
      const res = await fetch(SEND_ENDPOINT, { method:'POST', body: fd });
      if(!res.ok) throw new Error('Serverfel: '+res.status);
      alert('Tack! Vi har mottagit din förfrågan.');
      location.reload();
    } catch(e){
      console.error(e);
      alert('Kunde inte skicka. Försök igen senare.');
    } finally {
      next.disabled = false; paint();
    }
  }

  // Wire buttons (capture so we win even if other code misbehaves)
  back?.addEventListener('click', e => { e.preventDefault(); go(-1); }, {capture:true});
  next?.addEventListener('click', e => {
    e.preventDefault();
    if (i < steps.length-1) go(1);
    else submitOffer();
  }, {capture:true});
  save?.addEventListener('click', () => {
    try { navigator.clipboard.writeText(JSON.stringify(state)); } catch {}
  });

  // Load prices (non-blocking)
  (async () => {
    try{
      const r = await fetch(PRICE_URL, {cache:'no-store'});
      if (!r.ok) throw new Error('HTTP '+r.status);
      PRICE = await r.json();
    }catch(e){
      console.warn("[offert] prislista kunde inte laddas, kör defaults:", e.message);
    }finally{
      paint();
    }
  })();

  // initial paint
  paint();
})();

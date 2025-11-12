/* Dynamic, CSP-safe offertformulär that renders ALL Excel items */

(() => {
  const SEND_ENDPOINT = "/api/send-offer";
  const PRICE_URL     = "/api/prices";

  // --- DOM ---
  const stepsEl = document.getElementById("steps");
  const pbar    = document.getElementById("pbar");
  const plabel  = document.getElementById("plabel");
  const back    = document.getElementById("back");
  const next    = document.getElementById("next");
  const save    = document.getElementById("save");

  // --- Global state ---
  let PRICE = null;
  let steps = [];           // array of step <section> elements
  let current = 0;

  // Everything the user selects/enters
  const state = {
    // quantities per item key: `${cat}|${name}`
    items: {}, // { key: number }
    // address & contact
    adress:"", postnr:"", zon:"1",
    namn:"", epost:"", telefon:"",
    // ROT/RUT
    tax_deduction:"Ingen", ded_persons:1,
    // free text
    ovrigt:""
  };

  const fmtMoney = n => new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK",maximumFractionDigits:0}).format(n||0);
  const num = v => { const f = parseFloat(v); return isNaN(f)?0:f; };

  // ---------------- Build UI ----------------

  function buildStaticIntro(){
    const sec = document.createElement("section");
    sec.className = "step";
    sec.innerHTML = `
      <div class="section">
        <h2>Beskrivning</h2>
        <label class="lbl">Berätta vad du vill få gjort (valfritt)</label>
        <div class="field"><textarea id="ovrigt" placeholder="Kort beskrivning, länkar, materialönskemål..."></textarea></div>
      </div>
      <div class="section">
        <h2>Adress & Zon</h2>
        <label class="lbl">Adress</label>
        <div class="field"><input id="adress" placeholder="Gatuadress, ort"></div>
        <div class="grid">
          <div>
            <label class="lbl">Postnummer</label>
            <div class="field"><input id="postnr" placeholder="123 45"></div>
          </div>
          <div>
            <label class="lbl">Zon (restidspåslag)</label>
            <div class="row" style="gap:8px">
              ${["1","2","3"].map(z => `
                <label class="btn" style="padding:8px 12px;border-radius:12px;cursor:pointer">
                  <input type="radio" name="zon" value="${z}" ${z==="1"?"checked":""} style="display:none">
                  Zon ${z}
                </label>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
    steps.push(sec);
    stepsEl.appendChild(sec);
  }

  function buildCategoryStep(catName, items){
    const sec = document.createElement("section");
    sec.className = "step";

    const rows = items.map((it, idx) => {
      const key = `${catName}|${it.name}`;
      // unit formatting
      const unit = (it.unit||"").toString();
      const price = Number(it.price) || 0;
      return `
        <div class="item" data-key="${key}">
          <div>
            <div style="font-weight:600">${escapeHtml(it.name)}</div>
            <div class="badge">${escapeHtml(unit || "styck/mängd")}</div>
          </div>
          <div class="price">${fmtMoney(price)}</div>
          <div class="qty">
            <button type="button" class="qty-minus" aria-label="Minska">−</button>
            <input type="number" class="qty-input" min="0" step="${inferStep(unit)}" value="${state.items[key]||0}"/>
            <button type="button" class="qty-plus" aria-label="Öka">+</button>
          </div>
        </div>
      `;
    }).join("");

    sec.innerHTML = `
      <div class="section">
        <h2>${escapeHtml(catName)}</h2>
        <div class="items">
          <div style="font-weight:700">Artikel</div>
          <div style="font-weight:700;text-align:right">à-pris</div>
          <div style="font-weight:700;text-align:right">Antal</div>
          ${rows}
        </div>
      </div>
    `;

    // hook quantity buttons
    sec.addEventListener("click", (e) => {
      const row = e.target.closest(".item");
      if (!row) return;
      const key = row.getAttribute("data-key");
      const input = row.querySelector(".qty-input");
      if (e.target.classList.contains("qty-minus")){
        input.value = Math.max(0, num(input.value) - num(input.step||1));
        state.items[key] = num(input.value);
        paintSummary(); // live update
      } else if (e.target.classList.contains("qty-plus")){
        input.value = num(input.value) + num(input.step||1);
        state.items[key] = num(input.value);
        paintSummary();
      }
    });
    sec.addEventListener("input", (e) => {
      if (!e.target.classList.contains("qty-input")) return;
      const row = e.target.closest(".item");
      const key = row.getAttribute("data-key");
      state.items[key] = Math.max(0, num(e.target.value));
      paintSummary();
    });

    steps.push(sec);
    stepsEl.appendChild(sec);
  }

  function buildRotContactStep(){
    const sec = document.createElement("section");
    sec.className = "step";
    sec.innerHTML = `
      <div class="section">
        <h2>Skattereduktion</h2>
        <div class="row" style="gap:8px">
          ${["Ingen","ROT","RUT"].map(v => `
            <label class="btn" style="padding:8px 12px;border-radius:12px;cursor:pointer">
              <input type="radio" name="tax_deduction" value="${v}" ${v==="Ingen"?"checked":""} style="display:none">
              ${v}
            </label>
          `).join("")}
        </div>
        <div class="grid" style="margin-top:10px">
          <div>
            <label class="lbl">Antal personer som nyttjar avdraget</label>
            <div class="field"><input id="ded_persons" type="number" min="1" max="4" value="1" /></div>
          </div>
        </div>
        <div class="hint">ROT 30%, RUT 50%. Tak per person (preliminärt): ROT 50 000 kr, RUT 75 000 kr.</div>
      </div>
      <div class="section">
        <h2>Kontakt & uppladdning</h2>
        <div class="grid">
          <div>
            <label class="lbl">Namn</label>
            <div class="field"><input id="namn" placeholder="För- och efternamn"/></div>
          </div>
          <div>
            <label class="lbl">E-post</label>
            <div class="field"><input id="epost" type="email" placeholder="namn@exempel.se"/></div>
          </div>
        </div>
        <label class="lbl" style="margin-top:10px">Telefon (valfritt)</label>
        <div class="field"><input id="telefon" placeholder="+46 …"/></div>
        <label class="lbl" style="margin-top:10px">Bilder/filer (valfritt, PDF/jpg/png)</label>
        <div class="field"><input id="filer" type="file" multiple accept=".pdf,image/*"/></div>
      </div>
    `;
    steps.push(sec);
    stepsEl.appendChild(sec);
  }

  function buildSummaryStep(){
    const sec = document.createElement("section");
    sec.className = "step";
    sec.innerHTML = `
      <div class="section">
        <h2>Summering & preliminär prisbild</h2>
        <div class="summary" id="summaryBox">
          <div class="tot-row"><span>Arbete (alla val):</span> <span class="money" id="sArbete">–</span></div>
          <div class="tot-row"><span>Material:</span> <span class="money" id="sMat">–</span></div>
          <div class="tot-row"><span>Moms:</span> <span class="money" id="sMoms">–</span></div>
          <div class="tot-row" style="font-weight:800"><span>Totalt inkl. moms:</span> <span class="money" id="sTot">–</span></div>
          <div id="sDedRow" class="hidden" style="margin-top:6px">
            Preliminär skattereduktion: <span class="money" id="sDed">–</span><br>
            <b>Att betala efter avdrag:</b> <span class="money" id="sAfter">–</span>
          </div>
          <div class="hint" style="margin-top:6px">Detta är en indikation baserad på dina val. Vi återkommer med exakt offert.</div>
        </div>
      </div>
    `;
    steps.push(sec);
    stepsEl.appendChild(sec);
  }

  // ---------------- Logic ----------------

  function inferStep(unit){
    const u = (unit||"").toLowerCase();
    if (u.includes("m2") || u.includes("m²")) return 0.5;
    if (u === "m" || u.includes("meter")) return 0.5;
    if (u.includes("tim")) return 0.5;
    return 1;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function readBasicsFromUI(){
    state.ovrigt = document.getElementById("ovrigt")?.value?.trim() || "";
    state.adress = document.getElementById("adress")?.value?.trim() || "";
    state.postnr = document.getElementById("postnr")?.value?.trim() || "";
    const z = document.querySelector('input[name="zon"]:checked');
    if (z) state.zon = z.value;

    const td = document.querySelector('input[name="tax_deduction"]:checked');
    if (td) state.tax_deduction = td.value;
    state.ded_persons = Math.max(1, Math.min(4, num(document.getElementById("ded_persons")?.value || 1)));

    state.namn = document.getElementById("namn")?.value?.trim() || "";
    state.epost= document.getElementById("epost")?.value?.trim() || "";
    state.telefon = document.getElementById("telefon")?.value?.trim() || "";
  }

  function calcTotals(){
    if (!PRICE) return {arbete:0, material:0, momsBelopp:0, inklmoms:0, prelimDed:0, after:0};

    // For now treat ALL chosen items as "Arbete".
    // (We can split to Arbete/Material after we tag items in price.json)
    const moms   = PRICE.moms ?? 0.25;
    const rotRate= PRICE.rot_rate ?? 0.30;
    const rutRate= PRICE.rut_rate ?? 0.50;

    let arbete = 0;
    let material = 0;

    // Zone cost (fixed add)
    const zonAdd = PRICE.zon?.[state.zon] || 0;
    arbete += Number(zonAdd)||0;

    // Sum all selected items
    const cats = PRICE.categories || {};
    for (const [cat, items] of Object.entries(cats)){
      items.forEach(it => {
        const key = `${cat}|${it.name}`;
        const qty = Number(state.items[key]||0);
        if (qty > 0){
          const price = Number(it.price)||0;
          // Heuristic: if unit hints at "material", put to material — otherwise arbete.
          const u = (it.unit||"").toLowerCase();
          if (u.includes("material")) material += qty * price;
          else arbete += qty * price;
        }
      });
    }

    // Min debitering
    const minDeb = PRICE.min_debitering || 0;
    if (minDeb && (arbete + material) < minDeb){
      const diff = minDeb - (arbete + material);
      arbete += diff;
    }

    const exmoms = arbete + material;
    const momsBelopp = exmoms * moms;
    const inklmoms = exmoms + momsBelopp;

    // ROT/RUT (preliminärt)
    let prelimDed = 0, after = inklmoms;
    const rate = state.tax_deduction==="ROT" ? rotRate : state.tax_deduction==="RUT" ? rutRate : 0;
    if (rate > 0){
      const arbeteInklMoms = arbete * (1 + moms);
      const capPerPerson = state.tax_deduction==="ROT" ? 50000 : 75000;
      prelimDed = Math.min(state.ded_persons * capPerPerson, Math.round(arbeteInklMoms * rate));
      after = Math.max(0, inklmoms - prelimDed);
    }

    return {arbete, material, momsBelopp, inklmoms, prelimDed, after};
  }

  function paintSummary(){
    const r = calcTotals();
    const set = (id,val) => { const el = document.getElementById(id); if (el) el.textContent = fmtMoney(val); };
    set("sArbete", r.arbete);
    set("sMat",    r.material);
    set("sMoms",   r.momsBelopp);
    set("sTot",    r.inklmoms);
    const row = document.getElementById("sDedRow");
    if (row){
      if (r.prelimDed > 0){
        row.classList.remove("hidden");
        const sd = document.getElementById("sDed");
        const af = document.getElementById("sAfter");
        if (sd) sd.textContent = fmtMoney(r.prelimDed);
        if (af) af.textContent = fmtMoney(r.after);
      } else {
        row.classList.add("hidden");
      }
    }
  }

  // ---------------- Wizard nav ----------------

  function paintStep(){
    steps.forEach((s,idx)=>s.classList.toggle("active", idx===current));
    if (pbar)  pbar.style.width = ((current+1)/steps.length*100) + "%";
    if (plabel) plabel.textContent = `Steg ${current+1} av ${steps.length}`;
    if (back) back.disabled = (current===0);
    if (next) next.textContent = (current===steps.length-1) ? "Skicka" : "Nästa";
    paintSummary();
  }

  async function submit(){
    readBasicsFromUI();
    try {
      const fd = new FormData();
      fd.append("_meta_title","Offertförfrågan – alla kategorier");

      // compact items
      const chosen = Object.entries(state.items).filter(([k,v]) => Number(v)>0);
      fd.append("items_json", JSON.stringify(chosen));

      // basics
      fd.append("adress", state.adress);
      fd.append("postnr", state.postnr);
      fd.append("zon", state.zon);
      fd.append("ovrigt", state.ovrigt);
      fd.append("tax_deduction", state.tax_deduction);
      fd.append("ded_persons", String(state.ded_persons));
      fd.append("namn", state.namn);
      fd.append("epost", state.epost);
      fd.append("telefon", state.telefon);

      // totals
      const r = calcTotals();
      fd.append("sum_arbete", String(r.arbete));
      fd.append("sum_material", String(r.material));
      fd.append("sum_moms", String(r.momsBelopp));
      fd.append("sum_total", String(r.inklmoms));
      fd.append("sum_after_deduction", String(r.after));
      fd.append("sum_prelim_deduction", String(r.prelimDed));

      const files = document.getElementById("filer")?.files || [];
      for (const f of files) fd.append("files", f);

      next.disabled = true; next.textContent = "Skickar…";
      const res = await fetch(SEND_ENDPOINT, { method:"POST", body: fd });
      if (!res.ok) throw new Error("Serverfel: " + res.status);
      alert("Tack! Vi har mottagit din förfrågan.");
      location.reload();
    } catch (e){
      console.error(e);
      alert("Kunde inte skicka. Försök igen senare.");
    } finally {
      next.disabled = false; paintStep();
    }
  }

  back?.addEventListener("click", (e)=>{ e.preventDefault(); if (current>0){ current--; paintStep(); }});
  next?.addEventListener("click", (e)=>{ 
    e.preventDefault(); 
    if (current < steps.length-1){ current++; paintStep(); } else { submit(); }
  });
  save?.addEventListener("click", ()=>{
    try {
      readBasicsFromUI();
      navigator.clipboard.writeText(JSON.stringify(state));
      alert("Sparat till urklipp.");
    } catch {}
  });

  // ---------------- Load prices & render ----------------

  (async () => {
    try{
      plabel.textContent = "Laddar prislista…";
      const r = await fetch(PRICE_URL, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP "+r.status);
      PRICE = await r.json();
    }catch(e){
      console.warn("[offert] prislista saknas/ogiltig, kör med tomma kategorier:", e.message);
      PRICE = { moms:0.25, rot_rate:0.30, rut_rate:0.50, min_debitering:0, zon:{}, categories:{} };
    }

    // 1) Intro + adress
    buildStaticIntro();

    // 2) One step per category from Excel (the "**priser**" sheets we parsed)
    const cats = PRICE.categories || {};
    const orderedCatNames = Object.keys(cats).sort(); // simple alpha; we can customize order later
    orderedCatNames.forEach(catName => {
      const items = (cats[catName]||[]).filter(x => x && x.name && (x.price!==undefined));
      if (items.length) buildCategoryStep(catName, items);
    });

    // 3) ROT/Contact
    buildRotContactStep();

    // 4) Summary
    buildSummaryStep();

    // Activate first
    steps = Array.from(document.querySelectorAll(".step"));
    current = 0;
    paintStep();

  })();
})();

// =========================
//   Jobryan Frontend Logic
// =========================

async function calculatePrice() {
  const payload = {
    postnummer: document.getElementById("postnummer").value,
    zon: Number(document.getElementById("zon").value),
    kvm_golv: Number(document.getElementById("kvm_golv").value),
    kvm_vagg: Number(document.getElementById("kvm_vagg").value),
    takhojd: Number(document.getElementById("takhojd").value),

    microcement_golv: document.getElementById("microcement_golv").value,
    microcement_vagg: document.getElementById("microcement_vagg").value,
    ny_troskel: document.getElementById("ny_troskel").value,
    byta_dorrblad: document.getElementById("byta_dorrblad").value,
    byta_karm_dorr: document.getElementById("byta_karm_dorr").value,
    slipning_dorr: document.getElementById("slipning_dorr").value,
    bankskiva_ovan_tm_tt: document.getElementById("bankskiva_ovan_tm_tt").value,
    vaggskap: document.getElementById("vaggskap").value,
    nytt_innertak: document.getElementById("nytt_innertak").value,

    rivning_vaggar: Number(document.getElementById("rivning_vaggar").value),
    nya_vaggar_material: document.getElementById("nya_vaggar_material").value,
    gerade_horn_meter: Number(document.getElementById("gerade_horn_meter").value),
    fyll_i_antal_meter: Number(document.getElementById("fyll_i_antal_meter").value),
    dolda_ror: document.getElementById("dolda_ror").value
  };

  console.log("Sending payload:", payload);

  const r = await fetch("https://jobryan-offert-service.onrender.com/api/estimate/badrum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const res = await r.json();
  console.log("API RESULT:", res);

  if (!res.ok) {
    alert("Fel: " + res.error);
    return;
  }

  // Insert values into result box
  document.getElementById("p1").innerText = res.pris_arbete_ex_moms + " kr";
  document.getElementById("p2").innerText = res.pris_grundmaterial_ex_moms + " kr";
  document.getElementById("p3").innerText = res.pris_resekostnad_ex_moms + " kr";
  document.getElementById("p4").innerText = res.pris_sophantering_ex_moms + " kr";

  const total =
    Number(res.pris_arbete_ex_moms || 0) +
    Number(res.pris_grundmaterial_ex_moms || 0) +
    Number(res.pris_resekostnad_ex_moms || 0) +
    Number(res.pris_sophantering_ex_moms || 0);

  document.getElementById("ptot").innerText = total + " kr";

  // show the results
  document.getElementById("resultBox").style.display = "block";
}

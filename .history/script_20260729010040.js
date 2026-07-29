// ⚠️ Remplacez par le vrai numéro WhatsApp (format international, sans + ni espaces, ex: "221771234567")
const WHATSAPP_NUMBER = "221775730664";
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbztkSX3TyebbLAMASZva5rAbgVcuSgHpPOw3mWZLaVD60Z6R83ZnjcCemumw_IpcYI8/exec";

document.getElementById('direct-wadirect-wa1').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Mme Propre, j'ai une question 👋")}`;

function getDevisData(){
  return {
    nom: document.getElementById('d-nom').value.trim(),
    tel: document.getElementById('d-tel').value.trim(),
    typeDemande: document.getElementById('d-type').value,
    zone: document.getElementById('d-zone').value.trim(),
    surface: document.getElementById('d-surface').value.trim(),
    message: document.getElementById('d-msg').value.trim(),
  };
}

let isSubmitting = false;

async function submitDevis(){
  if(isSubmitting) return;
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('submit-status');
  const data = getDevisData();

  // Honeypot : un humain ne remplit jamais ce champ invisible
  const honeypot = document.getElementById('d-site').value;
  if(honeypot){
    status.style.color = "#3FB88C";
    status.textContent = "Demande reçue ! On revient vers vous très bientôt.";
    return;
  }

  // Jeton généré par Cloudflare Turnstile
  const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
  const turnstileToken = turnstileResponse ? turnstileResponse.value : "";

  if (!turnstileToken) {
    status.textContent = "Veuillez valider la vérification de sécurité (anti-bot).";
    status.style.color = "#B3261E";
    return;
  }

  if(!data.nom || !data.tel){
    status.textContent = "Merci de renseigner au moins votre nom et votre numéro.";
    status.style.color = "#B3261E";
    return;
  }

  isSubmitting = true;
  btn.disabled = true;
  btn.textContent = "Envoi en cours...";
  status.style.color = "";
  status.textContent = "Validation en cours...";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    // ⚠️ mode: "no-cors" est INDISPENSABLE avec les Web Apps Apps Script :
    // sans lui, le navigateur convertit la requête POST en GET lors de la
    // redirection interne de Google, et le formulaire n'enregistre plus rien.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ formType: "devis", turnstileToken, ...data }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    btn.textContent = "Envoyé ✓";
    status.style.color = "#3FB88C";
    status.textContent = "Demande reçue ! On revient vers vous très bientôt.";

    document.querySelectorAll('#devis input, #devis select, #devis textarea').forEach(el => {
      if (el.type !== 'hidden') el.value = "";
    });
    if (typeof turnstile !== 'undefined') turnstile.reset();

  } catch(err){
    clearTimeout(timeoutId);
    btn.disabled = false;
    isSubmitting = false;
    btn.textContent = "Envoyer ma demande";
    status.style.color = "#B3261E";
    status.textContent = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
  }
}

function sendWhatsappDirect(){
  const data = getDevisData();
  let text = "Bonjour Mme Propre 👋\n\nJe souhaite un devis pour un service de nettoyage.";
  if(data.nom) text += `\n\nNom : ${data.nom}`;
  if(data.tel) text += `\nTéléphone : ${data.tel}`;
  if(data.typeDemande) text += `\nType : ${data.typeDemande}`;
  if(data.zone) text += `\nZone : ${data.zone}`;
  if(data.surface) text += `\nSurface : ${data.surface}`;
  if(data.message) text += `\nDétails : ${data.message}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

document.getElementById('submit-btn').addEventListener('click', submitDevis);
document.getElementById('wa-direct-btn').addEventListener('click', sendWhatsappDirect);

/*  script.js  */
/* ----------------------------------- */
/* configuration --------------------- */
const BACKEND = ".netlify/functions";          // ← Netlify function prefix
const stripe  = Stripe("pk_test_PASTE-YOUR-KEY-HERE");   // ← TEST publishable key

/* helpers --------------------------- */
function collectFormData(plan) {
  return {
    type: plan,
    editCredits: parseInt(document.getElementById('editCredits')?.value || 0, 10),
    name:         document.getElementById('name')?.value   || '',
    email:        document.getElementById('email')?.value  || '',
    phone:        document.getElementById('phone')?.value  || '',
    address:      document.getElementById('address')?.value|| '',
    city:         document.getElementById('city')?.value   || '',
    state:        document.getElementById('state')?.value  || '',
    zip:          document.getElementById('zip')?.value    || '',
    businessName: document.getElementById('businessName')?.value || '',
    description:  document.getElementById('description')?.value  || ''
  };
}

/* main checkout --------------------- */
async function startOrder(plan) {
  const payload = collectFormData(plan);

  // simple validations
  if (plan === 'credits' && payload.editCredits === 0) {
    alert('Please select at least 1 edit credit for credits-only orders.');
    return;
  }
  if (['basic','premium'].includes(plan) && payload.editCredits === 0) {
    if (!confirm('Almost every site needs tweaks. We recommend at least 2 credits. Continue without extras?')) {
      return;
    }
  }

  try {
    const res = await fetch(`${BACKEND}/create-checkout-session`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify(payload)
    });
    const response = await res.json();
    if (response.error) { alert('Error: ' + response.error); return; }
    /* redirect to Stripe */
    stripe.redirectToCheckout({ sessionId: response.id });
  } catch (err) {
    console.error(err);
    alert('An error occurred. Please try again.');
  }
}

/* page navigation helpers ----------- */
function selectPlan(plan) {
  const page = {basic:'basic', premium:'premium', domain:'domain', credits:'credits'}[plan];
  if (page) window.location.href = `${page}.html`;
}
function selectDomainPackage()  { window.location.href = 'domain.html';  }
function purchaseEditCredits()  { window.location.href = 'credits.html'; }

/* price calculator ------------------ */
function updateTotal() {
  const editCredits  = parseInt(document.getElementById('editCredits')?.value || 0, 10);
  const totalElement = document.getElementById('orderTotal');
  const submitButton = document.getElementById('submitButton');
  if (!totalElement || !submitButton) return;

  let basePrice = 0;
  if      (location.pathname.includes('basic.html'))   basePrice = 29.99;
  else if (location.pathname.includes('premium.html')) basePrice = 99.99;
  else if (location.pathname.includes('domain.html'))  basePrice = 499.99;

  const total = basePrice + editCredits * 10;
  totalElement.textContent = `$${total.toFixed(2)}`;

  if      (location.pathname.includes('basic.html'))
    submitButton.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes('premium.html'))
    submitButton.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes('domain.html'))
    submitButton.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
  else if (location.pathname.includes('credits.html'))
    submitButton.textContent = `Purchase ${editCredits} Edit Credits – $${total.toFixed(2)}`;
}

/* initialise ------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  const creditsInput = document.getElementById('editCredits');
  if (creditsInput) {
    creditsInput.addEventListener('input', updateTotal);
    creditsInput.addEventListener('change', updateTotal);
    updateTotal();          // initial calculation
  }
});

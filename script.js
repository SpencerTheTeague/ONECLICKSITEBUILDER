<!-- script.js  (replace the whole file with everything below) -->
<script>
/* 1 – Stripe publishable key  ────────────────────────────────
   ▸ TEST mode:  pk_test_…
   ▸ When you’re ready for real payments, switch it back to
     your pk_live_… key and redeploy.                         */
const stripe = Stripe('pk_test_REPLACE_WITH_YOUR_KEY');

/* 2 – Path to the Netlify Function that creates sessions */
const BACKEND = '.netlify/functions';

/* 3 – Collect the form data that’s on the page */
function collectFormData (plan) {
  return {
    type: plan,
    editCredits: parseInt(document.getElementById('editCredits')?.value || 0, 10),
    name:          document.getElementById('name')?.value || '',
    email:         document.getElementById('email')?.value || '',
    phone:         document.getElementById('phone')?.value || '',
    address:       document.getElementById('address')?.value || '',
    city:          document.getElementById('city')?.value || '',
    state:         document.getElementById('state')?.value || '',
    zip:           document.getElementById('zip')?.value || '',
    businessName:  document.getElementById('businessName')?.value || '',
    description:   document.getElementById('description')?.value || ''
  };
}

/* 4 – Kick off the order + redirect to Stripe Checkout */
async function startOrder (plan) {
  const payload = collectFormData(plan);

  // Validation
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
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.error) { alert('Error: ' + json.error); return; }

    // Success → send the browser to Stripe
    stripe.redirectToCheckout({ sessionId: json.id });

  } catch (err) {
    console.error(err);
    alert('An error occurred. Please try again.');
  }
}

/* 5 – Navigation helpers */
function selectPlan (plan)    { window.location.href = `${plan}.html`; }
function selectDomainPackage(){ window.location.href = 'domain.html'; }
function purchaseEditCredits(){ window.location.href = 'credits.html'; }

/* 6 – Price total updater */
function updateTotal () {
  const editCredits = parseInt(document.getElementById('editCredits')?.value || 0, 10);
  const totalEl     = document.getElementById('orderTotal');
  const button      = document.getElementById('submitButton');
  if (!totalEl || !button) return;

  // Base price by page
  let base = 0;
  if (location.pathname.includes('basic.html'))   base =  29.99;
  if (location.pathname.includes('premium.html')) base =  99.99;
  if (location.pathname.includes('domain.html'))  base = 499.99;

  const total = base + editCredits * 10;
  totalEl.textContent = `$${total.toFixed(2)}`;

  // Button text
  if (location.pathname.includes('basic.html'))
    button.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes('premium.html'))
    button.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes('domain.html'))
    button.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
  else
    button.textContent = `Purchase ${editCredits} Edit Credits – $${total.toFixed(2)}`;
}

/* 7 – Run on page load */
document.addEventListener('DOMContentLoaded', () => {
  const creditsInput = document.getElementById('editCredits');
  if (creditsInput) {
    creditsInput.addEventListener('input',  updateTotal);
    creditsInput.addEventListener('change', updateTotal);
    updateTotal();
  }
});
</script>

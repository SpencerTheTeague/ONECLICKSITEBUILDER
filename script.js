// ──────────────────────────────────────────────────────────────
//  Stripe checkout + Formspree submission (TEST MODE)
//  ONECLICKSITEBUILDER – copy entire file as-is, no <script> tags
// ──────────────────────────────────────────────────────────────

// 1.  Keys & endpoints
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RY9PVRvugzB60pNyBkNHZFpVqFhQ3U0zKKEy3IupIXj9KDyHLTUpGw4ZmzOj6E0X1M4Ri1NGZ1QnF4X3VbZsgTh00iB1j2l4v'; // ← change to pk_live_… when ready
const FORM_ENDPOINT          = 'https://formspree.io/f/xvgrzrvg';
const BACKEND_FUNCTION       = '.netlify/functions/create-checkout-session';

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

// 2.  Grab data from the order form
function collectFormData(plan) {
  const val = id => document.getElementById(id)?.value?.trim() || '';
  return {
    type:         plan,
    editCredits:  parseInt(val('editCredits') || '0', 10),
    name:         val('name'),
    email:        val('email'),
    phone:        val('phone'),
    address:      val('address'),
    city:         val('city'),
    state:        val('state'),
    zip:          val('zip'),
    businessName: val('businessName'),
    description:  val('description')
  };
}

// 3.  Main button handler
async function startOrder(plan) {
  const data = collectFormData(plan);

  /* ─── simple front-end checks ─── */
  if (plan === 'credits' && data.editCredits < 1) {
    alert('Credits-only orders need at least 1 credit.'); return;
  }
  if (['basic','premium'].includes(plan) && data.editCredits === 0) {
    if (!confirm('Almost every site needs tweaks – we recommend at least 2 credits. Continue without extras?')) return;
  }

  try {
    /* 3-A  Send form to Formspree first (so you always get the e-mail) */
    const fsRes = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(data)
    });
    if (!fsRes.ok) throw new Error('Form submission failed – please try again.');

    /* 3-B  Ask Netlify Function for a Stripe Checkout session */
    const nfRes = await fetch(BACKEND_FUNCTION, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    const nfJson = await nfRes.json();
    if (nfJson.error || !nfJson.id) throw new Error('Payment session error: ' + (nfJson.error || 'unknown'));

    /* 3-C  Redirect to Stripe */
    await stripe.redirectToCheckout({ sessionId: nfJson.id });

  } catch (err) {
    console.error(err);
    alert(err.message || 'Unexpected error – please try again.');
  }
}

// 4.  Helper to change pages
function selectPlan(type){ location.href = `${type}.html`; }
function selectDomainPackage(){ location.href = 'domain.html'; }
function purchaseEditCredits(){ location.href = 'credits.html'; }

// 5.  Live price calculator
function updateTotal() {
  const credits    = parseInt(document.getElementById('editCredits')?.value || '0', 10);
  const totalEl    = document.getElementById('orderTotal');
  const submitBtn  = document.getElementById('submitButton');
  if (!totalEl || !submitBtn) return;

  let base = 0;
  if (location.pathname.includes('basic.html'))   base =  29.99;
  if (location.pathname.includes('premium.html')) base =  99.99;
  if (location.pathname.includes('domain.html'))  base = 499.99;

  const total = base + credits * 10;
  totalEl.textContent = `$${total.toFixed(2)}`;

  const label = location.pathname.includes('basic.html')   ? 'Submit Basic Order'   :
                location.pathname.includes('premium.html') ? 'Submit Premium Order' :
                location.pathname.includes('domain.html')  ? 'Submit Domain Package':
                                                             `Purchase ${credits} Edit Credits`;
  submitBtn.textContent = `${label} – $${total.toFixed(2)}`;
}

// 6.  Initialise listeners after page load
document.addEventListener('DOMContentLoaded', () => {
  const crInput = document.getElementById('editCredits');
  if (crInput){
    crInput.addEventListener('input',  updateTotal);
    crInput.addEventListener('change', updateTotal);
    updateTotal();
  }
});

@@ -1,92 +1,107 @@
<!-- script.js  (replace your existing <script> block with this exact code) -->
<script src="https://js.stripe.com/v3/"></script>Add commentMore actions
<script>
  // 1) Your live Stripe publishable key (browser only – starts with "pk_live_…")
  const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');
// script.js

  // 2) Path to your Netlify Function
  const BACKEND = '.netlify/functions';
// 1) Your live Stripe publishable key
const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');

  // 3) Grab all form fields
  function collectFormData(plan) {
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
// 2) Netlify Function endpoint
const BACKEND = '/.netlify/functions/create-checkout-session';

  // 4) Create a Checkout Session and redirect
  async function startOrder(plan) {
    const payload = collectFormData(plan);
// 3) Read the current plan from the URL
function currentPlan() {
  if (location.pathname.endsWith('basic.html'))   return 'basic';
  if (location.pathname.endsWith('premium.html')) return 'premium';
  if (location.pathname.endsWith('domain.html'))  return 'domain';
  return 'credits';
}

    // Basic validation
    if (plan === 'credits' && payload.editCredits === 0) {
      return alert('Please select at least 1 edit credit for credits-only orders.');
    }
    if (['basic','premium'].includes(plan) && payload.editCredits === 0) {
      if (!confirm('We recommend at least 2 edit credits. Continue without extras?')) return;
// 4) Collect and validate form data
function collectFormData() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const plan = currentPlan();
  const credits = parseInt(get('editCredits') || '0', 10);
  if (plan === 'credits' && credits < 1) {
    alert('Please select at least 1 edit credit.');
    return null;
  }
  if (['basic','premium'].includes(plan) && credits === 0) {
    if (!confirm('We recommend at least 2 edit credits. Continue without extras?')) {
      return null;
    }
  }
  return {
    type:         plan,
    editCredits:  credits,
    name:         get('name'),
    email:        get('email'),
    phone:        get('phone'),
    address:      get('address'),
    city:         get('city'),
    state:        get('state'),
    zip:          get('zip'),
    businessName: get('businessName'),
    description:  get('description'),
  };
}

    try {
      const res = await fetch(`${BACKEND}/create-checkout-session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error) {
        return alert('Error: ' + json.error);
      }
      // Redirect to Stripe
      stripe.redirectToCheckout({ sessionId: json.id });
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
// 5) Handle the payment button click
async function startOrder() {
  const data = collectFormData();
  if (!data) return;  // validation failed or cancelled

  try {
    const res  = await fetch(BACKEND, {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) {
      alert('Error: ' + json.error);
      return;
    }
    await stripe.redirectToCheckout({ sessionId: json.id });
  } catch (err) {
    console.error(err);
    alert('An error occurred. Please try again.');
  }
}

  // 5) Wire up the credit input & button text
  function updateTotal() {
    const credits   = parseInt(document.getElementById('editCredits')?.value || 0, 10);
    const totalEl   = document.getElementById('orderTotal');
    const button    = document.getElementById('submitButton');
    if (!totalEl || !button) return;
// 6) Update the order total and button label
function updateTotal() {
  const creds = parseInt(document.getElementById('editCredits')?.value || '0', 10);
  const totalEl = document.getElementById('orderTotal');
  const btn     = document.getElementById('submitButton');
  if (!totalEl || !btn) return;

    let base = 0;
    if (location.pathname.includes('basic.html'))   base =  29.99;
    if (location.pathname.includes('premium.html')) base =  99.99;
    if (location.pathname.includes('domain.html'))  base = 499.99;
  let base = 0;
  const plan = currentPlan();
  if (plan === 'basic')   base = 29.99;
  if (plan === 'premium') base = 99.99;
  if (plan === 'domain')  base = 499.99;

    const total = base + credits * 10;
    totalEl.textContent = `$${total.toFixed(2)}`;
  const total = base + creds * 10;
  totalEl.textContent = `$${total.toFixed(2)}`;

    if (location.pathname.includes('basic.html'))
      button.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
    else if (location.pathname.includes('premium.html'))
      button.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
    else if (location.pathname.includes('domain.html'))
      button.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
    else
      button.textContent = `Purchase ${credits} Edit Credits – $${total.toFixed(2)}`;
  let label;
  if (plan === 'credits') {
    label = `Purchase ${creds} Edit Credits`;
  } else {
    label = `Submit ${plan.charAt(0).toUpperCase() + plan.slice(1)} Order`;
  }
  btn.textContent = `${label} – $${total.toFixed(2)}`;
}

  // 6) Init on page load
  document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('editCredits');
    if (inp) {
      inp.addEventListener('input',  updateTotal);
      inp.addEventListener('change', updateTotal);
      updateTotal();
    }
  });
</script>
// 7) Wire everything up on page load
document.addEventListener('DOMContentLoaded', () => {
  // Payment button
  const btn = document.getElementById('submitButton');
  if (btn) btn.addEventListener('click', () => startOrder());

  // Credit input
  const inp = document.getElementById('editCredits');
  if (inp) {
    inp.addEventListener('input',  updateTotal);
    inp.addEventListener('change', updateTotal);
    updateTotal();
  }
});

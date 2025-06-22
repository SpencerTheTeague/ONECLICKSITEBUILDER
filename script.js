// script.js

// 1) Your live Stripe publishable key
const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');

// 2) Netlify Function endpoint
const BACKEND = '/.netlify/functions/create-checkout-session';

// 3) Read the current plan from the URL
function currentPlan() {
  if (location.pathname.endsWith('basic.html'))   return 'basic';
  if (location.pathname.endsWith('premium.html')) return 'premium';
  if (location.pathname.endsWith('domain.html'))  return 'domain';
  return 'credits';
}

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

// 6) Update the order total and button label
function updateTotal() {
  const creds = parseInt(document.getElementById('editCredits')?.value || '0', 10);
  const totalEl = document.getElementById('orderTotal');
  const btn     = document.getElementById('submitButton');
  if (!totalEl || !btn) return;

  let base = 0;
  const plan = currentPlan();
  if (plan === 'basic')   base = 29.99;
  if (plan === 'premium') base = 99.99;
  if (plan === 'domain')  base = 499.99;

  const total = base + creds * 10;
  totalEl.textContent = `$${total.toFixed(2)}`;

  let label;
  if (plan === 'credits') {
    label = `Purchase ${creds} Edit Credits`;
  } else {
    label = `Submit ${plan.charAt(0).toUpperCase() + plan.slice(1)} Order`;
  }
  btn.textContent = `${label} – $${total.toFixed(2)}`;
}

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

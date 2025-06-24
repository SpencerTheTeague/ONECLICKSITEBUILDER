@@ -1,107 +1,227 @@
// script.js

// 1) Your live Stripe publishable key
// OneClickSiteBuilder - Unified Script (Patch Plan v1.1)Add commentMore actionsAdd commentMore actions
const BACKEND = ".netlify/functions";
const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');
<script>
/* ---------- configuration ---------- */
const BACKEND            = ".netlify/functions";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvgrzrvg";   // ← your form
const stripe             = Stripe(
  "pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM"
);
/* ----------------------------------- */

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
function collectFormData(plan) {
    return {
        type: plan,
        editCredits: parseInt(document.getElementById('editCredits')?.value || 0, 10),
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zip: document.getElementById('zip')?.value || '',
        businessName: document.getElementById('businessName')?.value || '',
        description: document.getElementById('description')?.value || ''
    };
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
    type:          plan,
    editCredits:   parseInt(document.getElementById("editCredits")?.value || 0, 10),
    name:          document.getElementById("name")?.value || "",
    email:         document.getElementById("email")?.value || "",
    phone:         document.getElementById("phone")?.value || "",
    address:       document.getElementById("address")?.value || "",
    city:          document.getElementById("city")?.value || "",
    state:         document.getElementById("state")?.value || "",
    zip:           document.getElementById("zip")?.value || "",
    businessName:  document.getElementById("businessName")?.value || "",
    description:   document.getElementById("description")?.value || ""
  };
}

// 5) Handle the payment button click
async function startOrder() {
  const data = collectFormData();
  if (!data) return;  // validation failed or cancelled
async function startOrder(plan) {
    const payload = collectFormData(plan);
    
    // Validation for credits-only orders
    if (plan === 'credits' && payload.editCredits === 0) {
        alert('Please select at least 1 edit credit for credits-only orders.');
        return;
    }
    
    // Recommendation for basic/premium orders
    if (['basic', 'premium'].includes(plan) && payload.editCredits === 0) {
        if (!confirm('Almost every site needs tweaks. We recommend at least 2 credits. Continue without extras?')) {
            return;
        }
  const payload = collectFormData(plan);

  /* ---- front-end validation ---- */
  if (plan === "credits" && payload.editCredits === 0) {
    alert("Please select at least 1 edit credit for credits-only orders.");
    return;
  }
  if (["basic", "premium"].includes(plan) && payload.editCredits === 0) {
    if (!confirm("Almost every site needs tweaks. We recommend at least 2 credits. Continue without extras?")) return;
  }
  /* ------------------------------ */

  try {
    const res  = await fetch(BACKEND, {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify(data),
    /* 1️⃣  create Stripe checkout session (Netlify Function) */
    const res       = await fetch(`${BACKEND}/create-checkout-session`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.error) {
      alert('Error: ' + json.error);
    const response  = await res.json();

    if (response.error) {
      alert("Error: " + response.error);
      return;
    }
    await stripe.redirectToCheckout({ sessionId: json.id });
  } catch (err) {
    console.error(err);
    alert('An error occurred. Please try again.');
    

    /* 2️⃣  send the same data to Formspree so you get the email */
    try {
        const res = await fetch(`${BACKEND}/create-checkout-session`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const response = await res.json();
        
        if (response.error) {
            alert('Error: ' + response.error);
            return;
        }
        
        // Redirect to Stripe checkout
        stripe.redirectToCheckout({ sessionId: response.id });
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      await fetch(FORMSPREE_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Formspree request failed:", e);   // never block payment
    }
}

// Plan selection functions for main page
function selectPlan(planType) {
    if (planType === 'basic') {
        window.location.href = 'basic.html';
    } else if (planType === 'premium') {
        window.location.href = 'premium.html';
    } else if (planType === 'domain') {
        window.location.href = 'domain.html';
    } else if (planType === 'credits') {
        window.location.href = 'credits.html';
    }
}
    /* 3️⃣  redirect customer to Stripe Checkout */
    stripe.redirectToCheckout({ sessionId: response.id });

// Domain package function
function selectDomainPackage() {
    window.location.href = 'domain.html';
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

// 6) Update the order total and button label
// Edit credits function
function purchaseEditCredits() {
    window.location.href = 'credits.html';
}
/* ---------- navigation helpers ---------- */
function selectPlan(p)      { window.location.href = `${p}.html`; }
function selectDomainPackage()    { window.location.href = "domain.html"; }
function purchaseEditCredits()    { window.location.href = "credits.html"; }
/* ---------------------------------------- */

// Update total when edit credits change
/* ---------- price calculator ---------- */
function updateTotal() {
  const creds = parseInt(document.getElementById('editCredits')?.value || '0', 10);
  const totalEl = document.getElementById('orderTotal');
  const btn     = document.getElementById('submitButton');
  if (!totalEl || !btn) return;
    const editCredits = parseInt(document.getElementById('editCredits')?.value || 0);
    const totalElement = document.getElementById('orderTotal');
    const submitButton = document.getElementById('submitButton');
    
    if (!totalElement || !submitButton) return;
    
    // Get base price from page
    let basePrice = 0;
    if (window.location.pathname.includes('basic.html')) {
        basePrice = 29.99;
    } else if (window.location.pathname.includes('premium.html')) {
        basePrice = 99.99;
    } else if (window.location.pathname.includes('domain.html')) {
        basePrice = 499.99;
    } else if (window.location.pathname.includes('credits.html')) {
        basePrice = 0;
    }
    
    const creditsCost = editCredits * 10;
    const total = basePrice + creditsCost;
    
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Update submit button text
    if (window.location.pathname.includes('basic.html')) {
        submitButton.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
    } else if (window.location.pathname.includes('premium.html')) {
        submitButton.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
    } else if (window.location.pathname.includes('domain.html')) {
        submitButton.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
    } else if (window.location.pathname.includes('credits.html')) {
        submitButton.textContent = `Purchase ${editCredits} Edit Credits – $${total.toFixed(2)}`;
    }
  const editCredits  = parseInt(document.getElementById("editCredits")?.value || 0);
  const totalElement = document.getElementById("orderTotal");
  const submitButton = document.getElementById("submitButton");
  if (!totalElement || !submitButton) return;

  let base = 0;
  const plan = currentPlan();
  if (plan === 'basic')   base = 29.99;
  if (plan === 'premium') base = 99.99;
  if (plan === 'domain')  base = 499.99;
  let basePrice = 0;
  if      (location.pathname.includes("basic.html"))   basePrice = 29.99;
  else if (location.pathname.includes("premium.html")) basePrice = 99.99;
  else if (location.pathname.includes("domain.html"))  basePrice = 499.99;

  const total = base + creds * 10;
  totalEl.textContent = `$${total.toFixed(2)}`;
  const total = basePrice + editCredits * 10;
  totalElement.textContent = `$${total.toFixed(2)}`;

  let label;
  if (plan === 'credits') {
    label = `Purchase ${creds} Edit Credits`;
  } else {
    label = `Submit ${plan.charAt(0).toUpperCase() + plan.slice(1)} Order`;
  }
  btn.textContent = `${label} – $${total.toFixed(2)}`;
  if      (location.pathname.includes("basic.html"))
    submitButton.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes("premium.html"))
    submitButton.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
  else if (location.pathname.includes("domain.html"))
    submitButton.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
  else if (location.pathname.includes("credits.html"))
    submitButton.textContent = `Purchase ${editCredits} Edit Credits – $${total.toFixed(2)}`;
}
/* ---------------------------------------- */

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
// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update total when edit credits change
    const editCreditsInput = document.getElementById('editCredits');
    if (editCreditsInput) {
        editCreditsInput.addEventListener('input', updateTotal);
        editCreditsInput.addEventListener('change', updateTotal);
        // Initialize total on page load
        updateTotal();
    }
document.addEventListener("DOMContentLoaded", () => {
  const editCreditsInput = document.getElementById("editCredits");
  if (editCreditsInput) {
    editCreditsInput.addEventListener("input",  updateTotal);
    editCreditsInput.addEventListener("change", updateTotal);
    updateTotal();   // initial
  }
});

</script>

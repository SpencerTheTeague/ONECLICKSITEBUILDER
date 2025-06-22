<!-- script.js  (replace your existing <script> block with this exact code) -->
<script src="https://js.stripe.com/v3/"></script>
<script>
  // 1) Your live Stripe publishable key (browser only – starts with "pk_live_…")
  const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');

  // 2) Path to your Netlify Function
  const BACKEND = '.netlify/functions';

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

  // 4) Create a Checkout Session and redirect
  async function startOrder(plan) {
    const payload = collectFormData(plan);

    // Basic validation
    if (plan === 'credits' && payload.editCredits === 0) {
      return alert('Please select at least 1 edit credit for credits-only orders.');
    }
    if (['basic','premium'].includes(plan) && payload.editCredits === 0) {
      if (!confirm('We recommend at least 2 edit credits. Continue without extras?')) return;
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
    }
  }

  // 5) Wire up the credit input & button text
  function updateTotal() {
    const credits   = parseInt(document.getElementById('editCredits')?.value || 0, 10);
    const totalEl   = document.getElementById('orderTotal');
    const button    = document.getElementById('submitButton');
    if (!totalEl || !button) return;

    let base = 0;
    if (location.pathname.includes('basic.html'))   base =  29.99;
    if (location.pathname.includes('premium.html')) base =  99.99;
    if (location.pathname.includes('domain.html'))  base = 499.99;

    const total = base + credits * 10;
    totalEl.textContent = `$${total.toFixed(2)}`;

    if (location.pathname.includes('basic.html'))
      button.textContent = `Submit Basic Order – $${total.toFixed(2)}`;
    else if (location.pathname.includes('premium.html'))
      button.textContent = `Submit Premium Order – $${total.toFixed(2)}`;
    else if (location.pathname.includes('domain.html'))
      button.textContent = `Submit Domain Package – $${total.toFixed(2)}`;
    else
      button.textContent = `Purchase ${credits} Edit Credits – $${total.toFixed(2)}`;
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


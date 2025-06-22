// OneClickSiteBuilder - Unified Script (Patch Plan v1.1)
<script>
/* ---------- configuration ---------- */
const BACKEND            = ".netlify/functions";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvgrzrvg";   // ← your form
const stripe             = Stripe(
  "pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM"
);
/* ----------------------------------- */

function collectFormData(plan) {
  return {
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

async function startOrder(plan) {
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
    /* 1️⃣  create Stripe checkout session (Netlify Function) */
    const res       = await fetch(`${BACKEND}/create-checkout-session`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    const response  = await res.json();

    if (response.error) {
      alert("Error: " + response.error);
      return;
    }

    /* 2️⃣  send the same data to Formspree so you get the email */
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Formspree request failed:", e);   // never block payment
    }

    /* 3️⃣  redirect customer to Stripe Checkout */
    stripe.redirectToCheckout({ sessionId: response.id });

  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

/* ---------- navigation helpers ---------- */
function selectPlan(p)      { window.location.href = `${p}.html`; }
function selectDomainPackage()    { window.location.href = "domain.html"; }
function purchaseEditCredits()    { window.location.href = "credits.html"; }
/* ---------------------------------------- */

/* ---------- price calculator ---------- */
function updateTotal() {
  const editCredits  = parseInt(document.getElementById("editCredits")?.value || 0);
  const totalElement = document.getElementById("orderTotal");
  const submitButton = document.getElementById("submitButton");
  if (!totalElement || !submitButton) return;

  let basePrice = 0;
  if      (location.pathname.includes("basic.html"))   basePrice = 29.99;
  else if (location.pathname.includes("premium.html")) basePrice = 99.99;
  else if (location.pathname.includes("domain.html"))  basePrice = 499.99;

  const total = basePrice + editCredits * 10;
  totalElement.textContent = `$${total.toFixed(2)}`;

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

document.addEventListener("DOMContentLoaded", () => {
  const editCreditsInput = document.getElementById("editCredits");
  if (editCreditsInput) {
    editCreditsInput.addEventListener("input",  updateTotal);
    editCreditsInput.addEventListener("change", updateTotal);
    updateTotal();   // initial
  }
});
</script>

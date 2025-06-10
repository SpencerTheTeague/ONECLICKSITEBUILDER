// OneClickSiteBuilder - Unified Script (Patch Plan v1.1)
const BACKEND = 'https://5002-iiblxxu8kfn4b3g7cndpb-b71d04c4.manusvm.computer';
const stripe = Stripe('pk_live_51RY9PVRvugzB60pNk0vkzEWmNxPLho26Bdzpyw9H50Jw9rHxNXytfLBKw9h8G7GoxVq3Vrtmv43fg51SD6tYNPGg00cDpygKKM');

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
}

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
    }
    
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

// Domain package function
function selectDomainPackage() {
    window.location.href = 'domain.html';
}

// Edit credits function
function purchaseEditCredits() {
    window.location.href = 'credits.html';
}

// Update total when edit credits change
function updateTotal() {
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
}

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
});


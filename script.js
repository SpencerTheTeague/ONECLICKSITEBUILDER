// Enhanced form submission with Stripe payment integration
document.addEventListener("DOMContentLoaded", function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll("a[href^="#"]").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Handle Basic plan form submission
    const basicForm = document.getElementById("basic-form");
    if (basicForm) {
        basicForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = ["basic-name", "basic-email", "basic-business", "basic-description"];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    field.style.borderColor = "#ff4444";
                    isValid = false;
                } else {
                    field.style.borderColor = "#e1e5e9";
                }
            });
            
            if (!isValid) {
                showErrorMessage("Please fill in all required fields");
                return;
            }
            
            // Collect form data
            const formData = {
                name: document.getElementById("basic-name").value,
                email: document.getElementById("basic-email").value,
                business: document.getElementById("basic-business").value,
                description: document.getElementById("basic-description").value,
                colors: document.getElementById("basic-colors").value,
                content: document.getElementById("basic-content").value
            };
            
            // Store data and redirect to checkout
            localStorage.setItem("orderData", JSON.stringify(formData));
            localStorage.setItem("selectedPlan", "basic");
            window.location.href = "checkout.html?plan=basic";
        });
    }

    // Handle Premium plan form submission
    const premiumForm = document.getElementById("premium-form");
    if (premiumForm) {
        premiumForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = ["premium-name", "premium-email", "premium-business", "premium-description"];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    field.style.borderColor = "#ff4444";
                    isValid = false;
                } else {
                    field.style.borderColor = "#e1e5e9";
                }
            });
            
            if (!isValid) {
                showErrorMessage("Please fill in all required fields");
                return;
            }
            
            // Collect form data
            const formData = {
                name: document.getElementById("premium-name").value,
                email: document.getElementById("premium-email").value,
                business: document.getElementById("premium-business").value,
                description: document.getElementById("premium-description").value,
                image1Location: document.getElementById("image1-location").value,
                image2Location: document.getElementById("image2-location").value,
                image3Location: document.getElementById("image3-location").value,
                image4Location: document.getElementById("image4-location").value,
                image5Location: document.getElementById("image5-location").value,
                logoUpload: document.getElementById("logo-upload").files[0] ? document.getElementById("logo-upload").files[0].name : "No logo uploaded",
                fontStyle: document.getElementById("font-style").value,
                overallStyle: document.getElementById("overall-style").value,
                contentText: document.getElementById("content-text").value
            };
            
            // Store data and redirect to checkout
            localStorage.setItem("orderData", JSON.stringify(formData));
            localStorage.setItem("selectedPlan", "premium");
            window.location.href = "checkout.html?plan=premium";
        });
    }

    // Handle Edit Credits form submission
    const editCreditsForm = document.getElementById("edit-credits-form");
    if (editCreditsForm) {
        editCreditsForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = ["credits-name", "credits-email", "credits-phone", "existing-website"];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    field.style.borderColor = "#ff4444";
                    isValid = false;
                } else {
                    field.style.borderColor = "#e1e5e9";
                }
            });
            
            if (!isValid) {
                showErrorMessage("Please fill in all required fields");
                return;
            }
            
            // Collect form data
            const formData = {
                name: document.getElementById("credits-name").value,
                email: document.getElementById("credits-email").value,
                phone: document.getElementById("credits-phone").value,
                existingWebsite: document.getElementById("existing-website").value,
                notes: document.getElementById("credits-notes").value
            };
            
            // Store data and redirect to checkout
            localStorage.setItem("orderData", JSON.stringify(formData));
            localStorage.setItem("selectedPlan", "edit-credits");
            window.location.href = "checkout.html?plan=edit-credits";
        });
    }

    // Function to show error message
    function showErrorMessage(message) {
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Function to show success message
    function showSuccessMessage(message) {
        const successDiv = document.createElement("div");
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // Tech badge animations
    const techBadges = document.querySelectorAll(".tech-badge");
    techBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.5}s`;
    });
});

// Plan selection function
function selectPlan(planType) {
    if (planType === "basic") {
        window.location.href = "basic.html";
    } else if (planType === "premium") {
        window.location.href = "premium.html";
    } else if (planType === "domain") {
        window.location.href = "domain.html";
    } else if (planType === "edit-credits") {
        window.location.href = "edit-credits.html";
    }
}

// Function to purchase edit credits (can be called from anywhere)
function purchaseEditCredits() {
    window.location.href = "edit-credits.html";
}


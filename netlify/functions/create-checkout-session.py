import os
import json
import stripe

# ✅ Netlify injects your secret key via the STRIPE_SECRET_KEY environment variable
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Prices in cents
CREDIT_UNIT = 1000          # $10.00
PACKAGE_PRICES = {
    "basic":   2999,        # $29.99
    "premium": 9999,        # $99.99
    "domain":  49999        # $499.99
}

def handler(event, context):
    try:
        # Parse the POST body sent from your frontend
        data    = json.loads(event["body"])
        plan    = data.get("type")            # basic | premium | domain | credits
        credits = int(data.get("editCredits", 0))

        # Basic validation
        if plan not in PACKAGE_PRICES and plan != "credits":
            return _err("Invalid order type")
        if plan == "credits" and credits < 1:
            return _err("Credits-only order requires at least 1 credit")

        # Build Stripe line-items
        line_items = []
        if plan != "credits":
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"{plan.capitalize()} Website Package"},
                    "unit_amount": PACKAGE_PRICES[plan],
                },
                "quantity": 1,
            })
        if credits > 0:
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Edit Credit",
                        "description": "$10 website edit credit",
                    },
                    "unit_amount": CREDIT_UNIT,
                },
                "quantity": credits,
            })

        # Create the Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,
            success_url="https://www.oneclicksitebuilder.com/success.html?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://www.oneclicksitebuilder.com/#pricing",
            customer_email=data.get("email"),
            metadata={
                "order_type": plan,
                "editCredits": credits,
                "name": data.get("name"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "city": data.get("city"),
                "state": data.get("state"),
                "zip": data.get("zip"),
                "businessName": data.get("businessName"),
                "description": data.get("description"),
            },
        )

        # Return the session ID to the browser
        return {"statusCode": 200, "body": json.dumps({"id": session.id})}

    except Exception as e:
        # Log the error and return 500
        print("Stripe error:", e)
        return _err(str(e), 500)

def _err(message, status=400):
    """Helper to return JSON error responses"""
    return {"statusCode": status, "body": json.dumps({"error": message})}

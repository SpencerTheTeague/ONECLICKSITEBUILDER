import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import stripe
import json

app = Flask(__name__)
CORS(app)

# Stripe configuration - Use environment variable for security
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_placeholder_key_replace_with_real_key')

# Constants from patch plan
CREDIT_UNIT = 1000  # $10.00 in cents
PACKAGE_PRICES = {
    "basic": 2999,    # $29.99
    "premium": 9999,  # $99.99
    "domain": 49999   # $499.99
}

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json(force=True)
        plan = data.get('type')  # basic | premium | domain | credits
        credits = int(data.get('editCredits', 0))
        
        # --- guard rails ---
        if plan not in PACKAGE_PRICES and plan != 'credits':
            return jsonify({'error': 'Invalid order type'}), 400
        if plan == 'credits' and credits < 1:
            return jsonify({'error': 'Credits-only order requires at least 1 credit'}), 400
        
        # --- build line-items ---
        line_items = []
        
        if plan != 'credits':
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': f"{plan.capitalize()} Website Package"},
                    'unit_amount': PACKAGE_PRICES[plan]
                },
                'quantity': 1
            })
        
        if credits > 0:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'Edit Credit', 'description': '$10 website edit credit'},
                    'unit_amount': CREDIT_UNIT
                },
                'quantity': credits
            })
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            line_items=line_items,
            success_url='https://your-domain.com/success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://your-domain.com/#pricing',
            customer_email=data.get('email'),
            metadata={
                'order_type': plan,
                'editCredits': credits,
                'name': data.get('name'),
                'phone': data.get('phone'),
                'address': data.get('address'),
                'city': data.get('city'),
                'state': data.get('state'),
                'zip': data.get('zip'),
                'businessName': data.get('businessName'),
                'description': data.get('description')
            }
        )
        
        # Log order details for staff
        print(f"""
        ==========================================
        NEW ORDER RECEIVED - {plan.upper()}
        ==========================================
        
        ORDER TYPE: {plan}
        EDIT CREDITS: {credits}
        
        CUSTOMER INFORMATION:
        Name: {data.get('name', 'N/A')}
        Email: {data.get('email', 'N/A')}
        Phone: {data.get('phone', 'N/A')}
        
        ADDRESS:
        Street: {data.get('address', 'N/A')}
        City: {data.get('city', 'N/A')}
        State: {data.get('state', 'N/A')}
        ZIP: {data.get('zip', 'N/A')}
        
        BUSINESS INFORMATION:
        Business Name: {data.get('businessName', 'N/A')}
        Description: {data.get('description', 'N/A')}
        
        STRIPE SESSION ID: {session.id}
        ==========================================
        """)
        
        return jsonify({'id': session.id})
        
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)


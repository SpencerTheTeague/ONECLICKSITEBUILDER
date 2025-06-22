// netlify/functions/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**  Netlify Function  **/
exports.handler = async (event) => {
  try {
    const data   = JSON.parse(event.body);
    const plan   = data.type;               // basic | premium | domain | credits
    const credits = parseInt(data.editCredits || 0, 10);

    const PACKAGE_PRICES = { basic: 2999, premium: 9999, domain: 49999 }; // cents
    const CREDIT_UNIT    = 1000; // $10.00

    if (!PACKAGE_PRICES[plan] && plan !== 'credits') {
      return json(400, 'Invalid order type');
    }
    if (plan === 'credits' && credits < 1) {
      return json(400, 'Credits-only order requires at least 1 credit');
    }

    const line_items = [];
    if (plan !== 'credits') {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan.charAt(0).toUpperCase()+plan.slice(1)} Website Package`},
          unit_amount: PACKAGE_PRICES[plan],
        },
        quantity: 1,
      });
    }
    if (credits > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Edit Credit', description: '$10 website edit credit'},
          unit_amount: CREDIT_UNIT,
        },
        quantity: credits,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: 'https://www.oneclicksitebuilder.com/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  'https://www.oneclicksitebuilder.com/#pricing',
      customer_email: data.email,
      metadata: {
        order_type: plan,
        editCredits: credits,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        businessName: data.businessName,
        description: data.description,
      },
    });

    return json(200, { id: session.id });
  } catch (err) {
    console.error(err);
    return json(500, err.message);
  }
};

/** helper */
function json(status, body) {
  return { statusCode: status, body: JSON.stringify(typeof body === 'string' ? { error: body } : body) };
}

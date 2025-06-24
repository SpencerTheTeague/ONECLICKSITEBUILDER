const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { amount, currency, paymentMethodType, customerName, customerEmail, customerPhone, orderData, selectedPlan } = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: [paymentMethodType],
      metadata: {
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        selectedPlan: selectedPlan,
        orderData: JSON.stringify(orderData),
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: { message: error.message } }),
    };
  }
};


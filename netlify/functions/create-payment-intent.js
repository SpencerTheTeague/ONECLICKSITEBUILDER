const stripe = require("stripe")("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");

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




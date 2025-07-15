const stripe = require('stripe')(process.env.PRIVATE_KEY);
const express = require('express');
const router = express.Router();


router.post('/create-payment-intent', async (req, res) => {

  try {
    const { amount, currency = 'inr', description, metadata, customer } = req.body;

    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Valid amount is required' 
      });
    }

    
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        message: 'Customer name, email, and phone are required for Indian payments'
      });
    }

    if (!customer.address || !customer.address.line1 || !customer.address.city || 
        !customer.address.state || !customer.address.postal_code) {
      return res.status(400).json({
        message: 'Complete address is required for Indian payments'
      });
    }

    
    if (!description) {
      return res.status(400).json({
        message: 'Description is required'
      });
    }

    
    const pinCodeRegex = /^[0-9]{6}$/;
    if (!pinCodeRegex.test(customer.address.postal_code)) {
      return res.status(400).json({
        message: 'Invalid PIN code format. Must be 6 digits.'
      });
    }

    
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(customer.phone)) {
      return res.status(400).json({
        message: 'Invalid phone number format'
      });
    }

    
    let stripeCustomer;
    try {
      
      const existingCustomers = await stripe.customers.list({
        email: customer.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomer = existingCustomers.data[0];
        
        
        stripeCustomer = await stripe.customers.update(stripeCustomer.id, {
          name: customer.name,
          phone: customer.phone,
          address: {
            line1: customer.address.line1,
            city: customer.address.city,
            state: customer.address.state,
            postal_code: customer.address.postal_code,
            country: 'IN',
          }
        });
      } else {
        // Create new customer
        stripeCustomer = await stripe.customers.create({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            line1: customer.address.line1,
            city: customer.address.city,
            state: customer.address.state,
            postal_code: customer.address.postal_code,
            country: 'IN',
          }
        });
      }
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
      return res.status(400).json({
        message: 'Invalid customer information',
        error: customerError.message
      });
    }

    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), 
      currency: 'inr',
      customer: stripeCustomer.id,
      description,
      metadata: {
        ...metadata,
        domesticTransaction: 'true',
        customerCountry: 'IN',
        customerPhone: customer.phone,
        customerState: customer.address.state,
        customerCity: customer.address.city,
        customerPinCode: customer.address.postal_code,
      },
      
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', 
      },
      
      receipt_email: customer.email,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: stripeCustomer.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        message: 'Your card was declined.',
        error: error.message
      });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        message: 'Invalid payment information.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});




module.exports = router;
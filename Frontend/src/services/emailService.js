import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_0fn13vi';
const TEMPLATE_ID = 'template_wl00oim';
const USER_ID = 'DYNCet2Lb6_NfHZom';


emailjs.init(USER_ID);

export const sendEmailNotification = async (orderData) => {
  try {
    
    if (!orderData || !orderData.orderId || !orderData.customerName || !orderData.customerEmail) {
      throw new Error('Missing required order data for email notification');
    }

    const templateParams = {
      to_email: 'ziyahid27@gmail.com', 
      from_name: 'E-Commerce Store',
      subject: `New Order Received - #${orderData.orderId}`,
      
      
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      product_name: orderData.productName,
      product_price: `₹${orderData.productPrice}`,
      order_total: `₹${orderData.orderTotal}`,
      order_date: orderData.orderDate || new Date().toLocaleString('en-IN'),
      
      
      customer_address: orderData.address || 'Not provided',
      customer_city: orderData.city || 'Not provided',
      customer_state: orderData.state || 'Not provided',
      customer_zipcode: orderData.zipCode || 'Not provided',
      customer_phone: orderData.phone || 'Not provided',
      
      
      payment_intent_id: orderData.paymentIntentId || 'Not available',
      
      
      message: `
        NEW ORDER RECEIVED!
        
        Order Information:
        • Order ID: #${orderData.orderId}
        • Date: ${orderData.orderDate || new Date().toLocaleString('en-IN')}
        • Status: Confirmed
        
        Customer Details:
        • Name: ${orderData.customerName}
        • Email: ${orderData.customerEmail}
        • Phone: ${orderData.phone || 'Not provided'}
        
        Product Details:
        • Product: ${orderData.productName}
        • Price: ₹${orderData.productPrice}
        • Total: ₹${orderData.orderTotal}
        
        Delivery Address:
        ${orderData.address || 'Not provided'}
        ${orderData.city || ''}, ${orderData.state || ''} - ${orderData.zipCode || ''}
        
        Payment Details:
        • Payment ID: ${orderData.paymentIntentId || 'Not available'}
        • Status: Success
        
        Please process this order in the admin dashboard.
      `
    };

    console.log('Sending email with params:', templateParams);

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

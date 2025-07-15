import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { sendEmailNotification } from '../../services/emailService';
import { CreditCard, Lock, User, Mail, MapPin } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ product, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.displayName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN', 
    phone: '', 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (!formData.phone) {
      setError('Phone number is required for Indian payments');
      setIsProcessing(false);
      return;
    }

    try {
      
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: Math.round(product.price * 100),
          currency: 'inr',
          description: `${product.name} - Domestic Purchase`,
          metadata: {
            productName: product.name,
            userId: user?.uid || 'anonymous',
            domesticTransaction: 'true',
            customerCountry: 'IN',
          },
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'IN',
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const { clientSecret } = await response.json();
      
      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'IN',
            }
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          
          
          const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          
          const orderData = {
            
            userId: user?.uid || 'anonymous',
            userName: formData.name,
            userEmail: formData.email,
            productName: product.name,
            productImage: product.image || product.imageUrl || '', 
            productId: product.id || null,
            total: product.price, 
            orderStatus: 'confirmed', 
            createdAt: serverTimestamp(),
            
            
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'IN',
            },
            currency: 'INR',
            paymentIntentId: result.paymentIntent.id,
            paymentStatus: result.paymentIntent.status,
            domesticTransaction: true,
            orderId: orderId,
          };

          console.log('Attempting to save order:', orderData);

          
          try {
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log('Order saved successfully with ID:', docRef.id);
            
            
            const emailData = {
              orderId: orderId,
              customerName: formData.name,
              customerEmail: formData.email,
              productName: product.name,
              productPrice: product.price,
              orderTotal: product.price,
              paymentIntentId: result.paymentIntent.id,
              orderDate: new Date().toLocaleDateString('en-IN'),
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              phone: formData.phone,
            };

            
            try {
              await sendEmailNotification(emailData);
              console.log('Email sent successfully');
            } catch (emailError) {
              console.error('Email notification failed:', emailError);
            }

            onSuccess(result.paymentIntent);
          } catch (dbError) {
            console.error('Database save error:', dbError);
            throw new Error(`Failed to save order: ${dbError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* User Authentication Status */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              Note: You are not logged in. Order will be saved as anonymous.
            </p>
          </div>
        )}
        
        {/* Order Summary */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="flex items-center space-x-4">
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>₹{product.price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+91 XXXXXXXXXX"
                className="input-field"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="e.g., 400001"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value="India"
                  disabled
                  className="input-field bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Domestic Transaction Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Domestic Transaction</h4>
            <p className="text-sm text-blue-700">
              This is a domestic transaction processed in Indian Rupees (INR). 
              All payments are processed securely through Stripe with Indian banking regulations compliance.
            </p>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border p-3 rounded-md">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Accepts Indian debit/credit cards, UPI, and other local payment methods.
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <Lock className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-green-700">
              Your payment information is secure and encrypted. RBI compliant processing.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !stripe}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${product.price}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
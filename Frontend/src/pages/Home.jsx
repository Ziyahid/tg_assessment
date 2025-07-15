import { useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import CheckoutForm from '../components/payment/CheckoutForm';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const stripePromise = loadStripe('pk_test_51QncD0SJgIkeS33VmBjXhIoRuD34Or1TU53TYQ4grtuM82pgJzVk6jnAl7EbG4DLHm7HrH9Dfd2ADr8UzOJkH9Ur00EdLs3ik7');

  const products = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'Electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      category: 'Electronics',
      description: 'Feature-rich smartwatch with health monitoring',
      rating: 4.3,
      reviews: 89
    },
    {
      id: 3,
      name: 'Laptop Backpack',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      category: 'Accessories',
      description: 'Durable laptop backpack with multiple compartments',
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      category: 'Electronics',
      description: 'Ergonomic wireless mouse with precision tracking',
      rating: 4.4,
      reviews: 203
    },
    {
      id: 5,
      name: 'USB-C Hub',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=300&fit=crop',
      category: 'Electronics',
      description: 'Multi-port USB-C hub with 4K HDMI output',
      rating: 4.6,
      reviews: 78
    },
    {
      id: 6,
      name: 'Phone Case',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop',
      category: 'Accessories',
      description: 'Protective phone case with shock absorption',
      rating: 4.2,
      reviews: 321
    }
  ];

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderData) => {
    setOrderSuccess(orderData);
    setShowCheckout(false);
    setSelectedProduct(null);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedProduct(null);
  };

  const handleBackToShopping = () => {
    setOrderSuccess(null);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and the admin has been notified.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="flex items-center justify-between mb-2">
                <span>Order ID:</span>
                <span className="font-medium">#{orderSuccess.id?.slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Product:</span>
                <span className="font-medium">{orderSuccess.productName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Total:</span>
                <span className="font-medium">${orderSuccess.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {orderSuccess.orderStatus}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleBackToShopping}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  if (showCheckout && selectedProduct) {
    return (
      <Elements stripe={stripePromise} className="min-h-screen bg-gray-50 py-12">
        <CheckoutForm
          product={selectedProduct}
          onSuccess={handleCheckoutSuccess}
          onCancel={handleCheckoutCancel}
          onBuyNow={handleBuyNow}
        />
      </Elements>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Our E-Commerce Store
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Discover amazing products with secure payment processing
            </p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of high-quality products. 
            Each purchase automatically notifies our admin team for quick processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                All transactions are processed securely with industry-standard encryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Notifications
              </h3>
              <p className="text-gray-600">
                Our admin team is notified immediately when you place an order.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Products
              </h3>
              <p className="text-gray-600">
                We offer only the highest quality products with excellent customer reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
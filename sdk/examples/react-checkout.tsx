/**
 * React Checkout Example
 * Complete example of integrating Klyr Checkout in a React application
 */

import React, { useState } from 'react';
import { KlyrCheckoutButton, KlyrEmbeddedCheckout, useKlyrCheckout } from '@klyr/sdk/react';

// Example 1: Simple Checkout Button
export function SimpleCheckout() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Premium Plan</h1>
      <p className="text-gray-600 mb-6">$29.99 / month</p>
      
      <KlyrCheckoutButton
        merchantId="your_merchant_id"
        amount="29.99"
        currency="USD"
        description="Premium Plan - Monthly"
        onSuccess={(paymentId, txHash) => {
          console.log('Payment successful!', paymentId);
          alert('Payment successful! Payment ID: ' + paymentId);
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
          alert('Payment failed: ' + error.message);
        }}
      >
        Subscribe Now
      </KlyrCheckoutButton>
    </div>
  );
}

// Example 2: E-commerce Product Page
export function ProductCheckout() {
  const [quantity, setQuantity] = useState(1);
  const pricePerUnit = 49.99;
  const total = (pricePerUnit * quantity).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <img 
          src="/product-image.jpg" 
          alt="Product" 
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        
        <h1 className="text-3xl font-bold mb-2">Premium Widget</h1>
        <p className="text-gray-600 mb-4">
          High-quality widget with advanced features
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <label className="font-semibold">Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="border rounded px-3 py-2 w-20"
          />
          <span className="text-2xl font-bold ml-auto">
            ${total}
          </span>
        </div>

        <KlyrCheckoutButton
          merchantId="your_merchant_id"
          amount={total}
          currency="USD"
          description={`Premium Widget x${quantity}`}
          metadata={{
            product_id: 'widget_premium',
            quantity: quantity,
          }}
          onSuccess={(paymentId, txHash) => {
            // Handle successful payment
            console.log('Order placed!', paymentId);
            window.location.href = `/order-confirmation?payment_id=${paymentId}`;
          }}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700"
        >
          Buy Now with Crypto
        </KlyrCheckoutButton>
      </div>
    </div>
  );
}

// Example 3: Embedded Checkout Page
export function EmbeddedCheckoutPage() {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been confirmed on the blockchain.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Payment ID: {paymentId}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>
        
        <KlyrEmbeddedCheckout
          merchantId="your_merchant_id"
          amount="99.99"
          currency="USD"
          description="Annual Subscription"
          onSuccess={(id, txHash) => {
            setPaymentId(id);
            setPaymentComplete(true);
          }}
          className="bg-white rounded-lg shadow-lg"
          style={{ minHeight: '700px' }}
        />
      </div>
    </div>
  );
}

// Example 4: Using the Hook for Custom Control
export function CustomCheckoutFlow() {
  const { openCheckout } = useKlyrCheckout();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  const plans = {
    basic: { name: 'Basic', price: '9.99', features: ['Feature 1', 'Feature 2'] },
    pro: { name: 'Pro', price: '29.99', features: ['All Basic', 'Feature 3', 'Feature 4'] },
    enterprise: { name: 'Enterprise', price: '99.99', features: ['All Pro', 'Feature 5', 'Priority Support'] },
  };

  const handleSubscribe = () => {
    const plan = plans[selectedPlan];
    
    openCheckout({
      merchantId: 'your_merchant_id',
      amount: plan.price,
      currency: 'USD',
      description: `${plan.name} Plan - Monthly`,
      metadata: {
        plan: selectedPlan,
        billing_cycle: 'monthly',
      },
      onSuccess: (paymentId, txHash) => {
        console.log('Subscription activated!', paymentId);
        // Activate subscription in your backend
        fetch('/api/activate-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, plan: selectedPlan }),
        });
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            onClick={() => setSelectedPlan(key as any)}
            className={`
              border-2 rounded-lg p-6 cursor-pointer transition-all
              ${selectedPlan === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-4xl font-bold mb-4">
              ${plan.price}
              <span className="text-lg text-gray-500">/mo</span>
            </p>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubscribe}
          className="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Subscribe to {plans[selectedPlan].name} Plan
        </button>
      </div>
    </div>
  );
}

export default SimpleCheckout;


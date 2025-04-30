import React from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const PaymentButton = () => {
  const { isLoggedIn } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  // Ensure Razorpay script is loaded
  React.useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }

    try {
      // 1. Create order on backend
      const token = localStorage.getItem('token');
const { data } = await axios.post(
  '/api/payment/create-order',
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const { order, key, paymentId } = data;

      // 2. Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert("Payment gateway is not loaded. Please refresh the page.");
        return;
      }

      // 3. Configure Razorpay options
      const options = {
        key,
        amount: order.amount, // Amount in paise (from backend)
        currency: order.currency,
        name: "Toolish ShareHub",
        description: "Tool rental payment",
        order_id: order.id,
        handler: async function (response) {
          // 4. Verify payment on backend
          await axios.post('/api/payment/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentId
          });
          clearCart();
          navigate('/dashboard');
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function() {
            alert("Payment cancelled. You closed the payment window.");
          }
        }
      };

      // 5. Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  return (
    <button className="w-full bg-primary text-white py-2 rounded" onClick={handlePayment}>
      Pay with Razorpay
    </button>
  );
};

export default PaymentButton;

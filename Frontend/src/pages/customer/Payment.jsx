import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Payment() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/${paymentId}`);
        setPayment(res.data.payment);

        if (res.data.payment.status !== "pending") {
          toast.error(`Payment already ${res.data.payment.status}`);
          navigate("/cart");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Payment session not found");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, navigate]);

  const handlePay = async () => {
    if (!payment?.razorpayOrderId || !payment?.keyId) {
      toast.error("Payment details missing. Please try again from cart.");
      return;
    }

    setPaying(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay. Check your internet connection.");
      setPaying(false);
      return;
    }

    const options = {
      key: payment.keyId,
      amount: Math.round(payment.amount * 100),
      currency: "INR",
      name: "Digi-Merchant",
      description: `Order from ${payment.shopName}`,
      order_id: payment.razorpayOrderId,
      handler: async (response) => {
        try {
          await api.post("/payments/verify", {
            paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          clearCart();
          toast.success("Order placed successfully!");
          navigate("/my-orders");
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed");
          setPaying(false);
        }
      },
      theme: {
        color: "#16a34a",
      },
      modal: {
        ondismiss: () => {
          setPaying(false);
          toast.error("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
      setPaying(false);
    });

    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate("/cart")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Cart
        </button>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Razorpay Secure Checkout
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Complete Payment</h1>
          <p className="text-sm text-gray-500">Paying for {payment?.shopName}</p>
          <p className="text-3xl font-bold text-green-600 mt-4">
            ₹{payment?.amount?.toFixed(2)}
          </p>
          {payment?.discountAmount > 0 && (
            <p className="text-sm text-green-700 mt-2">
              Coupon {payment.couponCode}: −₹{payment.discountAmount.toFixed(2)}
              {payment.subtotal > 0 && (
                <span className="text-gray-400">
                  {" "}
                  (was ₹{payment.subtotal.toFixed(2)})
                </span>
              )}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">ID: {payment?.paymentId}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-600 mb-6">
            You will be redirected to Razorpay to complete your payment securely
            using UPI, card, or netbanking.
          </p>

          <button
            onClick={handlePay}
            disabled={paying}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              paying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {paying ? "Opening Razorpay..." : `Pay ₹${payment?.amount?.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;

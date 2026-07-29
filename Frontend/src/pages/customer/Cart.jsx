import { useCart } from "../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

function Cart() {
  const { cartItems, removeFromCart, updateCart, calculateTotalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const totalAmount = calculateTotalAmount();
  const shopId = cartItems[0]?.shopId;
  const shopName = cartItems[0]?.shopName;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const amountToPay = totalAmount - discountAmount;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get("/coupons");
        setAvailableCoupons(res.data.coupons || []);
      } catch (error) {
        console.error("Failed to load coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  // Drop applied coupon if shop or cart total changes (min-order / % amount can go stale)
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponInput("");
  }, [shopId, totalAmount]);

  const handleApplyCoupon = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to apply a coupon");
      navigate("/login");
      return;
    }

    if (!couponInput.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    if (!shopId || totalAmount <= 0) {
      toast.error("Add items to cart first");
      return;
    }

    setCouponLoading(true);
    try {
      const res = await api.post("/coupons/validate", {
        code: couponInput.trim(),
        shopId,
        subtotal: totalAmount,
      });

      setAppliedCoupon({
        code: res.data.code,
        description: res.data.description,
        discountAmount: res.data.discountAmount,
      });
      setCouponInput(res.data.code);
      toast.success(`Coupon ${res.data.code} applied`);
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!shopId) {
      setMessage({ type: "error", text: "Invalid cart. Please add items from a shop." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const items = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));
    const couponCode = appliedCoupon?.code || "";

    try {
      if (paymentMethod === "cod") {
        await api.post(`/shops/${shopId}/orders`, { items, couponCode });
        clearCart();
        toast.success("COD order placed! Pay cash on delivery.");
        navigate("/my-orders");
        return;
      }

      const res = await api.post("/payments/create-session", {
        shopId,
        items,
        couponCode,
      });

      navigate(`/payment/${res.data.payment.paymentId}`);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Checkout failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-8">
              Start shopping to add items to your cart!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Cart Items ({cartItems.length})
              </h2>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setClearConfirmOpen(true)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm transition"
                >
                  Clear Cart
                </button>
              )}
            </div>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow p-6 flex items-center justify-between hover:shadow-lg transition"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-2">₹{item.price}</p>
                    <p className="text-sm text-gray-500">
                      Category: {item.category || "General"}
                    </p>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        (item.stock ?? 0) <= item.quantity
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.stock ? `${item.stock} in stock` : "Out of stock"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mx-6">
                    <button
                      onClick={() => {
                        const result = updateCart(
                          item.id,
                          item.quantity - 1,
                          item.stock
                        );
                        if (!result.success) {
                          setMessage({ type: "error", text: result.message });
                          setTimeout(() => setMessage(null), 3000);
                        } else {
                          setMessage(null);
                        }
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-8 h-8 rounded-lg flex items-center justify-center transition"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= (item.stock ?? 0)}
                      onClick={() => {
                        const result = updateCart(
                          item.id,
                          item.quantity + 1,
                          item.stock
                        );
                        if (!result.success) {
                          setMessage({ type: "error", text: result.message });
                          setTimeout(() => setMessage(null), 3000);
                        } else {
                          setMessage(null);
                        }
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        item.quantity >= (item.stock ?? 0)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 mb-3">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              {shopName && (
                <p className="text-sm text-gray-600 mb-4">
                  Ordering from:{" "}
                  <span className="font-medium">{shopName}</span>
                </p>
              )}

              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Coupon code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. FIRST10"
                    disabled={!!appliedCoupon}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <p className="text-xs text-green-700 mt-2">
                    {appliedCoupon.code}: {appliedCoupon.description}
                  </p>
                )}

                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-500">
                      Available codes
                    </p>
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCouponInput(c.code)}
                        className="block w-full text-left text-xs text-gray-600 hover:text-green-700"
                      >
                        <span className="font-semibold">{c.code}</span> —{" "}
                        {c.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Amount to pay
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{amountToPay.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Payment method
                </p>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "online"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium text-gray-800">
                        Pay Online
                      </span>
                      <span className="text-xs text-gray-500">
                        Razorpay · UPI / cards / netbanking
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium text-gray-800">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay cash when your order arrives
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-3 rounded-xl transition font-semibold mb-3 text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading
                  ? paymentMethod === "cod"
                    ? "Placing order..."
                    : "Redirecting..."
                  : paymentMethod === "cod"
                    ? "Place COD Order"
                    : "Proceed to Payment"}
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={clearConfirmOpen}
        title="Clear cart?"
        message="This will remove all items from your cart. You can’t undo this action."
        confirmLabel="Clear cart"
        cancelLabel="Keep items"
        variant="danger"
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          clearCart();
          setClearConfirmOpen(false);
          setMessage({ type: "success", text: "Cart cleared successfully!" });
          setTimeout(() => setMessage(null), 3000);
        }}
      />
    </div>
  );
}

export default Cart;

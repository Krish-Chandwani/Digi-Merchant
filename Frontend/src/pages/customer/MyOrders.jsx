import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import OrderTimeline from "../../components/OrderTimeline";
import ConfirmModal from "../../components/ConfirmModal";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const res = await api.get("/orders/my");
    setOrders(res.data.orders || []);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders()
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const paymentStatusClass = (paymentStatus) => {
    if (paymentStatus === "paid") return "text-green-600";
    if (paymentStatus === "refunded") return "text-blue-600";
    if (paymentStatus === "failed") return "text-red-600";
    return "text-yellow-600";
  };

  const canCancel = (order) =>
    order.status === "pending" || order.status === "accepted";

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${cancelTarget._id}/cancel`);
      const updated = res.data.order;

      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );

      toast.success(res.data.message || "Order cancelled");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-lg text-gray-600">
          Loading your orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8">
              Your placed orders will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
            >
              Browse Shops
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {order.shop?.name || "Shop"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.shop?.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${getStatusStyle(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                {order.paymentStatus && (
                  <p className="text-sm text-gray-500 mb-4">
                    Payment:{" "}
                    <span
                      className={`font-medium capitalize ${paymentStatusClass(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                    {order.paymentMethod === "online" ? " · Online" : " · COD"}
                    {order.paymentStatus === "refunded" &&
                      order.paymentMethod === "online" && (
                        <span className="block text-xs text-gray-400 mt-1">
                          Refund returns to your original payment method in a
                          few business days.
                        </span>
                      )}
                  </p>
                )}

                <div className="border-t border-gray-100 pt-4 mb-2">
                  <OrderTimeline
                    status={order.status}
                    statusHistory={order.statusHistory}
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-gray-700"
                    >
                      <span>
                        {item.product?.name || "Product"} x{item.quantity}
                      </span>
                      <span>
                        ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    {order.discountAmount > 0 && (
                      <p className="text-sm text-green-700 mb-1">
                        Coupon {order.couponCode}: −₹
                        {order.discountAmount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-green-600">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canCancel(order) && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(order)}
                        className="text-sm border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel order
                      </button>
                    )}
                    {order.shop?.whatsappNumber && (
                      <a
                        href={`https://wa.me/91${order.shop.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Contact Shop
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel this order?"
        message={
          cancelTarget?.paymentMethod === "online" &&
          cancelTarget?.paymentStatus === "paid"
            ? "Your payment will be refunded to the original payment method (usually a few business days)."
            : "This will cancel the order and restore stock. You can’t undo this."
        }
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        variant="danger"
        loading={cancelling}
        onCancel={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default MyOrders;

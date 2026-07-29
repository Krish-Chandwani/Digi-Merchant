import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import OrderTimeline from "../../components/OrderTimeline";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-700";
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
                      className={`font-medium capitalize ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    {order.paymentMethod === "online" ? " · Online" : " · COD"}
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
                      <span>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;

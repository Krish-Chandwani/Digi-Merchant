import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Select from "../../components/Select";

const STATUS_OPTIONS = ["pending", "accepted", "delivered", "cancelled"];

const getStatusSelectStyle = (status) => {
  switch (status) {
    case "pending":
      return "border-yellow-300 bg-yellow-50 text-yellow-800 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100";
    case "accepted":
      return "border-blue-300 bg-blue-50 text-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
    case "delivered":
    case "completed":
      return "border-green-300 bg-green-50 text-green-800 focus:border-green-400 focus:ring-2 focus:ring-green-100";
    case "cancelled":
      return "border-red-300 bg-red-50 text-red-800 focus:border-red-400 focus:ring-2 focus:ring-red-100";
    default:
      return "border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100";
  }
};

const formatStatus = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const shopsRes = await api.get("/shops/my");
      const shopList = shopsRes.data.shops || [];
      setShops(shopList);

      if (shopList.length === 0) {
        setOrders([]);
        return;
      }

      const ordersByShop = await Promise.all(
        shopList.map(async (shop) => {
          const res = await api.get(`/shops/${shop._id}/orders`);
          return (res.data.orders || []).map((order) => ({
            ...order,
            shopId: shop._id,
            shopName: shop.name,
          }));
        })
      );

      const allOrders = ordersByShop
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders().finally(() => setLoading(false));
  }, [navigate]);

  const handleStatusChange = async (order, newStatus) => {
    if (order.status === newStatus) return;

    setUpdatingId(order._id);
    try {
      await api.patch(
        `/shops/${order.shopId}/orders/${order._id}/status`,
        { status: newStatus }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, status: newStatus } : o
        )
      );

      toast.success("Order status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (order, newPaymentStatus) => {
    if (order.paymentStatus === newPaymentStatus) return;

    setUpdatingPaymentId(order._id);
    try {
      await api.patch(
        `/shops/${order.shopId}/orders/${order._id}/payment-status`,
        { paymentStatus: newPaymentStatus }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, paymentStatus: newPaymentStatus }
            : o
        )
      );

      toast.success(
        newPaymentStatus === "paid"
          ? "Marked as cash received"
          : "Marked as payment pending"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update payment status"
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders =
    selectedShop === "all"
      ? orders
      : orders.filter((order) => order.shopId === selectedShop);

  if (loading) {
    return <div className="p-6 text-lg">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/merchant/manage-shops")}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Shop Orders</h1>
          </div>

          {shops.length > 1 && (
            <Select
              label="Filter by shop"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="min-w-[220px]"
              selectClassName="border-gray-200 bg-white text-gray-800 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="all">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        {shops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-gray-600 mb-4">Create a shop first to receive orders.</p>
            <button
              onClick={() => navigate("/merchant/create-shop")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create Shop
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500">Orders from customers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {order.shopName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {order.customer?.name || "Unknown"}
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
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-gray-500">
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

                    {order.paymentMethod === "cod" && (
                      <Select
                        label="Cash received?"
                        value={order.paymentStatus}
                        disabled={updatingPaymentId === order._id}
                        onChange={(e) =>
                          handlePaymentStatusChange(order, e.target.value)
                        }
                        className="min-w-[160px]"
                        selectClassName={
                          order.paymentStatus === "paid"
                            ? "border-green-300 bg-green-50 text-green-800 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            : "border-yellow-300 bg-yellow-50 text-yellow-800 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid (cash)</option>
                      </Select>
                    )}
                  </div>
                )}

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

                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap items-end justify-between gap-4">
                  <p className="text-lg font-bold text-green-600">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </p>

                  <Select
                    label="Update status"
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="min-w-[180px]"
                    selectClassName={getStatusSelectStyle(order.status)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantOrders;

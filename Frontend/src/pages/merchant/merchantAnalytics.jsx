import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Select from "../../components/Select";

const emptyAnalytics = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function MerchantAnalytics() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("all");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAnalytics = async (shopList, shopId) => {
    if (shopList.length === 0) {
      setAnalytics(emptyAnalytics);
      return;
    }

    if (shopId === "all") {
      const results = await Promise.all(
        shopList.map((shop) => api.get(`/shops/${shop._id}/analytics`))
      );

      const aggregated = results.reduce(
        (acc, res) => {
          const data = res.data.analytics;
          acc.totalRevenue += data.totalRevenue;
          acc.totalOrders += data.totalOrders;
          acc.pendingOrders += data.pendingOrders;
          acc.deliveredOrders += data.deliveredOrders;
          return acc;
        },
        { ...emptyAnalytics }
      );

      setAnalytics(aggregated);
    } else {
      const res = await api.get(`/shops/${shopId}/analytics`);
      setAnalytics(res.data.analytics);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const shopsRes = await api.get("/shops/my");
        setShops(shopsRes.data.shops || []);
      } catch (error) {
        console.error("Error loading analytics:", error);
        toast.error(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;

    if (shops.length === 0) {
      setAnalytics(emptyAnalytics);
      return;
    }

    fetchAnalytics(shops, selectedShop).catch((error) => {
      toast.error(error.response?.data?.message || "Failed to load analytics");
    });
  }, [selectedShop, shops, loading]);

  if (loading) {
    return <div className="p-6 text-lg">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/merchant/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-500 mt-1">
              Track your shop performance and order stats
            </p>
          </div>

          {shops.length > 0 && (
            <Select
              label="Select shop"
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
            <p className="text-gray-600 mb-4">
              Create a shop to start tracking analytics.
            </p>
            <button
              onClick={() => navigate("/merchant/create-shop")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create Shop
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Total Revenue"
                value={`₹${analytics.totalRevenue.toFixed(2)}`}
                icon="💰"
                color="text-green-600"
              />
              <StatCard
                label="Total Orders"
                value={analytics.totalOrders}
                icon="📦"
                color="text-blue-600"
              />
              <StatCard
                label="Pending Orders"
                value={analytics.pendingOrders}
                icon="⏳"
                color="text-yellow-600"
              />
              <StatCard
                label="Delivered Orders"
                value={analytics.deliveredOrders}
                icon="✅"
                color="text-emerald-600"
              />
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Summary
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Completion rate:</span>{" "}
                  {analytics.totalOrders > 0
                    ? `${Math.round((analytics.deliveredOrders / analytics.totalOrders) * 100)}%`
                    : "—"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Average order value:</span>{" "}
                  {analytics.totalOrders > 0
                    ? `₹${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)}`
                    : "—"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Viewing:</span>{" "}
                  {selectedShop === "all"
                    ? `All shops (${shops.length})`
                    : shops.find((s) => s._id === selectedShop)?.name}
                </p>
              </div>

              <button
                onClick={() => navigate("/merchant/orders")}
                className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
              >
                View All Orders →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MerchantAnalytics;

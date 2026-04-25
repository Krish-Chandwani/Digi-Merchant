import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Dashboard() {
  const [shops, setShops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops/my");
        setShops(res.data.shops || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
      </div>

      {/* Shops */}
      {shops.length === 0 ? (
        <p>No shops yet. Create your first shop.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Shop */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Create Shop</h2>
            <button
              onClick={() => navigate("/merchant/create-shop")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              + New Shop
            </button>
          </div>

          {/* Manage Shops */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Manage Shops</h2>
            <button
              onClick={() => navigate("/merchant")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              View Shops
            </button>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Orders</h2>
            <button
              onClick={() => navigate("/merchant/orders")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

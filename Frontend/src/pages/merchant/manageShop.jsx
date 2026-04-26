import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function MyShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops/my");
        setShops(res.data.shops || []);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return <div className="p-6 text-lg">Loading your shops...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Shops</h1>

        <button
          onClick={() => navigate("/merchant/create-shop")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Create Shop
        </button>
      </div>

      {/* Shops List */}
      {shops.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-600 mb-4">
            You don’t have any shops yet.
          </p>
          <button
            onClick={() => navigate("/merchant/create-shop")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Create Your First Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              
              {/* Banner */}
              <img
                src={shop.banner || "https://via.placeholder.com/400x150"}
                className="w-full h-32 object-cover"
              />

              {/* Content */}
              <div className="p-4">

                {/* Logo + Info */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={shop.logo || "https://via.placeholder.com/50"}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h2 className="font-semibold text-lg">
                      {shop.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {shop.category || "General"}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <p className="text-sm text-gray-600 mb-3">
                  {shop.address}
                </p>

                {/* Actions */}
                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      navigate(`/merchant/shop/${shop._id}/products`)
                    }
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Products
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/merchant/shop/${shop._id}/edit`)
                    }
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyShops;
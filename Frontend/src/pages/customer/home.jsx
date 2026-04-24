import { useEffect, useState } from "react";
import api from "../../api/axios";
import ShopCard from "../../components/ShopCard";

function Home() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // 🔥 Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops");
        const shopData = res.data.shops || [];

        setShops(shopData);
        setFilteredShops(shopData);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = shops.filter((shop) =>
        (shop.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.address || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredShops(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, shops]);

  // 🔥 Loading UI
  if (loading) {
    return (
      <div className="p-6 text-lg text-gray-600">
        Loading shops...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Local Shops Near You
          </h1>

          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Support nearby businesses and order products easily from trusted local merchants.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by shop name, category, or address..."
              className="w-full px-5 py-4 rounded-xl text-gray-800 shadow-lg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Shops Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Available Shops
            </h2>
            <p className="text-gray-600 mt-1">
              Browse and explore local businesses in your area
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* No Shops Found */}
        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No shops found
            </h3>
            <p className="text-gray-500">
              Try searching with a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop) => (
              <div
                key={shop._id}
                className="cursor-pointer"
              >
                <ShopCard shop={shop} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
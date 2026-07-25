import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import ShopCard from "../../components/ShopCard";

const DEFAULT_RADIUS_KM = 15;

function Home() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState(DEFAULT_RADIUS_KM);

  const loadShops = useCallback(async (coords = null) => {
    setError(null);
    try {
      const res = coords
        ? await api.get("/shops", {
            params: {
              lat: coords.latitude,
              lng: coords.longitude,
              maxDistanceKm: DEFAULT_RADIUS_KM,
            },
          })
        : await api.get("/shops");

      if (coords) {
        setNearbyMode(true);
        setMaxDistanceKm(res.data.maxDistanceKm || DEFAULT_RADIUS_KM);
        setLocationError(null);
      } else {
        setNearbyMode(false);
      }

      const shopData = res.data.shops || [];
      setShops(shopData);
      setFilteredShops(shopData);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError("Failed to load shops");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadShops(null);
      setLoading(false);
    };
    init();
  }, [loadShops]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = shops.filter(
        (shop) =>
          (shop.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shop.category || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (shop.address || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (shop.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

      setFilteredShops(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, shops]);

  const showAllShops = async () => {
    setNearbyLoading(true);
    setLocationError(null);
    await loadShops(null);
    setNearbyLoading(false);
  };

  const showNearbyShops = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported in this browser. Showing all shops."
      );
      return;
    }

    setNearbyLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await loadShops({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setNearbyLoading(false);
      },
      () => {
        setLocationError(
          "Location permission denied. Allow location access to see nearby shops."
        );
        setNearbyLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-lg text-gray-600">Loading shops...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Local Shops Near You
          </h1>

          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Support nearby businesses and order products easily from trusted
            local merchants.
          </p>

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

      <section className="max-w-6xl mx-auto px-6 py-12">
        {locationError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm text-amber-900">{locationError}</p>
          </div>
        )}

        {nearbyMode && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-green-900">
              Showing shops within {maxDistanceKm} km · sorted by distance
            </p>
            <button
              type="button"
              onClick={showAllShops}
              disabled={nearbyLoading}
              className="text-sm font-medium px-4 py-2 rounded-xl bg-white border border-green-200 text-green-800 hover:bg-green-100 disabled:opacity-50"
            >
              Show all shops
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {nearbyMode ? "Nearby Shops" : "Available Shops"}
            </h2>
            <p className="text-gray-600 mt-1">
              {nearbyMode
                ? "Closest open shops with a map pin set"
                : "Browse and explore local businesses"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredShops.length} shop
              {filteredShops.length !== 1 ? "s" : ""} found
            </span>

            {!nearbyMode && (
              <button
                type="button"
                onClick={showNearbyShops}
                disabled={nearbyLoading}
                className="text-sm font-medium px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {nearbyLoading ? "Finding nearby..." : "Show nearby shops"}
              </button>
            )}
          </div>
        </div>

        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No shops found
            </h3>
            <p className="text-gray-500 mb-4">
              {nearbyMode
                ? "No pinned shops within range. Try showing all shops, or ask merchants to set a map pin."
                : "Try searching with a different keyword."}
            </p>
            {nearbyMode && (
              <button
                type="button"
                onClick={showAllShops}
                disabled={nearbyLoading}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
              >
                Show all shops
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ShopCard from "../../components/ShopCard";
import FavouriteButton from "../../components/FavouriteButton";
import { useFavourites } from "../../hooks/useFavourites";

function Favourites() {
  const navigate = useNavigate();
  const { refreshFavourites, isFavourited } = useFavourites();
  const [tab, setTab] = useState("shops");
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/favourites/my");
        setShops(res.data.shops || []);
        setProducts(res.data.products || []);
        await refreshFavourites();
      } catch (err) {
        console.error("Error fetching favourites:", err);
        setError(err.response?.data?.message || "Failed to load favourites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [refreshFavourites]);

  const visibleShops = shops.filter((shop) => isFavourited("shop", shop._id));
  const visibleProducts = products.filter((product) =>
    isFavourited("product", product._id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading favourites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Favourites</h1>
          <p className="text-gray-500 mt-1">
            Shops and products you saved for later
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setTab("shops")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === "shops"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Shops ({visibleShops.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === "products"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Products ({visibleProducts.length})
          </button>
        </div>

        {tab === "shops" && (
          <>
            {visibleShops.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <p className="text-gray-600 mb-4">No favourite shops yet.</p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  Browse shops
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleShops.map((shop) => (
                  <ShopCard key={shop._id} shop={shop} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "products" && (
          <>
            {visibleProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <p className="text-gray-600 mb-4">No favourite products yet.</p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  Browse shops
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 overflow-hidden relative"
                  >
                    <div className="relative h-48 w-full bg-gray-200">
                      <img
                        src={
                          product.thumbnail ||
                          product.images?.[0] ||
                          "https://via.placeholder.com/300?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <FavouriteButton
                        type="product"
                        itemId={product._id}
                        className="absolute top-3 right-3 z-10"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {product.name}
                      </h3>
                      {product.shopName && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/shops/${product.shopId}`)
                          }
                          className="text-sm text-green-700 hover:underline mb-2"
                        >
                          {product.shopName}
                        </button>
                      )}
                      <p className="text-2xl font-bold text-green-600 mb-3">
                        ₹{product.price || 0}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/shops/${product.shopId}`)}
                        className="w-full py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
                      >
                        View in shop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Favourites;

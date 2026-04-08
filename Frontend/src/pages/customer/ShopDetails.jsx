import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function ShopDetails() {
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const shopRes = await api.get(`/shops/${shopId}`);
        const productRes = await api.get(`/shops/${shopId}/products`);

        setShop(shopRes.data.shop || shopRes.data);
        setProducts(productRes.data.products || []);
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return <div className="p-6 text-lg">Loading shop details...</div>;
  }

  if (!shop) {
    return <div className="p-6 text-lg">Shop not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">{shop.name || "Shop"}</h1>
          <p className="text-green-100 text-lg">
            {shop.address || "No address available"}
          </p>
          <span className="inline-block mt-4 px-4 py-2 rounded-full bg-white text-green-700 font-medium">
            {shop.category || "General"}
          </span>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Available Products
        </h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No products available
            </h3>
            <p className="text-gray-500">
              This shop has not added any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Product Top */}
                <div className="h-28 bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {(product.name || "P").charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name || "Unnamed Product"}
                  </h3>

                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ₹{product.price || 0}
                  </p>

                  <p className="text-gray-500 text-sm mb-2">
                    Stock: {product.stock ?? 0}
                  </p>

                  <p className="text-sm inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                    {product.category || "General"}
                  </p>

                  <button className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShopDetails;
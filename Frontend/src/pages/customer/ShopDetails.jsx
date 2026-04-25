import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useCart } from "../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");

let user = null;

if (token) {
  try {
    user = jwtDecode(token);
  } catch (err) {
    console.error("Invalid token", err);
  }
}

const isMerchant = user?.role === "merchant";

function ShopDetails() {
  const { shopId } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
      <section className="bg-white shadow">
        {/* Banner */}
        <div className="h-48 bg-gray-200">
          <img
            src={
              shop.banner ||
              "https://via.placeholder.com/800x200?text=Shop+Banner"
            }
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shop Info */}
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 🔥 LEFT SIDE (Shop Info) */}
          <div className="md:col-span-2">
            {/* Top Info */}
            <div className="flex items-center gap-4">
              <img
                src={shop.logo || "https://via.placeholder.com/80?text=Logo"}
                className="w-20 h-20 rounded-full object-cover border"
              />

              <div>
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                <p className="text-gray-500">{shop.address}</p>

                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {shop.category}
                </span>
              </div>
            </div>

            {/* 🔥 Description */}
            {shop.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">
                {shop.description}
              </p>
            )}
          </div>

          {/* 🔥 RIGHT SIDE (Owner Card) */}
          <div className="bg-white rounded-2xl shadow p-5 h-fit">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Owner Details
            </h3>

            <p className="text-gray-700 font-medium">
              {shop.owner?.name || "Owner"}
            </p>

            <p className="text-sm text-gray-500 mt-1">{shop.whatsappNumber}</p>

            <p
              className={`text-sm mt-2 ${
                shop.isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {shop.isOpen ? "Open Now" : "Closed"}
            </p>

            {/* WhatsApp Button */}
            {shop.whatsappNumber && (
              <a
                href={`https://wa.me/${shop.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="block mt-4 text-center bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
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
                <div className="h-48 bg-gray-200">
                  <img
                    src={
                      product.thumbnail ||
                      product.images?.[0] ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name || "Unnamed Product"}
                  </h3>

                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ₹{product.price || 0}
                  </p>

                  <p
                    className={`text-sm font-semibold mb-2 ${(product.stock ?? 0) > 0 ? "text-gray-600" : "text-red-600"}`}
                  >
                    Stock: {product.stock ?? 0}
                  </p>

                  <p className="text-sm inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                    {product.category || "General"}
                  </p>

                  <button
                    disabled={(product.stock ?? 0) === 0}
                    className={`w-full py-2.5 rounded-xl transition font-medium ${
                      (product.stock ?? 0) === 0
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={() => {
                      if (isMerchant) {
                        alert("Merchants cannot add products to cart");
                        return;
                      }
                      const result = addToCart({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        stock: product.stock,
                        quantity: 1,
                      });

                        if (result?.requiresAuth) {
                          alert("Please register or login first");
                          navigate("/register"); // 🔥 redirect here
                          return;
                        }

                        if (!result.success) {
                          alert(`✗ ${result.message}`);
                          return;
                        }

                        alert(`✓ ${result.message}`);
                      
                    }}
                  >
                    {(product.stock ?? 0) === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
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

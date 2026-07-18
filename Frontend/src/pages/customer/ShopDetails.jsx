import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useCart } from "../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Select from "../../components/Select";

const LIMIT = 12;

function ShopDetails() {
  const { shopId } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let isMerchant = false;

  if (token) {
    try {
      const user = jwtDecode(token);
      isMerchant = user?.role === "merchant";
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addMoreFor, setAddMoreFor] = useState(null);
  const [addMoreQty, setAddMoreQty] = useState(1);
  const [modalAskMore, setModalAskMore] = useState(false);
  const [modalMoreQty, setModalMoreQty] = useState(1);
  const [notifyIds, setNotifyIds] = useState([]);
  const [notifyingId, setNotifyingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopRes = await api.get(`/shops/${shopId}`);
        setShop(shopRes.data.shop || shopRes.data);

        const categoryRes = await api.get(
          `/shops/${shopId}/products?limit=100`
        );
        const uniqueCategories = [
          ...new Set(
            (categoryRes.data.products || [])
              .map((p) => p.category)
              .filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);

        const authToken = localStorage.getItem("token");
        if (authToken) {
          try {
            const decoded = jwtDecode(authToken);
            if (decoded?.role !== "merchant") {
              const alertsRes = await api.get(
                `/stock-alerts/my?shopId=${shopId}`
              );
              setNotifyIds(alertsRes.data.productIds || []);
            }
          } catch (err) {
            console.error("Error fetching stock alerts:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(LIMIT),
        });

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        if (inStock) params.set("inStock", "true");

        const productRes = await api.get(
          `/shops/${shopId}/products?${params.toString()}`
        );

        setProducts(productRes.data.products || []);
        setTotalPages(productRes.data.totalPages || 1);
        setTotalProducts(productRes.data.totalProducts || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, debouncedSearch, category, sort, inStock, page]);

  useEffect(() => {
    if (!selectedProduct) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") closeProductModal();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  const getProductImages = (product) => {
    if (product?.images?.length > 0) return product.images;
    if (product?.thumbnail) return [product.thumbnail];
    return ["https://via.placeholder.com/600?text=No+Image"];
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImage(0);
    setModalAskMore(false);
    setModalMoreQty(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setActiveImage(0);
    setModalAskMore(false);
    setModalMoreQty(1);
  };

  const handleAddToCart = (product, qty = 1) => {
    if (isMerchant) {
      toast.error("Merchants cannot add products to cart");
      return false;
    }

    const result = addToCart({
      id: product._id,
      shopId,
      shopName: shop.name,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      quantity: qty,
    });

    if (result?.requiresAuth) {
      toast.error("Please register or login first");
      navigate("/register");
      return false;
    }

    if (!result.success) {
      toast.error(result.message);
      return false;
    }

    toast.success(result.message);
    return true;
  };

  const handleNotifyMe = async (product) => {
    if (!token) {
      toast.error("Please login to get stock alerts");
      navigate("/login");
      return;
    }

    if (isMerchant) {
      toast.error("Merchants cannot subscribe to stock alerts");
      return;
    }

    setNotifyingId(product._id);
    try {
      await api.post(`/stock-alerts/products/${product._id}`);
      setNotifyIds((prev) =>
        prev.includes(product._id) ? prev : [...prev, product._id]
      );
      toast.success("We'll email you when this is back in stock");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setNotifyingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategory("");
    setSort("newest");
    setInStock(false);
    setPage(1);
    setAddMoreFor(null);
    setAddMoreQty(1);
  };

  const startAddMore = (productId) => {
    setAddMoreFor(productId);
    setAddMoreQty(1);
  };

  const cancelAddMore = () => {
    setAddMoreFor(null);
    setAddMoreQty(1);
  };

  if (loading) {
    return <div className="p-6 text-lg">Loading shop details...</div>;
  }

  if (!shop) {
    return <div className="p-6 text-lg">Shop not found</div>;
  }

  const modalImages = selectedProduct ? getProductImages(selectedProduct) : [];
  const hasActiveFilters =
    debouncedSearch || category || inStock || sort !== "newest";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white shadow">
        <div className="h-48 bg-gray-200">
          <img
            src={
              shop.banner ||
              "https://via.placeholder.com/800x200?text=Shop+Banner"
            }
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <img
                src={shop.logo || "https://via.placeholder.com/80?text=Logo"}
                className="w-20 h-20 rounded-full object-cover border"
                alt=""
              />

              <div>
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                <p className="text-gray-500">{shop.address}</p>

                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {shop.category}
                </span>
              </div>
            </div>

            {shop.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">
                {shop.description}
              </p>
            )}
          </div>

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

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Available Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            selectClassName="border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Select
            label="Sort by"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            selectClassName="border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>

          <Select
            label="Availability"
            value={inStock ? "true" : ""}
            onChange={(e) => {
              setInStock(e.target.value === "true");
              setPage(1);
            }}
            selectClassName="border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="">All Products</option>
            <option value="true">In Stock Only</option>
          </Select>
        </div>

        {productsLoading ? (
          <div className="text-center py-16 text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "This shop has not added any products yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const imageCount = product.images?.length || 0;

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => openProductModal(product)}
                      className="relative h-48 w-full bg-gray-200 block cursor-pointer"
                    >
                      <img
                        src={
                          product.thumbnail ||
                          product.images?.[0] ||
                          "https://via.placeholder.com/300?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {imageCount > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                          {imageCount} photos
                        </span>
                      )}
                    </button>

                    <div className="p-5">
                      <button
                        type="button"
                        onClick={() => openProductModal(product)}
                        className="text-left w-full"
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-green-700">
                          {product.name || "Unnamed Product"}
                        </h3>
                      </button>

                      <p className="text-2xl font-bold text-green-600 mb-2">
                        ₹{product.price || 0}
                      </p>

                      <p
                        className={`text-sm font-semibold mb-2 ${
                          (product.stock ?? 0) > 0
                            ? "text-gray-600"
                            : "text-red-600"
                        }`}
                      >
                        Stock: {product.stock ?? 0}
                      </p>

                      <p className="text-sm inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                        {product.category || "General"}
                      </p>

                      {(product.stock ?? 0) === 0 ? (
                        notifyIds.includes(product._id) ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-blue-100 text-blue-700 font-medium cursor-default"
                          >
                            You'll be notified
                          </button>
                        ) : (
                          <button
                            disabled={notifyingId === product._id}
                            onClick={() => handleNotifyMe(product)}
                            className="w-full py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition font-medium disabled:opacity-50"
                          >
                            {notifyingId === product._id
                              ? "Saving..."
                              : "Notify Me"}
                          </button>
                        )
                      ) : addMoreFor === product._id ? (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                          <p className="text-sm font-medium text-green-800 mb-3">
                            Added! Want to add more?
                          </p>
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <button
                              type="button"
                              onClick={() =>
                                setAddMoreQty((q) => Math.max(1, q - 1))
                              }
                              className="bg-white border hover:bg-gray-100 text-gray-800 w-8 h-8 rounded-lg flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="text-base font-semibold text-gray-800 w-6 text-center">
                              {addMoreQty}
                            </span>
                            <button
                              type="button"
                              disabled={addMoreQty >= (product.stock ?? 0)}
                              onClick={() =>
                                setAddMoreQty((q) =>
                                  Math.min(product.stock ?? 0, q + 1)
                                )
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                addMoreQty >= (product.stock ?? 0)
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-white hover:bg-gray-100 text-gray-800"
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const added = handleAddToCart(
                                  product,
                                  addMoreQty
                                );
                                if (added) setAddMoreQty(1);
                              }}
                              className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                            >
                              Add more
                            </button>
                            <button
                              type="button"
                              onClick={cancelAddMore}
                              className="flex-1 py-2 rounded-lg bg-white border text-gray-700 text-sm font-medium hover:bg-gray-50"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="w-full py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
                          onClick={() => {
                            const added = handleAddToCart(product, 1);
                            if (added) startAddMore(product._id);
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    page <= 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border shadow hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    page >= totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border shadow hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeProductModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProduct.name}
              </h2>
              <button
                onClick={closeProductModal}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={modalImages[activeImage]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {modalImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {modalImages.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                          activeImage === index
                            ? "border-green-600"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-3xl font-bold text-green-600 mb-3">
                  ₹{selectedProduct.price || 0}
                </p>

                <p
                  className={`text-sm font-semibold mb-2 ${
                    (selectedProduct.stock ?? 0) > 0
                      ? "text-gray-600"
                      : "text-red-600"
                  }`}
                >
                  Stock: {selectedProduct.stock ?? 0}
                </p>

                <span className="text-sm inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                  {selectedProduct.category || "General"}
                </span>

                {selectedProduct.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {selectedProduct.description}
                  </p>
                )}

                {(selectedProduct.stock ?? 0) === 0 ? (
                  notifyIds.includes(selectedProduct._id) ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-blue-100 text-blue-700 font-medium cursor-default"
                    >
                      You'll be notified when back in stock
                    </button>
                  ) : (
                    <button
                      disabled={notifyingId === selectedProduct._id}
                      onClick={() => handleNotifyMe(selectedProduct)}
                      className="w-full py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition font-medium disabled:opacity-50"
                    >
                      {notifyingId === selectedProduct._id
                        ? "Saving..."
                        : "Notify Me When Available"}
                    </button>
                  )
                ) : modalAskMore ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800 mb-4">
                      Added to cart! Want to add more?
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setModalMoreQty((q) => Math.max(1, q - 1))
                        }
                        className="bg-white border hover:bg-gray-100 text-gray-800 w-8 h-8 rounded-lg flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold text-gray-800 w-8 text-center">
                        {modalMoreQty}
                      </span>
                      <button
                        type="button"
                        disabled={
                          modalMoreQty >= (selectedProduct.stock ?? 0)
                        }
                        onClick={() =>
                          setModalMoreQty((q) =>
                            Math.min(selectedProduct.stock ?? 0, q + 1)
                          )
                        }
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          modalMoreQty >= (selectedProduct.stock ?? 0)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const added = handleAddToCart(
                            selectedProduct,
                            modalMoreQty
                          );
                          if (added) setModalMoreQty(1);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
                      >
                        Add more
                      </button>
                      <button
                        type="button"
                        onClick={closeProductModal}
                        className="flex-1 py-2.5 rounded-xl bg-white border text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
                    onClick={() => {
                      const added = handleAddToCart(selectedProduct, 1);
                      if (added) {
                        setModalAskMore(true);
                        setModalMoreQty(1);
                      }
                    }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopDetails;

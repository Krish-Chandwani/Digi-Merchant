import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  category: "",
  description: "",
};

function ManageProducts() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    const productsRes = await api.get(`/shops/${shopId}/products?limit=100`);
    setProducts(productsRes.data.products || []);
  };

  const fetchData = async () => {
    try {
      const shopRes = await api.get(`/shops/${shopId}`);
      setShop(shopRes.data.shop);
      await fetchProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [shopId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (files) => {
    const fileList = Array.from(files).slice(0, 5);
    setImages(fileList);
    setImagePreviews(fileList.map((file) => URL.createObjectURL(file)));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setImagePreviews([]);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category: product.category || "",
      description: product.description || "",
    });
    setImages([]);
    setImagePreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      if (form.description) formData.append("description", form.description);

      images.forEach((file) => formData.append("images", file));

      if (editingId) {
        await api.patch(`/shops/${shopId}/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      } else {
        await api.post(`/shops/${shopId}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/shops/${shopId}/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      if (editingId === productId) resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) {
    return <div className="p-6 text-lg">Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/merchant/manage-shops")}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              ← Back to My Shops
            </button>
            <h1 className="text-3xl font-bold">
              {shop?.name || "Shop"} — Products
            </h1>
          </div>
        </div>

        {/* Add / Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              className="w-full p-3 border rounded-lg"
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              className="w-full p-3 border rounded-lg"
              onChange={handleChange}
              required
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price (₹)"
              value={form.price}
              className="w-full p-3 border rounded-lg"
              onChange={handleChange}
              required
            />

            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              className="w-full p-3 border rounded-lg"
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            className="w-full mt-4 p-3 border rounded-lg"
            onChange={handleChange}
          />

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Product Images (max 5)
            </p>
            <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition">
              {imagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {imagePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Click to upload images</p>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files)}
              />
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded-lg text-white ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Products List */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Your Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-gray-600">No products yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >
                <div className="h-40 bg-gray-200">
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

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-green-600 font-bold mt-1">
                    ₹{product.price}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Stock: {product.stock}
                  </p>
                  <span className="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {product.category}
                  </span>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProducts;

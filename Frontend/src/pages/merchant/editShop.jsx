import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

function EditShop() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    whatsappNumber: "",
    category: "",
    description: "",
    isOpen: true,
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 Fetch existing shop data
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get(`/shops/${shopId}`);
        const shop = res.data.shop;

        setForm({
          name: shop.name || "",
          address: shop.address || "",
          whatsappNumber: shop.whatsappNumber || "",
          category: shop.category || "",
          description: shop.description || "",
          isOpen: shop.isOpen !== false,
        });

        setLogoPreview(shop.logo);
        setBannerPreview(shop.banner);

      } catch (err) {
        console.error(err);
      }
    };

    fetchShop();
  }, [shopId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (file) => {
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (file) => {
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "isOpen") {
          formData.append("isOpen", form.isOpen ? "true" : "false");
        } else {
          formData.append(key, form[key]);
        }
      });

      if (logo) formData.append("logo", logo);
      if (banner) formData.append("banner", banner);

      await api.patch(`/shops/${shopId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Shop updated successfully");
      navigate("/merchant/manage-shops");

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Shop
        </h2>

        <input
          name="name"
          value={form.name}
          placeholder="Shop Name"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="address"
          value={form.address}
          placeholder="Address"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="whatsappNumber"
          value={form.whatsappNumber}
          placeholder="WhatsApp Number"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="category"
          value={form.category}
          placeholder="Category"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <textarea
          name="description"
          value={form.description}
          placeholder="Description"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        {/* Logo */}
        <div className="mb-4">
          <p className="text-sm mb-1">Logo</p>
          <label className="block border-2 border-dashed p-4 text-center rounded-lg cursor-pointer">
            {logoPreview ? (
              <img src={logoPreview} className="w-20 h-20 mx-auto rounded-full" />
            ) : (
              <p>Upload Logo</p>
            )}
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleLogoChange(e.target.files[0])}
            />
          </label>
        </div>

        {/* Banner */}
        <div className="mb-6">
          <p className="text-sm mb-1">Banner</p>
          <label className="block border-2 border-dashed p-4 text-center rounded-lg cursor-pointer">
            {bannerPreview ? (
              <img src={bannerPreview} className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <p>Upload Banner</p>
            )}
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleBannerChange(e.target.files[0])}
            />
          </label>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-800">Shop Status</p>
            <p className="text-xs text-gray-500 mt-1">
              Closed shops are hidden from customers.
            </p>
            <p
              className={`text-xs font-semibold mt-2 ${
                form.isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {form.isOpen ? "Currently Open" : "Currently Closed"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
            className={`relative w-12 h-7 rounded-full transition shrink-0 ${
              form.isOpen ? "bg-green-600" : "bg-gray-300"
            }`}
            aria-label={form.isOpen ? "Close shop" : "Open shop"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition ${
                form.isOpen ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <button
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Updating..." : "Update Shop"}
        </button>
      </form>
    </div>
  );
}

export default EditShop;
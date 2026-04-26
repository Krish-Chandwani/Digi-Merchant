import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

function EditShop() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    whatsappNumber: "",
    category: "",
    description: ""
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
          description: shop.description || ""
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
        formData.append(key, form[key]);
      });

      if (logo) formData.append("logo", logo);
      if (banner) formData.append("banner", banner);

      await api.patch(`/shops/${shopId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Shop updated successfully");
      navigate("/merchant/shops");

    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
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
        <div className="mb-4">
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
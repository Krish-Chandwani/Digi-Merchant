import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function CreateShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    whatsappNumber: "",
    category: "",
    description: "",
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleLogoChange = (file) => {
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (file) => {
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("whatsappNumber", form.whatsappNumber);
      formData.append("category", form.category);
      formData.append("description", form.description);

      if (logo) formData.append("logo", logo);
      if (banner) formData.append("banner", banner);

      await api.post("/shops", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Shop created successfully");
      navigate("/merchant/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating shop");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Shop</h2>

        <input
          name="name"
          placeholder="Shop Name"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
          required
        />

        <input
          name="address"
          placeholder="Address"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
          required
        />

        <input
          name="whatsappNumber"
          placeholder="WhatsApp Number"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        {/* Logo Upload */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Shop Logo</p>

          <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-24 h-24 object-cover rounded-full mx-auto"
              />
            ) : (
              <p className="text-gray-500 text-sm">Click to upload logo</p>
            )}

            <input
              type="file"
              className="hidden"
              onChange={(e) => handleLogoChange(e.target.files[0])}
            />
          </label>
        </div>

        {/* Banner Upload */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Shop Banner</p>

          <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <p className="text-gray-500 text-sm">Click to upload banner</p>
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
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </div>
  );
}

export default CreateShop;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    isMerchant: false
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.isMerchant ? "merchant" : "customer" // 🔥 IMPORTANT
      };

      await api.post("/auth/register", payload);

      alert("Registration successful");
      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        {/* 🔥 Merchant Checkbox */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="isMerchant"
            checked={form.isMerchant}
            onChange={handleChange}
          />
          <label className="text-sm text-gray-700">
            Register as Merchant
          </label>
        </div>

        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
          Register
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already a user?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
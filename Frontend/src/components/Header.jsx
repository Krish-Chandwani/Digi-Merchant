import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useState } from "react";
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

function Header() {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 🔥 Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">DM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Digi-Merchant</h1>
        </Link>

        {/* 🔥 Right Side */}
        <div className="flex items-center gap-4 relative">
          {/* 🔥 Show Cart ONLY for customers */}
          {!isMerchant && (
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* 🔥 Merchant Dashboard */}
          {isMerchant && (
            <button
              onClick={() => navigate("/merchant/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dashboard
            </button>
          )}

          {/* 🔥 User Icon */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
            >
              {isMerchant ? "🧑‍💼" : "👤"}
            </button>

            {/* 🔥 Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded-lg">
                {isMerchant && (
                  <p className="px-4 py-2 text-sm text-blue-600 font-semibold">
                    Merchant
                  </p>
                )}

                {!token ? (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useState,useEffect,useRef } from "react";
import { jwtDecode } from "jwt-decode";
import NotificationBell from "./NotificationBell";
import { disconnectSocket } from "../api/socket";

function Header() {
  
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dropDownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const token = localStorage.getItem("token");

  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
      console.log("Decoded user:", user);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const isMerchant = user?.role === "merchant";

  const handleLogout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    window.dispatchEvent(new Event("auth-change"));
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
          {token && <NotificationBell />}

          {/* Customer: Favourites + Cart */}
          {!isMerchant && (
            <>
              {token && (
                <Link
                  to="/favourites"
                  title="Favourites"
                  aria-label="Favourites"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 flex items-center justify-center transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </Link>
              )}
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
            </>
          )}

          {/* 🔥 Merchant Dashboard */}
          {isMerchant && (
            <button
              onClick={() => navigate("/merchant/manage-shops")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dashboard
            </button>
          )}

          {/* 🔥 User Icon */}
          <div className="relative" ref={dropDownRef}>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex items-center gap-0.5 cursor-pointer rounded-full hover:bg-gray-100 p-0.5 transition"
            >
              <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {isMerchant ? "🧑‍💼" : "👤"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* 🔥 Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow rounded-lg">
                {isMerchant && (
                  <p className="px-4 py-2 text-sm text-blue-600 font-semibold">
                    Merchant
                  </p>
                )}

                {!token ? (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/login");
                      }}
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
                  <>
                    {isMerchant && (
                      <>
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate("/merchant/orders");
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate("/merchant/analytics");
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Analytics
                        </button>
                      </>
                    )}
                    {!isMerchant && (
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate("/my-orders");
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        My Orders
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </>
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

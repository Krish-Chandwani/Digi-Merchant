import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/customer/home";
import ShopDetails from "./pages/customer/ShopDetails";
import Cart from "./pages/customer/Cart";
import Header from "./components/Header";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/merchant/Dashboard";
import CreateShop from "./pages/merchant/createShop";
import ManageShops from "./pages/merchant/manageShop";
import EditShop from "./pages/merchant/editShop";

function App() {
  const location = useLocation();

  // 🔥 Hide header on auth pages
  const hideHeader =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/merchant/dashboard" element={<Dashboard />} />
        <Route path="/merchant/create-shop" element={<CreateShop />} />
        <Route path="/merchant/manage-shops" element={<ManageShops />} />
        <Route path="/merchant/shop/:shopId/edit" element={<EditShop />} />
      </Routes>
    </>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import Home from "./pages/customer/home";
import ShopDetails from "./pages/customer/ShopDetails";
import Cart from "./pages/customer/Cart";
import Header from "./components/Header";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import PrivateRoute from "./components/PrivateRoute";

import Dashboard from "./pages/merchant/Dashboard";

const App = () => {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/merchant/dashboard" element={<Dashboard />} />
      </Routes>

    </>
  );
};

export default App;

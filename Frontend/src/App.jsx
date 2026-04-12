import { Routes, Route } from "react-router-dom";
import Home from "./pages/customer/home";
import ShopDetails from "./pages/customer/ShopDetails";
import Cart from "./pages/customer/Cart";
import Header from "./components/Header";

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route path="/register" element={<h1>Register Page</h1>} />
      </Routes>
    </>
  );
};

export default App;

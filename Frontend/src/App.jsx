import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/customer/home";
import ShopDetails from "./pages/customer/ShopDetails";
import Cart from "./pages/customer/Cart";
import Payment from "./pages/customer/Payment";
import MyOrders from "./pages/customer/MyOrders";
import Favourites from "./pages/customer/Favourites";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/merchant/Dashboard";
import CreateShop from "./pages/merchant/createShop";
import ManageShops from "./pages/merchant/manageShop";
import EditShop from "./pages/merchant/editShop";
import ManageProducts from "./pages/merchant/manageProducts";
import MerchantOrders from "./pages/merchant/merchantOrders";
import MerchantAnalytics from "./pages/merchant/merchantAnalytics";

function App() {
  const location = useLocation();

  const hideHeader =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />

        <Route
          path="/cart"
          element={
            <PrivateRoute role="customer">
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/:paymentId"
          element={
            <PrivateRoute role="customer">
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute role="customer">
              <MyOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <PrivateRoute role="customer">
              <Favourites />
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/merchant/dashboard"
          element={
            <PrivateRoute role="merchant">
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/create-shop"
          element={
            <PrivateRoute role="merchant">
              <CreateShop />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/manage-shops"
          element={
            <PrivateRoute role="merchant">
              <ManageShops />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/shop/:shopId/edit"
          element={
            <PrivateRoute role="merchant">
              <EditShop />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/shop/:shopId/products"
          element={
            <PrivateRoute role="merchant">
              <ManageProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/orders"
          element={
            <PrivateRoute role="merchant">
              <MerchantOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/analytics"
          element={
            <PrivateRoute role="merchant">
              <MerchantAnalytics />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

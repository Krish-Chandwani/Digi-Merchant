import { Routes,Route } from "react-router-dom";
import Home from "./pages/customer/home";
import ShopDetails from "./pages/customer/ShopDetails";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shops/:shopId" element={<ShopDetails />} />
      <Route path="/login" element={<h1>Login Page</h1>} /> 
      <Route path="/register" element={<h1>Register Page</h1>} />
    </Routes>
  )
}

export default App

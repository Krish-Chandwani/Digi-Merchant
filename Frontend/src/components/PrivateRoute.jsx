import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    try {
      const user = jwtDecode(token);
      if (user.role !== role) {
        return <Navigate to={user.role === "merchant" ? "/merchant/manage-shops" : "/"} replace />;
      }
    } catch {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;

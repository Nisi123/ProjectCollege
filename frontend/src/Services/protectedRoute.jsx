import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ element, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to='/login' />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to='/' />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;

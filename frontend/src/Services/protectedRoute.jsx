import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to='/login' />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ProtectedRoute;

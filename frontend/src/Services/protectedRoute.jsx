import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem("token");

  // If there's no token, redirect the user to the login page
  if (!token) {
    return <Navigate to='/login' />;
  }

  return element; // If the user is authenticated, render the page/component
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ProtectedRoute;

import Navbar from "./Navbar";
import Footer from "./Footer";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const Layout = ({ children, username, userId }) => {
  const location = useLocation();

  if (location.pathname === "/signup" || location.pathname === "/login") {
    return <>{children}</>; // Render only the child components
  }
  return (
    <div className='layout'>
      <Navbar
        username={username}
        userId={userId}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  username: PropTypes.string.isRequired, // Expect username as a required string
  userId: PropTypes.string.isRequired, // Expect userId as a required string
};

export default Layout;

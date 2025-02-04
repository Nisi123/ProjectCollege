import Navbar from "./Navbar";
import Footer from "./Footer";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId;

  if (location.pathname === "/signup" || location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className='layout'>
      <Navbar userId={userId} />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

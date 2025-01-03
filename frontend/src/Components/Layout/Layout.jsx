import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PropTypes from "prop-types";

const Layout = ({ children }) => {
  return (
    <div className='layout'>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

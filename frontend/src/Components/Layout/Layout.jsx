import Navbar from "./Navbar";
import Footer from "./Footer";
import PropTypes from "prop-types";

const Layout = ({ children, username, userId }) => {
  return (
    <div className='layout'>
      {/* Pass username and userId to Navbar */}
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

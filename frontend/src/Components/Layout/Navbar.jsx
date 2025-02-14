import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import MainLogo from "../../Media/MainLogo.png";
import { FaRegCircleUser } from "react-icons/fa6";

const Navbar = ({ userId }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className='navbar'>
      <div className='navbarLogo'>
        <Link to='/'>
          <img
            src={MainLogo}
            alt='Logo'
          />
        </Link>
      </div>
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/explore'>Explore</Link>
        </li>
      </ul>
      <div className='navbarImage'>
        <div onClick={handleProfileClick}>
          <FaRegCircleUser />
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Navbar;

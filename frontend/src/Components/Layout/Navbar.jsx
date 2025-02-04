import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MainLogo from "../../Media/MainLogo.png";
import { FaRegCircleUser } from "react-icons/fa6";

const Navbar = ({ userId }) => {
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
        <Link to='/profile'>
          <FaRegCircleUser />
        </Link>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Navbar;

import { Link } from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes for validation
import MainLogo from "../../Media/MainLogo.png";
import User from "../../Media/User.png";

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
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Link to='/explore'>Explore</Link>
        </li>
      </ul>
      <div className='navbarImage'>
        <Link to={`/user/${userId}`}>
          <img
            src={User}
            alt='User'
          />
        </Link>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  username: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired, // Ensure userId is passed as a string and is required
};

export default Navbar;

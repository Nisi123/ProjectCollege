import { Link } from "react-router-dom";
import MainLogo from "../../Media/MainLogo.png";
import User from "../../Media/User.png";

const Navbar = () => {
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
        <img
          src={User}
          alt='User'
        />
      </div>
    </div>
  );
};

export default Navbar;

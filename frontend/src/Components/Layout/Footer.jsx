import Logo from "../../Media/MainLogo.png";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <div className='footer'>
      <div className='footerLogo'>
        <Link>
          <img
            src={Logo}
            alt='Main Logo'
          />
        </Link>
      </div>
      <div className='footerText'>
        <p>
          Whether you are an artist, writer, coder, or photographer, our goal is
          to provide you with a space to share your work, connect with
          like-minded individuals, and grow through collaboration and feedback.
          Join us in celebrating creativity and talent!
        </p>
      </div>
      <div className='footerLinks'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/explore'>Explore</Link>
          </li>
        </ul>
      </div>
      <div className='footerContact'>
        <h2>You Can Also Reach Us On</h2>
        <ul>
          <li>
            <a href='https://www.facebook.com/'>
              <FaFacebook />
            </a>
          </li>
          <li>
            <a href='https://www.instagram.com/'>
              <FaInstagram />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;

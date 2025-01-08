import HeroImage from "./../Media/AbstractHeroBg.png";
import HeroImage1 from "./../Media/HeroImage1.png";
import HeroImage2 from "./../Media/HeroImage2.png";
import HIW1 from "./../Media/HIW1.png";
import HIW2 from "./../Media/HIW2.png";
import HIW3 from "./../Media/HIW3.png";
import { Link } from "react-router-dom";
import UserImage from "./../Media/User.png";

const Home = () => {
  return (
    <>
      <div className='heroSection'>
        <div className='heroSectionContent'>
          <div className='heroSectionImages'>
            <img
              src={HeroImage1}
              alt=''
            />
            <img
              src={HeroImage2}
              alt=''
            />
          </div>
          <div className='gradient'></div>
          <h1>Showcase Your Talent To The World!</h1>
          <p>
            Upload your work, get recognized, and connect with like-minded
            creators.
          </p>
          <div>
            <button>
              <Link to='/'>Sign In</Link>
            </button>
            <button>
              <Link to='/explore'>Explore</Link>
            </button>
          </div>
        </div>
        <div className='heroSectionImage'>
          <img
            src={HeroImage}
            alt=''
          />
        </div>
      </div>
      <div className='featuredSection'>
        <h2>Featured Talents</h2>
        <div className='featuredSectionContent'>
          <div>a</div>
          <div>b</div>
          <div>c</div>
        </div>
      </div>
      <div className='howitworksSection'>
        <h1>How It Works</h1>
        <div>
          <div>
            <h3>1</h3>
            <p>
              Getting started is quick and easy! Create a new account or log in
              to access your personalized profile. Use your email to sign in and
              unlock a world of opportunities to showcase your talent and engage
              with the community.
            </p>
            <img
              src={HIW1}
              alt='HIW1'
            />
          </div>
        </div>
        <div>
          <div>
            <h3>2</h3>
            <p>
              Once you're signed in, it's time to shine! Upload your creations,
              add a title and description, and categorize your work to make it
              easy for others to find and appreciate. Whether it’s art, writing,
              photography, or a project, your talent deserves to be seen.
            </p>
            <img
              src={HIW2}
              alt='HIW2'
            />
          </div>
        </div>
        <div>
          <div>
            <h3>3</h3>
            <p>
              Connect, inspire, and grow! Browse works from other creators,
              leave likes and meaningful comments, and build connections within
              the community. Your feedback can inspire others, and theirs can
              help you grow.
            </p>
            <img
              src={HIW3}
              alt='HIW3'
            />
          </div>
        </div>
      </div>
      <div className='readytoengageSection'>
        <h1>Ready To Engage</h1>
        <button>
          <Link to='/'>Get Started</Link>
        </button>
      </div>
      <div className='communityReview'>
        <h1>Community Review</h1>
        <div className='communityReviewCardBase'>
          <div className='card'>
            <div>
              <h2>User Name</h2>
              <img
                src={UserImage}
                alt='UserImage'
              />
            </div>
            <p>User Review</p>
          </div>
          <div className='card'>
            <div>
              <h2>User Name</h2>
              <img
                src={UserImage}
                alt='UserImage'
              />
            </div>
            <p>User Review</p>
          </div>
          <div className='card'>
            <div>
              <h2>User Name</h2>
              <img
                src={UserImage}
                alt='UserImage'
              />
            </div>
            <p>User Review</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
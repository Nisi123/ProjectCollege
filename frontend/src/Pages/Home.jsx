import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroImage from "./../Media/AbstractHeroBg.png";
import HeroImage1 from "./../Media/HeroImage1.png";
import HeroImage2 from "./../Media/HeroImage2.png";
import HIW1 from "./../Media/HIW1.png";
import HIW2 from "./../Media/HIW2.png";
import HIW3 from "./../Media/HIW3.png";
import { FaHeart } from "react-icons/fa6";

const Home = () => {
  const [topProjects, setTopProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopProjects = async () => {
      try {
        const response = await axios.get("http://localhost:8000/projects/");
        const projects = response.data.projects;

        // Sort projects by like_count in descending order
        const sortedProjects = projects.sort(
          (a, b) => b.like_count - a.like_count
        );

        // Select top 3 most liked projects
        setTopProjects(sortedProjects.slice(0, 3));
      } catch (error) {
        setError("Error fetching projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProjects();
  }, []);

  const getProjectImageUrl = (url) => {
    if (!url) {
      return `http://localhost:8000/uploads/default-project-pic.png`;
    }

    // Handle full URLs that might contain backslashes
    if (url.includes("http://localhost:8000")) {
      // Replace backslashes with forward slashes and ensure proper formatting
      return url
        .replace(/\\/g, "/")
        .replace(
          "http://localhost:8000uploads",
          "http://localhost:8000/uploads"
        );
    }

    // Handle relative paths
    const cleanPath = url.replace(/\\/g, "/"); // Replace any backslashes with forward slashes
    if (cleanPath.startsWith("uploads/")) {
      return `http://localhost:8000/${cleanPath}`;
    }

    // If it's just a filename, add the full path
    return `http://localhost:8000/uploads/${cleanPath}`;
  };

  const renderFeaturedProject = (project) => (
    <div
      key={project.id}
      className='projectCard'
    >
      <div className='projectImageContainer'>
        <img
          src={getProjectImageUrl(project.project_pic)}
          alt={project.name}
          className='projectImage'
          onError={(e) => {
            e.target.src = getProjectImageUrl(null);
          }}
          loading='lazy'
        />
      </div>
      <div className='projectInfo'>
        <div className='projectInfoTitleandLike HomeprojectInfoTitleandLike'>
          <h2>{project.name}</h2>
          <div className='HomePageLike'>
            <FaHeart />
            <p>{project.like_count || 0}</p>
          </div>
        </div>
        <p>{project.description}</p>
      </div>
    </div>
  );

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 75 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
          <div className='buttonContainerHeroSection'>
            <button>
              <Link to='/signup'>Sign In</Link>
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

      {/* Featured Section */}
      <div className='featuredSection'>
        <motion.h2
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.5 }} // Only trigger when half the element is in view
          variants={fadeInUp}
        >
          Featured Talents
        </motion.h2>
        <motion.div
          className='projectsContainer'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }} // Trigger when 30% of container is visible
          variants={staggerContainer}
        >
          {topProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={fadeInUp}
            >
              {renderFeaturedProject(project)}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className='howitworksSection'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
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
              Once you&apos;re signed in, it&apos;s time to shine! Upload your
              creations, add a title and description, and categorize your work
              to make it easy for others to find and appreciate. Whether it’s
              art, writing, photography, or a project, your talent deserves to
              be seen.
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
      </motion.div>

      {/* Ready to Engage */}
      <motion.div
        className='readytoengageSection'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeInUp}
      >
        <h1>Ready To Engage</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to='/explore'>Get Started</Link>
        </motion.button>
      </motion.div>

      {/* Community Review */}
      {/* <div className='communityReview'>
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
      </div> */}
    </>
  );
};

export default Home;

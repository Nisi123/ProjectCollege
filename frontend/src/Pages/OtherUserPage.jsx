import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

const OtherUserProfile = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [likedProjects, setLikedProjects] = useState(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { userId } = useParams();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);

    const fetchUserAndProjects = async () => {
      try {
        // First fetch user data
        const userResponse = await axios.get(
          `http://localhost:8000/users/${userId}`
        );
        setUser(userResponse.data);

        // Then fetch user's projects using the new endpoint
        const projectsResponse = await axios.get(
          `http://localhost:8000/projects/by-user/${userId}`
        );

        const projects = projectsResponse.data.projects || [];
        setProjects(projects);
        setFilteredProjects(projects);
        setTotalPages(Math.ceil(projects.length / itemsPerPage));

        // Initialize liked projects
        if (userData?.username) {
          const liked = new Set(
            projects
              .filter((p) => p.liked_by?.includes(userData.username))
              .map((p) => p.id)
          );
          setLikedProjects(liked);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProjects();
  }, [userId, itemsPerPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term.toLowerCase()) ||
        project.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProjects(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getImageUrl = (url) => {
    if (!url || url === "No Profile Pic") {
      return `http://localhost:8000/uploads/default-profile-pic.png`;
    }

    if (url.startsWith("uploads/")) {
      return `http://localhost:8000/${url}`;
    }

    return url;
  };

  const getProjectImageUrl = (url) => {
    if (!url) {
      return `http://localhost:8000/uploads/default-project-pic.png`;
    }

    if (url.startsWith("uploads/")) {
      return `http://localhost:8000/${url}`;
    }

    return url;
  };

  const handleLike = async (projectId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please log in to like projects");
      return;
    }

    try {
      const isLiked = likedProjects.has(projectId);
      const endpoint = isLiked ? "unlike" : "like";

      const response = await axios.post(
        `http://localhost:8000/projects/${projectId}/${endpoint}`,
        { current_user: currentUser.username },
        { headers: { "Content-Type": "application/json" } }
      );

      // Update projects with new like count
      const updatedProjects = filteredProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              like_count: response.data.like_count,
              liked_by: response.data.liked_by,
            }
          : project
      );

      setFilteredProjects(updatedProjects);
      setProjects(updatedProjects);

      // Update liked projects set
      setLikedProjects((prev) => {
        const newLikes = new Set(prev);
        isLiked ? newLikes.delete(projectId) : newLikes.add(projectId);
        return newLikes;
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      const images = [
        selectedProject.project_pic,
        ...(selectedProject.project_images || []),
      ].filter(Boolean);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      const images = [
        selectedProject.project_pic,
        ...(selectedProject.project_images || []),
      ].filter(Boolean);
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0); // Reset to first image when opening new project
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains("modalOverlay")) {
      setSelectedProject(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderProjectModal = () => {
    if (!selectedProject) return null;

    return (
      <div
        className='modalOverlay projectDetailsModalOverlay'
        onClick={handleModalClick}
      >
        <div className='modal projectDetailsModal'>
          <div className='projectDetailsContent'>
            <div className='projectImageSlider'>
              <div className='projectDetailsImage'>
                {(() => {
                  const allImages = [
                    selectedProject.project_pic,
                    ...(selectedProject.project_images || []),
                  ].filter(Boolean);

                  return (
                    <img
                      src={getProjectImageUrl(
                        allImages[currentImageIndex] || null
                      )} // Add || null here
                      alt={selectedProject.name}
                      onError={(e) => {
                        e.target.src = getProjectImageUrl(null);
                      }}
                    />
                  );
                })()}

                {/* Only show navigation if there are multiple images */}
                {(selectedProject.project_images?.length > 0 ||
                  selectedProject.project_pic) && (
                  <>
                    <button
                      className='sliderButton prev'
                      onClick={handlePrevImage}
                    >
                      <IoChevronBack />
                    </button>
                    <button
                      className='sliderButton next'
                      onClick={handleNextImage}
                    >
                      <IoChevronForward />
                    </button>
                    <div className='sliderDots'>
                      {[
                        selectedProject.project_pic,
                        ...(selectedProject.project_images || []),
                      ]
                        .filter(Boolean)
                        .map((_, index) => (
                          <button
                            key={index}
                            className={`dot ${
                              index === currentImageIndex ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                          />
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Rest of the modal content */}
            <div className='projectDetailsHeader'>
              <h2>{selectedProject.name}</h2>
              <div className='likesCount'>
                <FaRegHeart />
                <span>{selectedProject.like_count || 0}</span>
              </div>
            </div>
            <div className='projectDetailsInfo'>
              <p className='projectDescription'>
                {selectedProject.description}
              </p>
              {selectedProject.project_url && (
                <a
                  href={selectedProject.project_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='projectUrl'
                >
                  View Project
                </a>
              )}
            </div>
            <div className='projectReviews'>
              <h3>Reviews</h3>
              <div className='reviewsContainer'>
                {selectedProject.reviews?.length > 0 ? (
                  <div className='reviewsList'>
                    {selectedProject.reviews.map((review, index) => (
                      <div
                        key={index}
                        className='reviewItem'
                      >
                        <p>{review}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='noReviews'>No reviews yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectCard = (project) => {
    return (
      <div
        className='projectCard'
        key={project.id}
        onClick={() => openProjectDetails(project)}
      >
        <div className='projectImageContainer'>
          <img
            src={getProjectImageUrl(project.project_pic)}
            alt={project.name}
            className='projectImage'
            onError={(e) => {
              console.log("Image load error for:", project.project_pic);
              e.target.src = getProjectImageUrl(null);
            }}
            loading='lazy'
          />
        </div>
        <div className='projectInfo'>
          <div className='projectInfoTitleandLike'>
            <h2>{project.name}</h2>
            <div
              className={`likeButton ${
                likedProjects.has(project.id) ? "liked" : ""
              }`}
              onClick={(e) => handleLike(project.id, e)}
            >
              {likedProjects.has(project.id) ? <FaHeart /> : <FaRegHeart />}
              <p>{project.like_count || 0}</p>
            </div>
          </div>
          <p>{project.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className='otheruserpage'>
      <div className='userpageMainHeader'>
        <div className='imageContainer'>
          {imageLoading && <div className='imagePlaceholder'>Loading...</div>}
          <img
            src={getImageUrl(user?.profile_pic)}
            alt='Profile'
            onLoad={() => setImageLoading(false)}
            style={{ display: imageLoading ? "none" : "block" }}
            onError={(e) => {
              setImageLoading(false);
              e.target.src = getImageUrl(null);
            }}
          />
        </div>
        <h1>{user.username}</h1>
        <p>{user.position}</p>
      </div>

      <div className='userpageDescriptionContainer'>
        <div className='userpageDescriptionUserDescription'>
          <p>{user.description}</p>
        </div>
        <div className='userpageDescriptionUserInfo'>
          <p>Email: {user.email}</p>
          <p>DOB: {user.year_of_birth}</p>
          <p>Level: {user.level}</p>
        </div>
      </div>
      <hr />

      <div className='projectsSectionHeader'>
        <h1 className='projectsHeader'>Projects</h1>
      </div>

      {/* Search Bar */}
      <div className='search-bar UserPageSearchBar'>
        <input
          maxLength={20}
          type='text'
          placeholder='Search projects...'
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Projects */}
      <div className='projectsContainer UserPageProjectsContainer'>
        {paginatedProjects.map((project) => renderProjectCard(project))}
      </div>

      {/* Project Details Modal */}
      {selectedProject && renderProjectModal()}

      {/* Pagination */}
      <div className='pagination'>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={page === index + 1 ? "active" : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OtherUserProfile;

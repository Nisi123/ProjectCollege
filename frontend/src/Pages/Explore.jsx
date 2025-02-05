import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { IoClose } from "react-icons/io5"; // Add this import
import { useNavigate } from "react-router-dom";

const Explore = () => {
  const [projects, setProjects] = useState([]); // All projects fetched from the backend
  const [filteredProjects, setFilteredProjects] = useState([]); // Filtered projects after search
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages based on filtered projects
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [filterType, setFilterType] = useState("name"); // Filter type (either 'name' or 'user_associated')
  const [likedProjects, setLikedProjects] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // Add this state
  const [newReview, setNewReview] = useState("");
  const itemsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/projects/", {
          params: {
            skip: 0,
            limit: 1000,
          },
          headers: {
            Accept: "application/json",
          },
        });

        if (response.data?.projects) {
          const projects = response.data.projects;
          setProjects(projects);
          setFilteredProjects(projects);

          // Initialize liked projects
          if (userData?.username) {
            const liked = new Set(
              projects
                .filter((p) => p.liked_by?.includes(userData.username))
                .map((p) => p.id)
            );
            setLikedProjects(liked);
          }

          setTotalPages(Math.ceil(response.data.totalProjects / itemsPerPage));
        }
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on the search term and filter type
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = projects.filter((project) =>
      project[filterType]?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProjects(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getProjectImageUrl = (url) => {
    if (!url) {
      return `http://localhost:8000/uploads/default-project-pic.png?t=${Date.now()}`;
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
        {
          current_user: currentUser.username,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update the projects list with new like count
      const updatedProjects = filteredProjects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            like_count: response.data.like_count,
            liked_by: response.data.liked_by,
          };
        }
        return project;
      });

      setFilteredProjects(updatedProjects);
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                like_count: response.data.like_count,
                liked_by: response.data.liked_by,
              }
            : p
        )
      );

      // Update selectedProject if the liked project is currently selected
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({
          ...selectedProject,
          like_count: response.data.like_count,
          liked_by: response.data.liked_by,
        });
      }

      // Update liked projects set
      setLikedProjects((prev) => {
        const newLikes = new Set(prev);
        if (isLiked) {
          newLikes.delete(projectId);
        } else {
          newLikes.add(projectId);
        }
        return newLikes;
      });
    } catch (error) {
      console.error("Error details:", error.response?.data);
      if (error.response?.status === 400) {
        alert(error.response.data.detail);
      } else {
        console.error("Error toggling like:", error);
      }
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to add a review");
      return;
    }

    if (!newReview.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:8000/projects/${selectedProject.id}/review`,
        {
          review_text: newReview,
          user_name: currentUser.username,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        setSelectedProject(response.data);
        setNewReview("");
      }
    } catch (error) {
      console.error("Error adding review:", error.response?.data || error);
      alert("Failed to add review");
    }
  };

  const handleUserClick = (e, username, userId) => {
    e.stopPropagation();
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    if (username === currentUser.username) {
      navigate("/profile");
    } else {
      navigate(`/user/${userId}`);
    }
  };

  return (
    <div>
      <h1 className='exploreMainTitle'>Explore Projects</h1>

      {/* Search Bar */}
      <div className='search-barContainer'>
        <div className='search-bar'>
          <input
            maxLength={20}
            type='text'
            placeholder='Search with filter'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value='name'>Project Name</option>
            <option value='user_associated'>Username</option>
          </select>
        </div>
      </div>

      {/* Projects */}
      <div className='projectsContainer'>
        {loading ? (
          <p>Loading...</p>
        ) : paginatedProjects.length > 0 ? (
          paginatedProjects.map((project) => (
            <div
              className='projectCard explorePageProjectCard'
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
                    {likedProjects.has(project.id) ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                    <p>{project.like_count || 0}</p>
                  </div>
                </div>
                <p>{project.description}</p>
                <p
                  className='submittedBy'
                  onClick={(e) =>
                    handleUserClick(e, project.user_associated, project.user_id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {project.user_associated}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No projects available.</p>
        )}
      </div>

      {/* Add Project Details Modal */}
      {selectedProject && (
        <div className='modalOverlay projectDetailsModalOverlay'>
          <div className='modal projectDetailsModal'>
            <button
              onClick={() => setSelectedProject(null)}
              className='closeButton'
            >
              <IoClose />
            </button>
            <div className='projectDetailsContent'>
              <div className='projectDetailsImage'>
                <img
                  src={getProjectImageUrl(selectedProject.project_pic)}
                  alt={selectedProject.name}
                  onError={(e) => {
                    e.target.src = getProjectImageUrl(null);
                  }}
                />
              </div>
              <div className='projectDetailsHeader'>
                <h2>{selectedProject.name}</h2>

                <div
                  className={`likesCount ${
                    likedProjects.has(selectedProject.id) ? "liked" : ""
                  }`}
                  onClick={(e) => handleLike(selectedProject.id, e)}
                >
                  {likedProjects.has(selectedProject.id) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                  <span>{selectedProject.like_count || 0}</span>
                </div>
              </div>
              <div className='projectDetailsInfo'>
                <p className='projectDescription'>
                  {selectedProject.description}
                </p>
                <p
                  className='projectUserAssociated'
                  onClick={(e) =>
                    handleUserClick(
                      e,
                      selectedProject.user_associated,
                      selectedProject.user_id
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  {selectedProject.user_associated}
                </p>
                <div>
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
              </div>
              <div className='projectReviews'>
                <h3>Reviews</h3>
                <form
                  onSubmit={handleReviewSubmit}
                  className='reviewForm'
                >
                  <div>
                    <input
                      maxLength={50}
                      type='text'
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder='Add a comment...'
                      required
                    />
                  </div>
                </form>
                <div className='reviewsContainer'>
                  {selectedProject.reviews &&
                  selectedProject.reviews.length > 0 ? (
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
      )}

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

export default Explore;

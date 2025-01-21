import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa6";

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
  const itemsPerPage = 20;

  useEffect(() => {
    // Get current user from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/projects", {
          params: {
            skip: 0, // Always fetch the first page when loading initially
            limit: 1000, // Fetch a larger number of projects (e.g., 1000) to support search and pagination
          },
        });

        console.log("API response:", response.data); // Log the full response

        if (response.data.projects) {
          const projects = response.data.projects;
          setProjects(projects);
          setFilteredProjects(projects); // Initially, set filtered projects as all fetched projects

          // Initialize liked projects based on liked_by arrays
          const liked = new Set(
            projects
              .filter((p) => p.liked_by?.includes(userData?.username))
              .map((p) => p.id)
          );
          setLikedProjects(liked);

          setTotalPages(
            Math.ceil(response.data.projects.length / itemsPerPage)
          ); // Calculate total pages based on fetched data
        } else {
          console.error("Unexpected API response:", response.data);
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // Run once when the component mounts

  // Filter projects based on the search term and filter type
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = projects.filter((project) =>
      project[filterType]?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProjects(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages after filtering
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Paginate the filtered projects (take only the items for the current page)
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

  return (
    <div>
      <h1 className='exploreMainTitle'>Explore Projects</h1>

      {/* Search Bar */}
      <div className='search-barContainer'>
        <div className='search-bar'>
          <input
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
                <p className='submittedBy'>{project.user_associated}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No projects available.</p>
        )}
      </div>

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

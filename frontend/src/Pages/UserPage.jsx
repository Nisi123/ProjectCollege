import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdSettings } from "react-icons/io";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term for projects
  const [page, setPage] = useState(1); // Current page for projects
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
  const [itemsPerPage] = useState(10); // Number of projects per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    time_submitted: new Date().toISOString(),
    reviews: [],
    project_url: "",
    project_pic: null,
  });
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }

    fetchUserData();
  }, [navigate, itemsPerPage]);

  const fetchUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(
        `http://localhost:8000/users/${userData.userId}`
      );
      console.log("User data received:", response.data);
      setUser(response.data);
      setFilteredProjects(response.data.projects || []);
      setTotalPages(
        Math.ceil((response.data.projects?.length || 0) / itemsPerPage)
      );
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("User not found or error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear user info and token from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login page
  };

  const handleSearch = (term) => {
    if (!user || !user.projects) return; // Ensure user data exists
    setSearchTerm(term);
    const filtered = user.projects.filter((project) => {
      const name = project.name || ""; // Default to empty string if undefined
      const description = project.description || ""; // Default to empty string if undefined
      return (
        name.toLowerCase().includes(term.toLowerCase()) ||
        description.toLowerCase().includes(term.toLowerCase())
      );
    });
    setFilteredProjects(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to the first page on search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newProject.name);
      formData.append("description", newProject.description);
      formData.append("user_associated", user.username);

      if (newProject.project_url) {
        formData.append("project_url", newProject.project_url);
      }

      if (newProject.project_pic) {
        formData.append("project_pic", newProject.project_pic);
      }

      await axios.post("http://localhost:8000/projects/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh the projects list
      await fetchUserData();

      setProjectModalOpen(false);
      setNewProject({
        name: "",
        description: "",
        time_submitted: new Date().toISOString(),
        reviews: [],
        project_url: "",
        project_pic: null,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Paginate the filtered projects
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  console.log(user);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  // const navigator = (path) => {
  //   console.log(`Navigate to ${path}`);
  //   closeModal(); // Close the modal after navigation
  // };
  // const loggingout = () => {
  //   console.log("Logging out...");
  //   closeModal(); // Close the modal after logging out
  // };

  // Update the image URL helper functions
  const getImageUrl = (url) => {
    if (!url || url === "No Profile Pic") {
      return `http://localhost:8000/uploads/default-profile-pic.png?t=${Date.now()}`;
    }

    // Add cache-busting timestamp
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?t=${Date.now()}`;
  };

  const getProjectImageUrl = (url) => {
    if (!url) {
      return `http://localhost:8000/uploads/default-project-pic.png?t=${Date.now()}`;
    }

    // Log the URL for debugging
    console.log("Original project image URL:", url);

    // Always add a timestamp to prevent caching
    const timestamp = Date.now();
    const baseUrl = url.split("?")[0];
    const finalUrl = `${baseUrl}?t=${timestamp}`;

    console.log("Final project image URL:", finalUrl);
    return finalUrl;
  };

  // Add image loading handler
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Update the project card rendering
  const renderProjectCard = (project) => {
    console.log("Rendering project:", project);
    return (
      <div
        className='projectCard'
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
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          {project.project_url && (
            <a
              href={project.project_url}
              target='_blank'
              rel='noopener noreferrer'
            >
              View Project
            </a>
          )}
          <p>Likes: {project.like_count || 0}</p>
        </div>
      </div>
    );
  };

  return (
    <div className='userpage'>
      <div>
        <IoMdSettings
          className='settingsButton'
          onClick={openModal}
        />

        {isModalOpen && (
          <div className='modalOverlay'>
            <div className='modal'>
              <h2>Settings</h2>
              <button onClick={() => navigate("/complete-profile")}>
                Edit
              </button>
              <button onClick={logout}>Logout</button>
              <button
                onClick={closeModal}
                className='closeButton'
              >
                Close
              </button>
            </div>
          </div>
        )}

        <button
          className='addProjectButton'
          onClick={() => setProjectModalOpen(true)}
        >
          Add Project
        </button>

        {/* Project Creation Modal */}
        {isProjectModalOpen && (
          <div className='modalOverlay'>
            <div className='modal'>
              <h2>Create New Project</h2>
              <form onSubmit={handleProjectSubmit}>
                <input
                  type='text'
                  placeholder='Project Name'
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder='Project Description'
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type='url'
                  placeholder='Project URL (optional)'
                  value={newProject.project_url || ""}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      project_url: e.target.value,
                    })
                  }
                />
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      project_pic: e.target.files[0],
                    })
                  }
                />
                <button type='submit'>Create Project</button>
                <button
                  type='button'
                  onClick={() => setProjectModalOpen(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className='userpageMainHeader'>
        <div className='imageContainer'>
          {imageLoading && <div className='imagePlaceholder'>Loading...</div>}
          <img
            src={getImageUrl(user?.profile_pic)}
            alt='Profile'
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? "none" : "block" }}
            onError={(e) => {
              console.log("Profile image load error:", user?.profile_pic);
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
      <h1 className='projectsHeader'>Projects</h1>

      {/* Search Bar */}
      <div className='search-bar UserPageSearchBar'>
        <input
          type='text'
          placeholder='Search projects...'
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Projects */}
      <div className='projectsContainer UserPageProjectsContainer'>
        {paginatedProjects.length > 0 ? (
          paginatedProjects.map((project) => renderProjectCard(project))
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

export default UserProfile;

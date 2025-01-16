import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login"); // Redirect to login if no user data is found
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${userData.userId}`
        );
        setUser(response.data); // Set the user info
        setFilteredProjects(response.data.projects); // Initialize filtered projects
        setTotalPages(Math.ceil(response.data.projects.length / itemsPerPage)); // Calculate total pages
      } catch (err) {
        setError("User not found or error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, itemsPerPage]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Paginate the filtered projects
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  console.log(user);

  return (
    <div className='userpage'>
      <div className='userpageMainHeader'>
        <img src={user.profile_pic} />
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
          paginatedProjects.map((project) => (
            <div
              className='projectCard'
              key={project.id}
            >
              <img
                src={project.project_pic}
                alt={project.name}
                className='projectImage'
              />
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <p>Likes: {project.like_count || 0}</p>
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

      <button onClick={logout}>Logout</button>
      <button onClick={() => navigate("/complete-profile")}>
        Complete Your Profile
      </button>
    </div>
  );
};

export default UserProfile;

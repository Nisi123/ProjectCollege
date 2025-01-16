import { useEffect, useState } from "react";
import axios from "axios";

const Explore = () => {
  const [projects, setProjects] = useState([]); // All projects fetched from the backend
  const [filteredProjects, setFilteredProjects] = useState([]); // Filtered projects after search
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages based on filtered projects
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [filterType, setFilterType] = useState("name"); // Filter type (either 'name' or 'user_associated')
  const itemsPerPage = 20;

  useEffect(() => {
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
          setProjects(response.data.projects);
          setFilteredProjects(response.data.projects); // Initially, set filtered projects as all fetched projects
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
            onChange={(e) => handleSearch(e.target.value)} // Call handleSearch on input change
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
              className='projectCard'
              key={project.id}
            >
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <p>{project.user_associated}</p>
              <p>Likes: {project.like_count}</p>
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
        {/* Dynamic pagination buttons */}
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

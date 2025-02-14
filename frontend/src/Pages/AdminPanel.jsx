import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaProjectDiagram,
  FaChartBar,
  FaSearch,
  FaUserPlus,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({ users: [], projects: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    projectsThisMonth: 0,
    popularProjects: [],
  });

  // Add state for user editing
  const [editingUser, setEditingUser] = useState({
    description: "",
    position: "",
    level: "",
    year_of_birth: 0,
  });

  // Add new state for likes data
  const [projectLikes, setProjectLikes] = useState({});

  // Add stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Add API base URL
        const baseURL = "http://127.0.0.1:8000";

        console.log("Fetching admin data..."); // Debug log

        // Try users first
        const usersResponse = await axios.get(`${baseURL}/users/admin/users`, {
          headers,
        });
        console.log("Users response:", usersResponse.data); // Debug log
        if (Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        }

        // Then try projects
        const projectsResponse = await axios.get(
          `${baseURL}/users/admin/projects`,
          { headers }
        );
        console.log("Projects response:", projectsResponse.data); // Debug log
        if (Array.isArray(projectsResponse.data)) {
          setProjects(projectsResponse.data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(
          `Failed to fetch data: ${err.response?.status} ${err.message}`
        );
        setLoading(false);
      }
    };

    fetchData();

    // Add likes fetching
    const fetchLikes = async () => {
      try {
        const likesResponse = await axios.get(`${baseURL}/projects/likes`, {
          headers,
        });
        setProjectLikes(likesResponse.data);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };

    fetchLikes();
  }, [navigate]);

  useEffect(() => {
    // Calculate stats
    const calculateStats = () => {
      const totalUsers = users.length;
      const totalProjects = projects.length;
      setStats({ totalUsers, totalProjects });
    };

    calculateStats();
  }, [users, projects]);

  // Add search functionality
  useEffect(() => {
    if (searchQuery) {
      const filteredUsers = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredProjects = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.owner_username
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );

      setFilteredData({ users: filteredUsers, projects: filteredProjects });
    } else {
      setFilteredData({ users: users, projects: projects });
    }
  }, [searchQuery, users, projects]);

  // Add analytics calculations
  useEffect(() => {
    // Calculate projects this month
    const currentMonth = new Date().getMonth();
    const projectsThisMonth = projects.filter((project) => {
      const projectDate = new Date(project.time_submitted);
      return projectDate.getMonth() === currentMonth;
    }).length;

    // Get popular projects (most liked)
    const popularProjects = [...projects]
      .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, 3);

    setAnalyticsData({
      projectsThisMonth,
      popularProjects,
    });
  }, [users, projects]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(projects.filter((project) => project.id !== projectId));
      } catch (err) {
        setError("Failed to delete project");
      }
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/users/admin/update/${userId}`,
        editingUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, ...response.data } : user
        )
      );
      setSelectedUser(null);
    } catch (err) {
      setError("Failed to update user");
    }
  };

  const handleDeleteComment = async (projectId, commentIndex) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://127.0.0.1:8000/projects/${projectId}/comments/${commentIndex}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update the local state to remove the deleted comment
        setProjects(
          projects.map((project) => {
            if (project.id === projectId) {
              const updatedReviews = [...project.reviews];
              updatedReviews.splice(commentIndex, 1);
              return { ...project, reviews: updatedReviews };
            }
            return project;
          })
        );
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError("Failed to delete comment");
      }
    }
  };

  const renderTabs = () => (
    <div className='admin-tabs'>
      <button
        className={activeTab === "dashboard" ? "active" : ""}
        onClick={() => setActiveTab("dashboard")}
      >
        <FaChartBar /> Dashboard
      </button>
      <button
        className={activeTab === "users" ? "active" : ""}
        onClick={() => setActiveTab("users")}
      >
        Users
      </button>
      <button
        className={activeTab === "projects" ? "active" : ""}
        onClick={() => setActiveTab("projects")}
      >
        Projects
      </button>
      <button
        className={activeTab === "comments" ? "active" : ""}
        onClick={() => setActiveTab("comments")}
      >
        Comments
      </button>
    </div>
  );

  const renderDashboard = () => (
    <section className='dashboard-section'>
      <div className='dashboard-header'>
        <div className='search-bar'>
          <FaSearch />
          <input
            type='text'
            placeholder='Search users, projects...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {searchQuery && (
        <div className='search-results'>
          <h3>Search Results</h3>
          <div className='results-grid'>
            <div className='users-results'>
              <h4>Users ({filteredData.users.length})</h4>
              {filteredData.users.map((user) => (
                <div
                  key={user.id}
                  className='result-item'
                >
                  {user.username} - {user.email}
                </div>
              ))}
            </div>
            <div className='projects-results'>
              <h4>Projects ({filteredData.projects.length})</h4>
              {filteredData.projects.map((project) => (
                <div
                  key={project.id}
                  className='result-item'
                >
                  {project.name} by {project.owner_username}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className='stats-grid'>
        <div className='stat-card'>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className='stat-card'>
          <h3>Total Projects</h3>
          <p>{stats.totalProjects}</p>
        </div>
        <div className='stat-card'>
          <h3>Projects This Month</h3>
          <p>{analyticsData.projectsThisMonth}</p>
        </div>
      </div>

      <div className='dashboard-grid'>
        <div className='popular-projects'>
          <h3>Most Popular Projects</h3>
          {analyticsData.popularProjects.map((project) => (
            <div
              key={project.id}
              className='popular-project-item'
            >
              <h4>{project.name}</h4>
              <p>{project.like_count || 0} likes</p>
              <small>by {project.owner_username}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return (
          <section className='users-section'>
            <h2>Users Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.isAdmin ? "Admin" : "User"}</td>
                    <td className='action-buttons'>
                      <button
                        className='edit-btn'
                        onClick={() => setSelectedUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className='delete-btn'
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case "projects":
        return (
          <section className='projects-section'>
            <h2>Projects Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Owner</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.owner_username}</td>
                    <td className='likes-cell'>
                      <div className='likes-info'>
                        <span>{project.like_count || 0}</span>
                        {project.liked_by && project.liked_by.length > 0 && (
                          <div className='likes-tooltip'>
                            <strong>Liked by:</strong>
                            <ul>
                              {project.liked_by.map((user, idx) => (
                                <li key={idx}>{user}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {project.reviews && project.reviews.length > 0 ? (
                        <div className='comments-preview'>
                          {project.reviews.length} comments
                          <div className='comments-tooltip'>
                            {project.reviews.map((review, idx) => (
                              <p key={idx}>{review}</p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        "No comments"
                      )}
                    </td>
                    <td className='action-buttons'>
                      <button
                        className='delete-btn'
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case "comments":
        return (
          <section className='comments-section'>
            <h2>Comments Management</h2>
            {projects.map((project) => (
              <div
                key={project.id}
                className='project-comments'
              >
                <h3>{project.name}</h3>
                {project.reviews?.map((review, index) => (
                  <div
                    key={index}
                    className='comment-item'
                  >
                    <p>{review}</p>
                    <button
                      onClick={() => handleDeleteComment(project.id, index)}
                    >
                      Delete Comment
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='admin-panel'>
      <h1>Admin Panel</h1>
      {renderTabs()}
      {renderContent()}

      {/* User Edit Modal */}
      {selectedUser && (
        <div className='modal-overlay'>
          <div className='modal'>
            <h2>Edit User: {selectedUser.username}</h2>
            <input
              type='text'
              placeholder='Description'
              value={editingUser.description}
              onChange={(e) =>
                setEditingUser({ ...editingUser, description: e.target.value })
              }
            />
            <input
              type='text'
              placeholder='Position'
              value={editingUser.position}
              onChange={(e) =>
                setEditingUser({ ...editingUser, position: e.target.value })
              }
            />
            <input
              type='text'
              placeholder='Level'
              value={editingUser.level}
              onChange={(e) =>
                setEditingUser({ ...editingUser, level: e.target.value })
              }
            />
            <input
              type='number'
              placeholder='Year of Birth'
              value={editingUser.year_of_birth}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  year_of_birth: parseInt(e.target.value),
                })
              }
            />
            <div className='modal-buttons'>
              <button onClick={() => handleEditUser(selectedUser.id)}>
                Save
              </button>
              <button onClick={() => setSelectedUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

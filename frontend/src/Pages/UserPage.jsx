import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
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
      } catch (err) {
        setError("User not found or error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const logout = () => {
    // Clear user info and token from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='userpage'>
      <div className='userpageMainHeader'>
        <img
          src={user.profile_pic}
          alt='Profile Picture'
        />
        <h1>{user.username}</h1>
      </div>
      <p>{user.position}</p>
      <p>{user.description}</p>
      <p>Email: {user.email}</p>
      <h3>Projects</h3>
      {user.projects.length > 0 ? (
        <ul>
          {user.projects.map((project) => (
            <li key={project.id}>
              <a href={`/projects/${project.id}`}>{project.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects available.</p>
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default UserProfile;

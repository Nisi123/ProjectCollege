import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from URL params
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${userId}`
        );
        setUser(response.data);
      } catch (err) {
        setError("User not found or error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{user.username} Profile</h1>
      <img
        src={user.profile_pic}
        alt='Profile'
        style={{ width: "150px", borderRadius: "50%" }}
      />
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
    </div>
  );
};

export default UserProfile;

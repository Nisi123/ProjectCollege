import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

const CompleteProfile = ({ userId }) => {
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");
  const [level, setLevel] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    const payload = {};

    if (description) payload.description = description;
    if (position) payload.position = position;
    if (yearOfBirth) payload.year_of_birth = parseInt(yearOfBirth, 10);
    if (level) payload.level = level;

    try {
      const response = await axios.put(
        `http://localhost:8000/users/complete-profile/${userId}`,
        payload
      );
      console.log("Profile updated successfully:", response.data);

      // Show success message
      setSuccessMessage("Profile updated successfully!");

      // Redirect to user page after 1 second
      setTimeout(() => {
        navigate(`/user/${userId}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='description'>Description:</label>
          <input
            type='text'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter a description'
          />
        </div>

        <div>
          <label htmlFor='position'>Position:</label>
          <input
            type='text'
            id='position'
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder='Enter your position'
          />
        </div>

        <div>
          <label htmlFor='yearOfBirth'>Year of Birth:</label>
          <input
            type='number'
            id='yearOfBirth'
            value={yearOfBirth}
            onChange={(e) => setYearOfBirth(e.target.value)}
            placeholder='Enter your year of birth'
          />
        </div>

        <div>
          <label htmlFor='level'>Level:</label>
          <input
            type='text'
            id='level'
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder='Enter your level'
          />
        </div>

        <button type='submit'>Save</button>
      </form>

      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

// PropTypes validation for userId
CompleteProfile.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default CompleteProfile;

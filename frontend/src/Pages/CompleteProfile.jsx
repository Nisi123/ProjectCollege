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
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

    if (!userId) {
      setError("User not found, please login again.");
      return;
    }

    const formData = new FormData();
    if (description) formData.append("description", description);
    if (position) formData.append("position", position);
    if (yearOfBirth) formData.append("year_of_birth", yearOfBirth);
    if (level) formData.append("level", level);
    if (profilePic) formData.append("profile_pic", profilePic);

    try {
      const response = await axios.put(
        `http://localhost:8000/users/complete-profile/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Profile updated successfully:", response.data);

      // Show success message
      setSuccessMessage("Profile updated successfully!");

      // Update localStorage with new data after profile update (optional)
      userData.description = response.data.description;
      userData.position = response.data.position;
      userData.year_of_birth = response.data.year_of_birth;
      userData.level = response.data.level;
      localStorage.setItem("user", JSON.stringify(userData)); // Update user info in localStorage

      // Redirect to user page after 1 second
      setTimeout(() => {
        navigate(`/user/${userId}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile.");
    }
  };

  return (
    <div>
      <h1 className='completeProfileTitle'>Update Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Profile Picture</h3>
          <input
            className='profilePictureForm'
            type='file'
            accept='image/*'
            onChange={handleImageChange}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt='Profile preview'
              style={{ width: "200px", marginTop: "10px" }}
            />
          )}
        </div>
        <div>
          <h3>Position</h3>
          <input
            maxLength={20}
            type='text'
            id='position'
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder='Enter your position'
          />
        </div>
        <div>
          <h3>Birth Year</h3>{" "}
          <input
            type='number'
            id='yearOfBirth'
            value={yearOfBirth}
            onChange={(e) => setYearOfBirth(e.target.value)}
            placeholder='Enter your year of birth'
          />
        </div>
        <div>
          <h3>Study Level</h3>
          <input
            maxLength={10}
            type='text'
            id='level'
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder='Enter your level'
          />
        </div>
        <div>
          <h3>Description</h3>
          <input
            maxLength={100}
            type='text'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter a description'
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdSettings } from "react-icons/io";
import {
  IoTrashOutline,
  IoAdd,
  IoCloseCircleOutline,
  IoClose,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
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
    project_images: [], // Add this field
  });
  const [imageLoading, setImageLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

      // Log each project's images for debugging
      response.data.projects?.forEach((project) => {
        console.log(`Project ${project.name} images:`, {
          main: project.project_pic,
          additional: project.project_images,
        });
      });

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
    navigate("/login");
  };

  const handleSearch = (term) => {
    if (!user || !user.projects) return;
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
      formData.append("time_submitted", new Date().toISOString());

      if (newProject.project_url) {
        formData.append("project_url", newProject.project_url);
      }

      // Append main project pic
      if (newProject.project_pic) {
        formData.append("project_pic", newProject.project_pic);
      }

      // Append additional images - important to use the same field name for all images
      if (newProject.project_images) {
        newProject.project_images.forEach((image) => {
          formData.append("project_images", image);
        });
      }

      // Log formData contents for debugging
      for (let pair of formData.entries()) {
        console.log("FormData Content:", pair[0], pair[1]);
      }

      const response = await axios.post(
        "http://localhost:8000/projects/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchUserData();
      setProjectModalOpen(false);
      setNewProject({
        name: "",
        description: "",
        time_submitted: new Date().toISOString(),
        reviews: [],
        project_url: "",
        project_pic: null,
        project_images: [], // Reset this field
      });
    } catch (error) {
      console.error("Error creating project:", error.response?.data || error);
      alert(
        error.response?.data?.detail ||
          "Failed to create project. Please try again."
      );
    }
  };

  // Add this new function to handle multiple image selection
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Store all files
      setNewProject({
        ...newProject,
        project_pic: files[0],
        project_images: files.slice(1), // Rest of the images
      });

      // Create preview URLs for all images
      const newPreviewImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPreviewImages(newPreviewImages);
    }
  };

  // Add function to remove image
  const removeImage = (index) => {
    const updatedFiles = [...newProject.project_images];
    if (index === 0) {
      // If removing main image, make the next image the main image
      setNewProject({
        ...newProject,
        project_pic: updatedFiles.length > 0 ? updatedFiles[0] : null,
        project_images: updatedFiles.slice(1),
      });
    } else {
      // Remove from additional images
      updatedFiles.splice(index - 1, 1);
      setNewProject({
        ...newProject,
        project_images: updatedFiles,
      });
    }

    // Clean up preview URL and remove from previews
    URL.revokeObjectURL(previewImages[index].preview);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviews);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const handleDeleteProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await axios.delete(`http://localhost:8000/users/${userData.userId}`);
      logout();
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:8000/projects/${projectId}`);
      await fetchUserData(); // Refresh the projects list
      setProjectToDelete(null); // Close the confirmation modal
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedProjects.map((projectId) =>
          axios.delete(`http://localhost:8000/projects/${projectId}`)
        )
      );
      await fetchUserData();
      setSelectedProjects([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting projects:", error);
      alert("Failed to delete some projects. Please try again.");
    }
  };

  const handleProjectSelection = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (isDeleteMode) {
      // Clear selections when exiting delete mode
      setSelectedProjects([]);
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains("modalOverlay")) {
      setSelectedProject(null);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      const images = [
        selectedProject.project_pic,
        ...(selectedProject.project_images || []),
      ].filter(Boolean);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      const images = [
        selectedProject.project_pic,
        ...(selectedProject.project_images || []),
      ].filter(Boolean);
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Paginate the filtered projects
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
  const getImageUrl = (url) => {
    if (!url || url === "No Profile Pic") {
      return `http://localhost:8000/uploads/default-profile-pic.png`;
    }

    // If the URL starts with 'uploads/', add the base URL
    if (url.startsWith("uploads/")) {
      return `http://localhost:8000/${url}`;
    }

    // Return the full URL as is
    return url;
  };

  const getProjectImageUrl = (url) => {
    if (!url) {
      return `http://localhost:8000/uploads/default-project-pic.png`;
    }

    // Handle full URLs that might contain backslashes
    if (url.includes("http://localhost:8000")) {
      // Replace backslashes with forward slashes and ensure proper formatting
      return url
        .replace(/\\/g, "/")
        .replace(
          "http://localhost:8000uploads",
          "http://localhost:8000/uploads"
        );
    }

    // Handle relative paths
    const cleanPath = url.replace(/\\/g, "/"); // Replace any backslashes with forward slashes
    if (cleanPath.startsWith("uploads/")) {
      return `http://localhost:8000/${cleanPath}`;
    }

    // If it's just a filename, add the full path
    return `http://localhost:8000/uploads/${cleanPath}`;
  };

  // Add image loading handler
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Update the project card rendering
  const renderProjectCard = (project) => {
    return (
      <div
        className='projectCard'
        key={project.id}
        onClick={() => !isDeleteMode && openProjectDetails(project)}
      >
        {isDeleteMode && (
          <div className='projectDeleteByCheckbox'>
            <input
              type='checkbox'
              checked={selectedProjects.includes(project.id)}
              onChange={() => handleProjectSelection(project.id)}
              className='projectCheckbox'
            />
            <FaTrash
              className='deleteProjectIcon'
              onClick={() => setProjectToDelete(project)}
            />
          </div>
        )}

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
            <div>
              <FaRegHeart />
              <p>{project.like_count || 0}</p>
            </div>
          </div>
          <p>{project.description}</p>
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
                onClick={() => setShowDeleteConfirm(true)}
                className='deleteButton'
              >
                Delete Profile
              </button>
              <button
                onClick={closeModal}
                className='closeButton'
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className='modalOverlay'>
            <div className='modal'>
              <h2>Confirm Delete</h2>
              <p>
                Are you sure you want to delete your profile? This cannot be
                undone.
              </p>
              <div className='modalButtons'>
                <button
                  onClick={handleDeleteProfile}
                  className='deleteConfirmButton'
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className='cancelButton'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project Creation Modal */}
        {isProjectModalOpen && (
          <div className='modalOverlay projectCreationModalOverlay'>
            <div className='modal'>
              <h2>Create New Project</h2>
              <form onSubmit={handleProjectSubmit}>
                <input
                  maxLength='30'
                  type='text'
                  placeholder='Project Name'
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
                <input
                  maxLength='200'
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
                <div className='imageUploadSection'>
                  <input
                    className='addImageForm'
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleImageSelection}
                  />

                  {/* Preview selected images */}
                  {previewImages.length > 0 && (
                    <div className='selectedImagesPreview'>
                      {previewImages.map((image, index) => (
                        <div
                          key={index}
                          className='previewImageContainer'
                        >
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                          />
                          <span
                            className={`imageLabel ${
                              index === 0 ? "mainImage" : ""
                            }`}
                          >
                            {index === 0 ? "Main" : `${index}`}
                          </span>
                          <button
                            type='button'
                            onClick={() => removeImage(index)}
                            className='removeImageBtn'
                          >
                            <IoClose />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='projectCreateFormButton'>
                  <button type='submit'>Create Project</button>
                  <button
                    type='button'
                    onClick={() => setProjectModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
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

      <div className='projectsSectionHeader'>
        <h1 className='projectsHeader'>Projects</h1>
      </div>

      {/* Search Bar */}
      <div className='search-bar UserPageSearchBar'>
        {isDeleteMode && selectedProjects.length > 0 && (
          <button
            className='bulkDeleteButton'
            onClick={() => setShowBulkDeleteConfirm(true)}
          >
            Delete Selected ({selectedProjects.length})
          </button>
        )}
        <button
          className='addProjectButton'
          onClick={() => setProjectModalOpen(true)}
        >
          <IoAdd /> Add Project
        </button>
        <button
          className={`deleteProjectsButton ${isDeleteMode ? "active" : ""}`}
          onClick={toggleDeleteMode}
        >
          {isDeleteMode ? (
            <>
              <IoCloseCircleOutline /> Exit Delete Mode
            </>
          ) : (
            <>
              <IoTrashOutline /> Delete Projects
            </>
          )}
        </button>
        <input
          maxLength={20}
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

      {/* Add Project Delete Confirmation Modal */}
      {projectToDelete && (
        <div className='modalOverlay'>
          <div className='modal'>
            <h2>Delete Project</h2>
            <p>Are you sure you want to delete "{projectToDelete.name}"?</p>
            <div className='modalButtons'>
              <button
                onClick={() => handleDeleteProject(projectToDelete.id)}
                className='deleteConfirmButton'
              >
                Delete
              </button>
              <button
                onClick={() => setProjectToDelete(null)}
                className='cancelButton'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className='modalOverlay'>
          <div className='modal'>
            <h2>Delete Multiple Projects</h2>
            <p>
              Are you sure you want to delete {selectedProjects.length}{" "}
              projects?
            </p>
            <div className='modalButtons'>
              <button
                onClick={handleBulkDelete}
                className='deleteConfirmButton'
              >
                Delete All Selected
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className='cancelButton'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Details Modal */}
      {selectedProject && (
        <div
          className='modalOverlay projectDetailsModalOverlay'
          onClick={handleModalClick}
        >
          <div className='modal projectDetailsModal'>
            <div className='projectDetailsContent'>
              <div className='projectImageSlider'>
                <div className='projectDetailsImage'>
                  {(() => {
                    // Combine main image and additional images
                    const allImages = [
                      selectedProject.project_pic,
                      ...(selectedProject.project_images || []),
                    ].filter(Boolean);

                    return (
                      <img
                        src={getProjectImageUrl(
                          allImages[currentImageIndex] || null
                        )} // Add || null here
                        alt={selectedProject.name}
                        onError={(e) => {
                          e.target.src = getProjectImageUrl(null);
                        }}
                      />
                    );
                  })()}

                  {/* Only show navigation if there are multiple images */}
                  {(selectedProject.project_images?.length > 0 ||
                    selectedProject.project_pic) && (
                    <>
                      <button
                        className='sliderButton prev'
                        onClick={handlePrevImage}
                      >
                        <IoChevronBack />
                      </button>
                      <button
                        className='sliderButton next'
                        onClick={handleNextImage}
                      >
                        <IoChevronForward />
                      </button>
                      <div className='sliderDots'>
                        {[
                          selectedProject.project_pic,
                          ...(selectedProject.project_images || []),
                        ]
                          .filter(Boolean)
                          .map((_, index) => (
                            <button
                              key={index}
                              className={`dot ${
                                index === currentImageIndex ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                              }}
                            />
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* ...rest of modal content... */}
              <div className='projectDetailsHeader'>
                <h2>{selectedProject.name}</h2>
                <div className='likesCount'>
                  <FaRegHeart />
                  <span>{selectedProject.like_count || 0}</span>
                </div>
              </div>
              <div className='projectDetailsInfo'>
                <p className='projectDescription'>
                  {selectedProject.description}
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
                {/* <h3>Reviews</h3> */}
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
                    <p className='noReviews'>No Comments</p>
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

export default UserProfile;

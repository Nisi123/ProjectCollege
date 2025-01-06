import axios from "axios";

// Create an instance of axios for API requests
const api = axios.create({
  baseURL: "http://localhost:8000", // Adjust with your backend URL
});

// Function to fetch all projects
export const getAllProjects = async () => {
  try {
    const response = await api.get("/projects/");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Function to fetch a specific project
export const getProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

// Function to create a new project with file upload
export const createProject = async (projectData, projectPic) => {
  try {
    const formData = new FormData();
    formData.append("name", projectData.name);
    formData.append("description", projectData.description);
    formData.append("time_submitted", projectData.time_submitted);
    formData.append("user_associated", projectData.user_associated);
    formData.append("reviews", JSON.stringify(projectData.reviews)); // Convert array to string
    formData.append("project_pic", projectPic); // The image file

    const response = await api.post("/projects/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Function to create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post("/users/", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

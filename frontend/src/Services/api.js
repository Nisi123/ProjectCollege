const API_URL = "http://localhost:8000";

export const signUp = async (userData) => {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to sign up");
  }

  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(
    `${API_URL}/users/login?email=${email}&password=${password}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
};

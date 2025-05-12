// services/authService.js
const API_URL = `${import.meta.env.VITE_API_URL}`;

export const loginUser = async (email, password) => {
  // Use fetch to POST credentials to the backend
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    // For a non-200 HTTP status, throw an error (e.g. 401 Unauthorized)
    const message = `Login request failed with status ${response.status}`;
    throw new Error(message);
  }

  // The backend should return JSON, e.g. { token: "JWT_TOKEN" }
  const data = await response.json();
  return data; // e.g., { token: '...' }
};
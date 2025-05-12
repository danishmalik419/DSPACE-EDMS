import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

function Login() {
  // "email" here represents the identifier (username, email, or id)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the identifier as "email" and the password.
        body: JSON.stringify({ email, password }),
      });
      
      // Parse the response data.
      const data = await response.json();
      let token = null;
      if(data.data){
        token = data.data.token;
      }

      // If the response is not OK, check for inactive user.
      if (!response.ok) {
        const errorData = data;
        if (errorData.message === "User is inactive") {
          navigate("/request-activation", { state: { email, token } });
          return;
        }
        throw new Error(
          errorData.message || `Login failed with status ${response.status}`
        );
      }


      // If the user is inactive, redirect to the activation request page.
      if (data.isActive === false) {
        navigate("/request-activation", { state: { email, token } });
        return;
      }

      // If the user logged in with a temporary password, redirect directly to the reset password page.
      if (data.resetPassword) {
        navigate("/reset-password", { state: { email, fromTemporary: true, token } });
        return;
      }

      // Otherwise, login is successful. Store token and user info.
      const userData = data.data;
      localStorage.setItem("token", userData.token);
      let username = userData.user.firstName;
      if(userData.user.lastName){
        username += " "+userData.user.lastName;
      }
      localStorage.setItem("username", username);
      if (userData.user.roles) {
        const roles = userData.user.roles;
        const userRole = roles.includes("ADMIN")
          ? "ADMIN"
          : roles.includes("LIBRARIAN")
          ? "LIBRARIAN"
          : "USER";
        localStorage.setItem("role", userRole);
      }
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Login failed. Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to the reset password request page (for non-temporary cases)
    if (!email) {
      setErrorMsg("Please enter your username/email/ID first.");
      return;
    }
    navigate("/request-reset-password", { state: { email } });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Log In to Your Account
        </h2>

        <form onSubmit={handleLoginSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username or ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your username or ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-500 hover:underline focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>

        {errorMsg && (
          <p className="mt-4 text-center text-red-600 text-sm">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
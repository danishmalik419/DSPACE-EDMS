import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const token = location.state?.token;
  const fromTemporary = location.state?.fromTemporary; // true if user logged in with a temporary password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMsg("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/user/reset-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, newPassword }),
      });
      if (!response.ok) {
        throw new Error("Failed to reset password.");
      }
      setStatusMsg("Password reset successfully.");
      // Redirect to login after a short delay.
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to reset password. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Reset Your Password
        </h2>
        {/* For temporary password reset, always show the form */}
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md"
          >
            Reset Password
          </button>
        </form>
        {statusMsg && (
          <p className="mt-4 text-center text-green-600">{statusMsg}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

function ResetPasswordRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const API_URL = import.meta.env.VITE_API_URL;

  const [requestStatus, setRequestStatus] = useState(""); // "PENDING", "REJECTED", "ACCEPTED", "NONE"
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    // Fetch the reset password request status from the API.
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/reset-password-request-status/${email}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch status.");
        }
        const res = await response.json();
        const data = res.data;
        setRequestStatus(data.status);
        if (data.status === "REJECTED" && data.reason) {
          setRejectionReason(data.reason);
        }
      } catch (err) {
        console.error("Fetch status error:", err);
        setError("Failed to fetch reset password request status.");
      }
    };
    fetchStatus();
  }, [email, API_URL, navigate]);

  const handleRequestReset = async () => {
    setError("");
    setStatusMsg("");
    try {
      const response = await fetch(`${API_URL}/request-reset-password/${email}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to request reset password.");
      }
      setStatusMsg("Reset password request sent successfully.");
      // After sending, update status.
      setRequestStatus("PENDING");
    } catch (err) {
      console.error("Request reset error:", err);
      setError("Failed to request reset password. Please try again later.");
    }
  };

  const handleProceedReset = () => {
    // If the status is accepted, or if there is no pending/rejected status, redirect to the reset form.
    navigate("/reset-password", { state: { email } });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Forgot Password
        </h2>

        {error && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}

        {/* Display status messages based on the fetched reset request status */}
        {requestStatus === "PENDING" && (
          <p className="mb-4 text-gray-700">
            A reset password request is already pending. Please check your email.
          </p>
        )}

        {requestStatus === "REJECTED" && (
          <p className="mb-4 text-gray-700">
            Your previous reset password request was rejected.
            {rejectionReason && <span> Reason: {rejectionReason}</span>}
          </p>
        )}

        {/* If status is "NONE" or not pending, allow user to request a new reset */}
        {requestStatus !== "PENDING" && (
          <button
            onClick={handleRequestReset}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Request Reset Password
          </button>
        )}

        {statusMsg && (
          <p className="mt-4 text-center text-green-600">{statusMsg}</p>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordRequestPage;
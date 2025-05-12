import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

function RequestActivationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const token = location.state?.token;
  const [activationStatus, setActivationStatus] = useState(""); // For success message after sending request.
  const [activationRequestStatus, setActivationRequestStatus] = useState(""); // Fetched from API: "PENDING", "ACCEPTED", "REJECTED", "NONE"
  const [activationRequestReason, setActivationRequestReason] = useState("");
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!email || !token) {
      navigate("/login"); // Redirect to login if email is not passed.
      return;
    }

    // Function to fetch the current activation request status.
    const fetchActivationStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/user/user/request-activation-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch activation request status.");
        }
        const res = await response.json();
        const data = res.data;
        setActivationRequestStatus(data.status);
        if (data.status === "REJECTED" && data.reason) {
          setActivationRequestReason(data.reason);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch activation request status.");
      }
    };

    fetchActivationStatus();
  }, [email, navigate, API_URL]);

  const handleRequestActivation = async () => {
    try {
      const response = await fetch(`${API_URL}/user/user/request-activation`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to request activation.");
      }

      setActivationStatus("Activation request sent successfully.");

      // Optionally refresh the activation request status.
      const resStatus = await fetch(`${API_URL}/user/user/request-activation-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resStatus.ok) {
        const data = await resStatus.json();
        setActivationRequestStatus(data.status);
        if (data.status === "REJECTED" && data.reason) {
          setActivationRequestReason(data.reason);
        }
      }
    } catch (error) {
      console.error("Activation request error:", error);
      setError("Failed to request activation. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12 cursor-pointer" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Activation</h2>

        {activationRequestStatus === "PENDING" ? (
          <p className="mb-4 text-gray-700">
            Your activation request is currently pending. Please wait for approval.
          </p>
        ) : (
          <>
            {activationRequestStatus === "REJECTED" && (
              <p className="mb-4 text-gray-700">
                Your previous activation request was rejected.
                {activationRequestReason && (
                  <span> Reason: {activationRequestReason}</span>
                )}
              </p>
            )}
            <p className="mb-4 text-gray-700">
              To activate your account associated with {email}, click the button below.
            </p>
            <button
              onClick={handleRequestActivation}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              disabled={activationRequestStatus === "PENDING"}
            >
              Request Activation
            </button>
          </>
        )}

        {activationStatus && (
          <p className="mt-4 text-center text-green-600">{activationStatus}</p>
        )}

        {error && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

export default RequestActivationPage;
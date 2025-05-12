import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserRequestManagement = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Define button classes
  const acceptButtonClass = "bg-orange-500 text-white rounded hover:bg-orange-600";
  const declineButtonClass = "bg-white text-orange-500 border border-orange-500 rounded hover:bg-gray-50";

  // Tabs: 'activation' and 'password'
  const [activeTab, setActiveTab] = useState("activation");
  const [activeFilter, setActiveFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states for reviewing activation requests
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  // Modal states for reviewing reset password requests
  const [showResetAcceptModal, setShowResetAcceptModal] = useState(false);
  const [showResetRejectModal, setShowResetRejectModal] = useState(false);
  // New state for showing temporary password modal after reset
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);

  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deactivateAt, setDeactivateAt] = useState(""); // For activation accept
  // For reset password review, we no longer take a temporary password as input.
  const [resetRejectReason, setResetRejectReason] = useState("");
  const [resetTempPassword, setResetTempPassword] = useState("");

  // Optional flags for submissions (if used)
  const [activationSubmitted, setActivationSubmitted] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);

  // Data state for fetched requests
  const [activationRequests, setActivationRequests] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);

  // Fetch activation requests with pagination when activeTab is 'activation'
  useEffect(() => {
    if (activeTab === "activation") {
      fetch(`${API_URL}/librarian/user/activation-requests?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setActivationRequests(data.data.requests);
            if (data.data.total) {
              setTotalPages(Math.ceil(data.data.total / 10));
            } else {
              setTotalPages(1);
            }
          }
        })
        .catch((err) =>
          console.error("Error fetching activation requests:", err)
        );
    }
  }, [activeTab, page, API_URL, token]);

  // Fetch reset password requests with pagination when activeTab is 'password'
  useEffect(() => {
    if (activeTab === "password") {
      fetch(`${API_URL}/librarian/user/reset-password-requests?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPasswordRequests(data.data.requests);
            if (data.data.total) {
              setTotalPages(Math.ceil(data.data.total / 10));
            } else {
              setTotalPages(1);
            }
          }
        })
        .catch((err) =>
          console.error("Error fetching password requests:", err)
        );
    }
  }, [activeTab, page, API_URL, token]);

  // ----- Activation Review Handlers -----
  const openAcceptModal = (id) => {
    setCurrentRequestId(id);
    setShowAcceptModal(true);
  };

  const openRejectModal = (id) => {
    setCurrentRequestId(id);
    setShowRejectModal(true);
  };

  const handleAcceptReview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-activation-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: currentRequestId,
            isAccepted: true,
            deactivateAt,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to accept activation request.");
      }
      setShowAcceptModal(false);
      setDeactivateAt("");
      setCurrentRequestId(null);
    } catch (error) {
      console.error("Accept review error:", error);
    }
  };

  const handleRejectReview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-activation-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: currentRequestId,
            isAccepted: false,
            reason: rejectReason,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reject activation request.");
      }
      setShowRejectModal(false);
      setRejectReason("");
      setCurrentRequestId(null);
    } catch (error) {
      console.error("Reject review error:", error);
    }
  };

  // ----- Reset Password Review Handlers -----
  const openResetAcceptModal = (id) => {
    setCurrentRequestId(id);
    setShowResetAcceptModal(true);
  };

  const openResetRejectModal = (id) => {
    setCurrentRequestId(id);
    setShowResetRejectModal(true);
  };

  // When resetting password, we just ask for assurance and call the API.
  const handleResetAcceptReview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-reset-password-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: currentRequestId,
            action: "ACCEPT",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      const data = await response.json();
      if (data.success) {
        setResetTempPassword(data.data.temporaryPassword);
        setShowResetAcceptModal(false);
        setShowTempPasswordModal(true);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleResetRejectReview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-reset-password-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: currentRequestId,
            action: "DECLINE",
            reason: resetRejectReason,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to decline reset password request.");
      }
      setShowResetRejectModal(false);
      setResetRejectReason("");
      setCurrentRequestId(null);
    } catch (error) {
      console.error("Decline reset review error:", error);
    }
  };

  // Filter activation requests based on activeFilter.
  const filteredActivationRequests = activationRequests.filter((request) => {
    if (activeFilter === "all") return true;
    return request.updatedBy === null;
  });

  const tabStyle = (isActive) =>
    `text-gray-500 hover:text-orange-600 font-medium flex items-center relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:transition-all after:duration-300 ${
      isActive ? "text-orange-500 after:bg-orange-500" : "after:bg-transparent"
    } mr-6 py-2`;

  const cellStyle =
    "px-6 py-4 whitespace-nowrap text-center text-md font-medium text-gray-700 border border-gray-200";
  const headerCellStyle =
    "px-6 py-3 text-center text-md font-medium text-gray-900 tracking-wider border border-gray-200";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-500 text-white p-2">
        <div className="container mx-auto flex items-center">
          <span
            className="font-bold ml-40 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <span className="mx-2 font-bold">&gt;</span>
          <span className="font-bold cursor-pointer">User Request</span>
        </div>
      </div>

      <main className="container mx-auto p-6 pl-40 pr-16">
        <h1 className="text-3xl font-semibold text-gray-700">
          User Request
        </h1>
        <p className="text-gray-400 mb-6">
          Manage account activation and password reset requests.
        </p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              className={tabStyle(activeTab === "activation")}
              onClick={() => {
                setActiveTab("activation");
                setPage(0);
              }}
            >
              Account Activation Requests
            </button>
            <button
              className={tabStyle(activeTab === "password")}
              onClick={() => {
                setActiveTab("password");
                setPage(0);
              }}
            >
              Password Reset Requests
            </button>
          </div>
        </div>

        {/* Activation Tab Content */}
        {activeTab === "activation" && (
          <>
            <div className="flex mb-4">
              <button
                className={tabStyle(activeFilter === "all")}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={tabStyle(activeFilter === "pending")}
                onClick={() => setActiveFilter("pending")}
              >
                Pending
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className={headerCellStyle}>Username</th>
                    <th className={headerCellStyle}>Email</th>
                    <th className={headerCellStyle}>Requested On</th>
                    <th className={headerCellStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivationRequests.map((request, index) => (
                    <tr
                      key={request.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                    >
                      <td className={cellStyle}>
                        {request.user?.firstName} {request.user?.lastName}
                      </td>
                      <td className={cellStyle}>{request.user?.email}</td>
                      <td className={cellStyle}>
                        {new Date(request.createdAt).toLocaleString()}
                      </td>
                      <td className={cellStyle}>
                        {request.updatedBy === null ? (
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => openRejectModal(request.id)}
                              className={`${declineButtonClass} w-24 py-2`}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => openAcceptModal(request.id)}
                              className={`${acceptButtonClass} w-24 py-2`}
                            >
                              Accept
                            </button>
                          </div>
                        ) : request.isAccepted ? (
                          <span className="text-green-600 font-medium">
                            Accepted
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Password Reset Tab Content */}
        {activeTab === "password" && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className={headerCellStyle}>Username</th>
                  <th className={headerCellStyle}>Email</th>
                  <th className={headerCellStyle}>Requested On</th>
                  <th className={headerCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passwordRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className={cellStyle}>
                      {request.user?.firstName} {request.user?.lastName}
                    </td>
                    <td className={cellStyle}>{request.user?.email}</td>
                    <td className={cellStyle}>
                      {new Date(request.createdAt).toLocaleString()}
                    </td>
                    <td className={cellStyle}>
                      {request.updatedBy === null ? (
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => openResetRejectModal(request.id)}
                            className={`${declineButtonClass} px-4 py-2`}
                            disabled={resetSubmitted}
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => openResetAcceptModal(request.id)}
                            className={`${acceptButtonClass} px-4 py-2`}
                            disabled={resetSubmitted}
                          >
                            Accept
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {request.isAccepted ? "Accepted" : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>

      {/* ----- Activation Reject Modal ----- */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rejection Reason</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${acceptButtonClass} px-4 py-2`}
                onClick={handleRejectReview}
                disabled={!rejectReason.trim() || resetSubmitted}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Activation Accept Modal ----- */}
      {showAcceptModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAcceptModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Accept Activation Request</h3>
            <p className="mb-2 text-gray-700">Please enter a deactivation date (YYYY-MM-DD):</p>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="e.g., 2025-03-09"
              value={deactivateAt}
              onChange={(e) => setDeactivateAt(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                onClick={() => setShowAcceptModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${acceptButtonClass} px-4 py-2`}
                onClick={handleAcceptReview}
                disabled={!deactivateAt.trim() || activationSubmitted}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Reset Password Accept Modal (Confirmation) ----- */}
      {showResetAcceptModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResetAcceptModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reset Password Confirmation
            </h3>
            <p className="mb-4">
              Are you sure you want to reset the password?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetAcceptModal(false)}
                className="px-4 py-2 border border-orange-500 text-orange-500 rounded"
              >
                No
              </button>
              <button
                onClick={handleResetAcceptReview}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Reset Password Reject Modal ----- */}
      {showResetRejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResetRejectModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Decline Reset Password Request</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="Enter rejection reason..."
              value={resetRejectReason}
              onChange={(e) => setResetRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                onClick={() => setShowResetRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${declineButtonClass} px-4 py-2`}
                onClick={handleResetRejectReview}
                disabled={!resetRejectReason.trim() || resetSubmitted}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Temporary Password Modal ----- */}
      {showTempPasswordModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTempPasswordModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Temporary Password
            </h3>
            <p className="mb-4">Your temporary password is:</p>
            <div className="mb-4 text-center font-bold text-xl">
              {resetTempPassword}
            </div>
            <p className="mb-4 text-sm text-gray-700">
              This password will be visible only once. Please take a screenshot.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTempPasswordModal(false)}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestManagement;
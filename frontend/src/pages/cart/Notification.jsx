import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaShoppingCart, FaUser } from "react-icons/fa";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Activation Review Modal States
  const [showActivationModal, setShowActivationModal] = useState(false);
  // "activationMode" can be "accept" or "reject"
  const [activationMode, setActivationMode] = useState("");
  const [activationData, setActivationData] = useState(null);
  const [deactivationDate, setDeactivationDate] = useState("");
  const [activationRejectReason, setActivationRejectReason] = useState("");
  const [activationActionSubmitted, setActivationActionSubmitted] = useState(false);
  const [activationError, setActivationError] = useState("");

  // Reset Password Review Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  // "resetMode" can be "accept" or "reject"
  const [resetMode, setResetMode] = useState("");
  const [resetData, setResetData] = useState(null);
  // We no longer take temporary password input; instead, we show a confirmation message.
  const [resetRejectReason, setResetRejectReason] = useState("");
  const [resetActionSubmitted, setResetActionSubmitted] = useState(false);
  const [resetError, setResetError] = useState("");
  // New state for showing temporary password modal after reset.
  const [resetTempPassword, setResetTempPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${API_URL}/librarian/notification?type=${activeTab}&page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, [activeTab, page, API_URL, token]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        const response = await fetch(
          `${API_URL}/librarian/notification/read/${notification.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            )
          );
        }
      }

      if (notification.type === "ACTIVATION_REQUESTED") {
        setActivationData(notification);
        setShowActivationModal(true);
      } else if (notification.type === "RESET_PASSWORD_REQUEST") {
        setResetData(notification);
        setShowResetModal(true);
      } else if (notification.type === "ITEMS_REQUESTED") {
        navigate(`/request/${notification.resourceId}`);
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  // ----- Activation Review -----
  const submitActivationReview = async (accepted) => {
    setActivationError("");
    setActivationActionSubmitted(true);
    let body = { requestId: activationData.resourceId };
    if (accepted) {
      body.isAccepted = true;
      body.deactivateAt = deactivationDate;
    } else {
      body.isAccepted = false;
      body.reason = activationRejectReason;
    }
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-activation-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error();
      }
      // If successful, close modal.
      setShowActivationModal(false);
      setDeactivationDate("");
      setActivationRejectReason("");
      setActivationActionSubmitted(false);
      setActivationData(null);
    } catch (error) {
      console.error("Activation review error", error);
      setActivationError("Something went wrong");
      setActivationActionSubmitted(false);
    }
  };

  // ----- Reset Password Review -----
  const submitResetPasswordReview = async (accepted) => {
    setResetError("");
    setResetActionSubmitted(true);
    let body = { requestId: resetData.resourceId };
    if (accepted) {
      body.action = "ACCEPT";
    } else {
      body.action = "DECLINE";
      body.reason = resetRejectReason;
    }
    try {
      const response = await fetch(
        `${API_URL}/librarian/user/review-reset-password-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      if (accepted && data.success) {
        // Store temporary password returned by API.
        setResetTempPassword(data.data.temporaryPassword);
        setShowResetModal(false);
        // Optionally reset flags and data.
        setResetActionSubmitted(false);
        setResetData(null);
      } else if (!accepted) {
        setShowResetModal(false);
        setResetActionSubmitted(false);
        setResetData(null);
      }
    } catch (error) {
      console.error("Reset password review error", error);
      setResetError("Something went wrong");
      setResetActionSubmitted(false);
    }
  };

  const tabStyle = (isActive) =>
    `py-2 px-4 ${
      isActive
        ? "border-b-2 border-orange-500 text-orange-500"
        : "text-gray-500"
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-3 flex items-center pl-48">
        <span
          className="font-medium cursor-pointer"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Notifications</span>
      </div>

      {/* Notifications container */}
      <div className="container mx-auto p-6 pl-40">
        <h1 className="text-3xl font-medium text-gray-800 mb-6">
          Notifications
        </h1>
        <div className="border-b border-gray-200 mb-6"></div>
        <div className="space-y-6">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border-b border-gray-200 pb-6 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start">
                {!notification.isRead && (
                  <div className="flex-shrink-0 pt-1 mr-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                )}
                <div className="p-2 bg-gray-100 rounded-full shadow mr-4">
                  {notification.type === "ITEMS_REQUESTED" ? (
                    <FaShoppingCart className="text-gray-500 text-lg" />
                  ) : notification.type === "ACTIVATION_REQUESTED" ? (
                    <FaUser className="text-gray-500 text-lg" />
                  ) : (
                    <FaBell className="text-gray-500 text-lg" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-gray-600">
                    {notification.type === "ACTIVATION_REQUESTED"
                      ? `${notification.userEmail} has requested to activate their account.`
                      : notification.type === "ITEMS_REQUESTED"
                      ? `${notification.userEmail} has requested these documents from the library.`
                      : notification.type === "RESET_PASSWORD_REQUEST"
                      ? `${notification.userEmail} has requested to reset their password.`
                      : notification.description}
                  </p>
                  <p className="mt-1 text-gray-400 text-sm">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ----- Activation Review Modal ----- */}
      {showActivationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowActivationModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review Activation Request
            </h3>
            <div>
              <p className="mb-2">
                Do you want to accept or decline this activation request?
              </p>
              <div className="flex justify-around">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded"
                  onClick={() => {
                    setActivationMode("accept");
                    setActivationError("");
                  }}
                  disabled={activationActionSubmitted}
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 border border-orange-500 text-orange-500 rounded"
                  onClick={() => {
                    setActivationMode("reject");
                    setActivationError("");
                  }}
                  disabled={activationActionSubmitted}
                >
                  Decline
                </button>
              </div>
            </div>
            {activationMode === "accept" && (
              <div className="mt-4">
                <p className="mb-2">Enter deactivation date (YYYY-MM-DD):</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., 2025-03-09"
                  value={deactivationDate}
                  onChange={(e) => setDeactivationDate(e.target.value)}
                />
                {!activationActionSubmitted && (
                  <button
                    className="mt-2 w-full bg-orange-500 text-white py-2 rounded"
                    onClick={() => submitActivationReview(true)}
                    disabled={!deactivationDate.trim()}
                  >
                    Submit
                  </button>
                )}
                {activationError && (
                  <p className="mt-2 text-red-600">{activationError}</p>
                )}
              </div>
            )}
            {activationMode === "reject" && (
              <div className="mt-4">
                <p className="mb-2">Enter rejection reason:</p>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter reason..."
                  value={activationRejectReason}
                  onChange={(e) => setActivationRejectReason(e.target.value)}
                ></textarea>
                {!activationActionSubmitted && (
                  <button
                    className="mt-2 w-full border border-orange-500 text-orange-500 py-2 rounded"
                    onClick={() => submitActivationReview(false)}
                    disabled={!activationRejectReason.trim()}
                  >
                    Submit
                  </button>
                )}
                {activationError && (
                  <p className="mt-2 text-red-600">{activationError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----- Reset Password Review Modal ----- */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review Reset Password Request
            </h3>
            <div>
              <p className="mb-2">
                Do you want to accept or decline this reset password request?
              </p>
              <div className="flex justify-around">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded"
                  onClick={() => {
                    setResetMode("accept");
                    setResetError("");
                  }}
                  disabled={resetActionSubmitted}
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 border border-orange-500 text-orange-500 rounded"
                  onClick={() => {
                    setResetMode("reject");
                    setResetError("");
                  }}
                  disabled={resetActionSubmitted}
                >
                  Decline
                </button>
              </div>
            </div>
            {resetMode === "accept" && (
              <div className="mt-4">
                <p className="mb-2">
                  Are you sure you want to reset the password?
                </p>
                {!resetActionSubmitted && (
                  <button
                    className="mt-2 w-full bg-orange-500 text-white py-2 rounded"
                    onClick={() => submitResetPasswordReview(true)}
                  >
                    Yes
                  </button>
                )}
                {resetError && (
                  <p className="mt-2 text-red-600">{resetError}</p>
                )}
              </div>
            )}
            {resetMode === "reject" && (
              <div className="mt-4">
                <p className="mb-2">Enter rejection reason:</p>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter rejection reason..."
                  value={resetRejectReason}
                  onChange={(e) => setResetRejectReason(e.target.value)}
                ></textarea>
                {!resetActionSubmitted && (
                  <button
                    className="mt-2 w-full border border-orange-500 text-orange-500 py-2 rounded"
                    onClick={() => submitResetPasswordReview(false)}
                    disabled={!resetRejectReason.trim()}
                  >
                    Submit
                  </button>
                )}
                {resetError && (
                  <p className="mt-2 text-red-600">{resetError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----- Temporary Password Modal ----- */}
      {resetTempPassword && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setResetTempPassword("")}
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
                onClick={() => setResetTempPassword("")}
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
}

export default NotificationsPage;
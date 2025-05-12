import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Key, Save, Trash, Archive } from "lucide-react";

const EditUser = () => {
  const { userId } = useParams(); // Retrieve the selected user's ID from the route
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    fatherName: "",
    dob: "",
    phoneNumber: "",
    govtIdType: "",
    govtId: "",
    deactivateAt: ""
  });
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const navigate = useNavigate();

  // Fetch full details of the selected user when the component mounts.
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/librarian/user/getUser/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        if (data.success) {
          const userDetails = data.data;
          setFormData({
            firstName: userDetails.firstName || "",
            lastName: userDetails.lastName || "",
            email: userDetails.email || "",
            fatherName: userDetails.fatherName || "",
            dob: userDetails.dob ? userDetails.dob.substring(0, 10) : "",
            phoneNumber: userDetails.phoneNumber || "",
            govtIdType: userDetails.govtIdType || "",
            govtId: userDetails.govtId || "",
            deactivateAt: userDetails.deactivateAt ? userDetails.deactivateAt.substring(0, 10) : "",
            password: ""
          });
          setGroups(userDetails.groups);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details.");
      }
    };
    fetchUserDetails();
  }, [userId]);

  // Handle form field changes.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated user details.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in first.");
      }

      // Format date fields.
      const updatedData = { ...formData };
      if (formData.dob) {
        updatedData.dob = updatedData.dob + "T00:00:00.000Z";
      }
      if (formData.deactivateAt) {
        updatedData.deactivateAt = updatedData.deactivateAt + "T00:00:00.000Z";
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/user/editUser/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        }
      );
      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }
      await response.json();
      setSuccess("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user. Please try again.");
    }
  };

  // Navigate back to the search page.
  const handleBackToSearch = () => {
    navigate("/user");
  };

  // Placeholder for adding groups functionality.
  const handleAddToGroups = () => {
    navigate("/groups");
  };

  // Archive user handler.
  const handleArchiveUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in first.");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/user/archive/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to archive user, status ${response.status}`);
      }
      await response.json();
      setSuccess("User archived successfully!");
    } catch (err) {
      console.error("Error archiving user:", err);
      setError(err.message || "Failed to archive user. Please try again.");
    }
  };

  // Handle reset password confirmation.
  const handleResetPasswordConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      const data = await response.json();
      if (data.success) {
        setTempPassword(data.data.temporaryPassword);
        setShowTempPasswordModal(true);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.message || "Error resetting password");
    } finally {
      setShowResetModal(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-orange-500 text-white p-4 pl-44">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-white">Home</a> &gt; Edit User
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4 px-4 pl-44 pr-44">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h1 className="text-2xl font-medium text-gray-700 mb-6">Edit User</h1>
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Type your first name here"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Type your last name here"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="Type your email here"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Father Name
              </label>
              <input
                type="text"
                name="fatherName"
                placeholder="Type your father name here"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                placeholder="Select your date of birth"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Type your phone number here"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Govt ID Type
              </label>
              <select
                name="govtIdType"
                value={formData.govtIdType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Govt ID Type</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            {formData.govtIdType && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Govt ID
                </label>
                <input
                  type="text"
                  name="govtId"
                  placeholder="Type your govt id here"
                  value={formData.govtId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Deactivation Date
              </label>
              <input
                type="date"
                name="deactivateAt"
                placeholder="Select the deactivation date"
                value={formData.deactivateAt}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            {success && <p className="text-green-500 mb-4">{success}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex space-x-2 justify-end w-full mt-4">
              <button
                type="button"
                className="border border-orange-500 text-orange-500 px-3 py-2 rounded flex items-center"
                onClick={handleBackToSearch}
              >
                <ArrowLeft className="mr-1" size={20} />
                Go Back
              </button>
              <button
                type="button"
                className="bg-orange-500 text-white px-3 py-2 rounded flex items-center"
                onClick={() => setShowResetModal(true)}
              >
                <Key className="mr-1" size={16} />
                Reset Password
              </button>
              <button
                type="submit"
                className="bg-orange-500 text-white px-3 py-2 rounded flex items-center"
              >
                <Save className="mr-1" size={16} />
                Save
              </button>
              <button
                type="button"
                className="bg-red-700 text-white px-3 py-2 rounded flex items-center"
              >
                <Trash className="mr-1" size={16} />
                Delete
              </button>
              <button
                type="button"
                className="border border-orange-500 text-orange-500 px-3 py-2 rounded flex items-center"
                onClick={handleArchiveUser}
              >
                <Archive className="mr-1" size={20} />
                Archive User
              </button>
            </div>
          </form>
          <h2 className="text-3xl font-semibold text-gray-700 mt-8 mb-4">
            Member Groups
          </h2>
          <div className="bg-white border border-gray-200 rounded p-6">
            {groups && groups.length > 0 ? (
              <>
                <p className="text-gray-600 mb-4 text-center">
                  This user is a member of {groups.length} group(s).
                </p>
                <ul className="mb-4">
                  {groups.map((group, index) => (
                    <li key={index} className="text-gray-700 text-center">
                      - {group.group.name}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-600 mb-4 text-center">
                This user is not a member of any groups.
              </p>
            )}
            <div className="flex justify-center w-full">
              <button
                onClick={handleAddToGroups}
                className="bg-orange-500 text-white px-3 py-2 rounded text-md"
              >
                Add to groups
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Confirmation Modal */}
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
              Reset Password Confirmation
            </h3>
            <p className="mb-4">Are you sure you want to reset the password?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-orange-500 text-orange-500 rounded"
              >
                No
              </button>
              <button
                onClick={handleResetPasswordConfirm}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
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
            <div className="mb-4 text-center font-bold text-xl">{tempPassword}</div>
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

export default EditUser;
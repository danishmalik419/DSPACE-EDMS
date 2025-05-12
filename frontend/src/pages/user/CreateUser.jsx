import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";

function CreateUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [govtIdType, setGovtIdType] = useState("");
  const [govtId, setGovtId] = useState("");
  const [deactivationDate, setDeactivationDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state for displaying temporary pin
  const [tempPin, setTempPin] = useState("");
  const [showTempPinModal, setShowTempPinModal] = useState(false);
  // Modal state for confirming that user copied the pin
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation for required fields
    if (!firstName || !lastName || !email || (govtIdType && !govtId)) {
      setError("All required fields must be filled");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/librarian/user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName,
            lastName,
            fatherName: fathersName,
            dob: dob + "T00:00:00.000Z",
            email,
            phoneNumber,
            govtIdType,
            govtId,
            // Remove the password field (set to null)
            password: null,
            deactivateAt: deactivationDate ? deactivationDate + "T00:00:00.000Z" : null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to create user");
      } else {
        const data = await response.json();
        // Assume the response contains a temporaryPassword field
        const tempPassword = data.data.temporaryPassword;
        setTempPin(tempPassword);
        // Show the temporary PIN modal
        setShowTempPinModal(true);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  // Called when user clicks the "Copy" button in the temporary PIN modal.
  const handleCopyPin = () => {
    // Here you might copy the pin to clipboard, e.g. using navigator.clipboard.writeText(tempPin)
    navigator.clipboard.writeText(tempPin).then(() => {
      // Show the confirmation modal
      setShowConfirmModal(true);
    });
  };

  // Called when user confirms they have copied the PIN.
  const handleConfirmCopied = () => {
    setShowConfirmModal(false);
    setShowTempPinModal(false);
    navigate("/user");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-orange-500 text-white p-3 flex items-center">
        <span
          className="font-bold ml-32 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <span className="mx-2 font-bold">&gt;</span>
        <span
          className="font-bold cursor-pointer"
          onClick={() => navigate("/user")}
        >
          E-people
        </span>
        <span className="mx-2 font-bold">&gt;</span>
        <span className="font-bold cursor-pointer">Create E-People</span>
      </div>

      <div className="ml-20 p-5">
        <h1 className="text-3xl font-semibold">Create E Person</h1>
        <hr className="my-4" />
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium">
              First name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Type your first name"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Last name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Type your last name"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Father's Name:
            </label>
            <input
              type="text"
              value={fathersName}
              onChange={(e) => setFathersName(e.target.value)}
              placeholder="Type your father's name"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Date of Birth:
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Email: <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Type your email"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Phone Number:
            </label>
            <input
              type="number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Type your phone number"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Government ID:
            </label>
            <select
              value={govtIdType}
              onChange={(e) => setGovtIdType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select an ID</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Passport">Passport</option>
            </select>
          </div>

          {govtIdType && (
            <div className="mb-4">
              <label className="block text-sm font-medium">
                {govtIdType} Number: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={govtId}
                onChange={(e) => setGovtId(e.target.value)}
                required
                placeholder={`Enter your ${govtIdType} number`}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Deactivation Date:
            </label>
            <input
              type="date"
              value={deactivationDate}
              onChange={(e) => setDeactivationDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Password field removed */}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/user")}
              className="px-4 py-2 border border-orange-500 text-orange-500 rounded flex items-center"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded flex items-center"
            >
              <FaSave className="mr-2" /> Create
            </button>
          </div>
          {error && <p className="mt-3 text-red-600">{error}</p>}
          {success && <p className="mt-3 text-green-600">{success}</p>}
        </form>
      </div>

      {/* Temporary PIN Modal */}
      {showTempPinModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTempPinModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Created Successfully
            </h3>
            <p className="mb-4">
              Your temporary PIN is: <span className="font-bold">{tempPin}</span>
            </p>
            <p className="mb-4 text-red-600">
              You will not see this PIN again. Please copy it somewhere safe!
            </p>
            <button
              onClick={handleCopyPin}
              className="w-full bg-orange-500 text-white py-2 rounded"
            >
              Copy PIN
            </button>
          </div>
        </div>
      )}

      {/* Confirm Copy Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Copy
            </h3>
            <p className="mb-4">
              Are you sure you have copied your temporary PIN?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-orange-500 text-orange-500 rounded"
              >
                No
              </button>
              <button
                onClick={handleConfirmCopied}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateUser;
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateGroupPage = () => {
  const navigate = useNavigate();

  // Group form state
  const [formData, setFormData] = useState({
    groupName: "",
    description: ""
  });

  // Roles search states
  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [appliedRoleSearchTerm, setAppliedRoleSearchTerm] = useState("");
  const [rolePage, setRolePage] = useState(1);
  const itemsPerPage = 10;
  const totalRolePages = Math.ceil(totalRoles / itemsPerPage);

  // Selected roles state
  const [selectedRoles, setSelectedRoles] = useState([]);

  // State for success and error messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch roles from API on mount and whenever rolePage or appliedRoleSearchTerm changes.
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/admin/group/roles/all?query=${encodeURIComponent(
            appliedRoleSearchTerm
          )}&page=${rolePage - 1}&limit=${itemsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch roles, status ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          // Filter out roles that have already been selected
          const availableRoles = data.data.roles.filter(
            (role) => !selectedRoles.some((sel) => sel.id === role.id)
          );
          setRoles(availableRoles);
          setTotalRoles(data.data.total);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, [rolePage, appliedRoleSearchTerm, API_URL, selectedRoles]);

  // Handler for group form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for searching roles when the Search button is clicked.
  const handleRoleSearch = () => {
    setRolePage(1);
    setAppliedRoleSearchTerm(roleSearchTerm);
  };

  // Pagination handlers for roles
  const handlePrevRolePage = () => {
    if (rolePage > 1) {
      setRolePage(rolePage - 1);
    }
  };

  const handleNextRolePage = () => {
    if (rolePage < totalRolePages) {
      setRolePage(rolePage + 1);
    }
  };

  // Handler for adding a role to the selected list.
  const handleAddRole = (roleId) => {
    const roleToAdd = roles.find((role) => role.id === roleId);
    if (roleToAdd) {
      setSelectedRoles(prev => [...prev, roleToAdd]);
      setRoles(prev => prev.filter((role) => role.id !== roleId));
    }
  };

  // Handler for removing a role from the selected list.
  const handleRemoveSelectedRole = (roleId) => {
    const removedRole = selectedRoles.find(role => role.id === roleId);
    if (removedRole) {
      setSelectedRoles(prev => prev.filter(role => role.id !== roleId));
      // Optionally, add the removed role back to available roles.
      setRoles(prev => [...prev, removedRole]);
    }
  };

  // Handler for creating the group.
  const handleCreateClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.groupName,
        description: formData.description,
        roleIds: selectedRoles.map(role => role.id)
      };
      const response = await fetch(`${API_URL}/admin/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Group creation failed, status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuccess("Group created successfully!");
        // Optionally redirect to groups page:
        // navigate("/groups");
      } else {
        throw new Error(data.message || "Failed to create group");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-orange-500 text-white p-2">
        <div className="container mx-auto flex items-center pl-40">
          <div>
            <a href="/" className="text-white">Home</a> &gt; E People
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4 px-4">
        <h1 className="text-2xl font-medium text-gray-800 mb-4 ml-40">Create Group</h1>
        <div className="border-b border-gray-300 mb-4 ml-40 w-[calc(100%-20rem)]"></div>

        {/* Group Form */}
        <form className="mb-8 ml-40 mr-40">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="groupName"
              placeholder="Type your group name here"
              value={formData.groupName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="mb-12">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description *
            </label>
            <input
              type="text"
              name="description"
              placeholder="Describe your group..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
        </form>

        <div className="mb-8 ml-40 mr-40">
          {/* Roles Table */}
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left border border-gray-300">ID</th>
                  <th className="py-2 px-4 text-left border border-gray-300">Name</th>
                  <th className="py-2 px-4 text-left border border-gray-300">Add</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-300">
                    <td className="py-2 px-4 text-sm border border-gray-300">{role.id}</td>
                    <td className="py-2 px-4 border border-gray-300">
                      <span className="text-orange-500">{role.name}</span>
                    </td>
                    <td className="py-2 px-4 text-center border border-gray-300">
                      <button
                        onClick={() => handleAddRole(role.id)}
                        className="rounded border border-gray-300 w-6 h-6 flex items-center justify-center text-orange-500"
                      >
                        +
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Roles Pagination */}
          {roles.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handlePrevRolePage}
                disabled={rolePage === 1}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-l"
              >
                &lt;
              </button>
              {Array.from({ length: totalRolePages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setRolePage(pageNum)}
                  className={`border border-gray-300 px-3 py-1 mx-0.5 ${rolePage === pageNum ? "bg-orange-500 text-white" : "bg-white text-gray-700"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={handleNextRolePage}
                disabled={rolePage === totalRolePages}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-r"
              >
                &gt;
              </button>
            </div>
          )}
          {/* Selected Roles Display */}
          {selectedRoles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800">Selected Roles:</h3>
              <ul className="mt-2">
                {selectedRoles.map((role) => (
                  <li key={role.id} className="flex items-center space-x-2">
                    <span className="text-orange-500">{role.name}</span>
                    <button
                      onClick={() => handleRemoveSelectedRole(role.id)}
                      className="text-red-600 border border-red-600 rounded px-2 py-1 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 ml-40 mr-40">
          <button
            type="button"
            onClick={handleBackClick}
            className="border border-orange-500 text-orange-500 px-4 py-2 rounded flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Save size={16} className="mr-1" />
            Create
          </button>
        </div>

        {success && <p className="text-green-600 mt-3 ml-40 mr-40">{success}</p>}
        {error && <p className="text-red-600 mt-3 ml-40 mr-40">{error}</p>}
      </div>
    </div>
  );
};

export default CreateGroupPage;
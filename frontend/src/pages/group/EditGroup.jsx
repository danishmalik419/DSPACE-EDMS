import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { useParams } from "react-router-dom";

const EditGroupPage = () => {
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For the group details form (only one field: name)
  const [formData, setFormData] = useState({
    name: "",
  });

  // For search users (to add to group)
  const [searchTerm, setSearchTerm] = useState("");
  const [people, setPeople] = useState([]);
  const [peoplePage, setPeoplePage] = useState(1);
  const [totalPeople, setTotalPeople] = useState(0);
  const itemsPerPage = 10;
  const totalPeoplePages = Math.ceil(totalPeople / itemsPerPage);

  // Fetch group details on mount
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/group/${groupId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch group details, status ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setGroupData(data.data);
          setFormData({ name: data.data.name });
        } else {
          throw new Error(data.message || "Failed to fetch group details");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  // Fetch search users on mount (with empty query) and when peoplePage changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/search/user?query=${encodeURIComponent(
            ""
          )}&page=${peoplePage - 1}&limit=${itemsPerPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to search users, status ${response.status}`);
        }
        const data = await response.json();
        if (data.results) {
          setPeople(data.results.results);
          setTotalPeople(data.results.total);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, [peoplePage]);

  // Compute search users that are not already members
  const filteredPeople = people.filter((person) => {
    if (!groupData || !groupData.users) return true;
    return !groupData.users.some((entry) => entry.user.id === person.id);
  });

  // Auto-fetch next page if current page is empty after filtering
  useEffect(() => {
    if (
      filteredPeople.length === 0 &&
      people.length > 0 &&
      peoplePage < totalPeoplePages
    ) {
      setPeoplePage((prev) => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPeople]);

  // Handler for searching users when Search button is clicked
  const handleSearch = async () => {
    try {
      setPeoplePage(1);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/user?query=${encodeURIComponent(
          searchTerm
        )}&page=0&limit=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to search users, status ${response.status}`);
      }
      const data = await response.json();
      if (data.results) {
        setPeople(data.results.results);
        setTotalPeople(data.results.total);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Pagination handlers for search users
  const handlePrevPage = () => {
    if (peoplePage > 1) {
      setPeoplePage(peoplePage - 1);
      handleSearch();
    }
  };

  const handleNextPage = () => {
    if (peoplePage < totalPeoplePages) {
      setPeoplePage(peoplePage + 1);
      handleSearch();
    }
  };

  // Handler for updating group details (Save)
  const handleSaveGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/group/${groupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.name }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update group, status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuccess("Group updated successfully!");
        // Optionally refresh group details
      } else {
        throw new Error(data.message || "Failed to update group");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handler for deleting group
  const handleDeleteGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/group/${groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete group, status ${response.status}`);
      }
      setSuccess("Group deleted successfully!");
      // Redirect or update UI accordingly.
    } catch (err) {
      setError(err.message);
    }
  };

  // Handler for removing a user from the group
  const handleRemoveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/user/remove-from-group`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            groupId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to remove user, status ${response.status}`);
      }
      // Remove the user from groupData.users without a full page refresh.
      setGroupData((prev) => ({
        ...prev,
        users: prev.users.filter((entry) => entry.user.id !== userId),
      }));
      setSuccess("User removed successfully from group");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handler for adding a user to the group
  const handleAddPerson = async (personId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/user/add-to-group`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: personId,
            groupId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to add user, status ${response.status}`);
      }
      // On success, find the person details from the search results and add to groupData.users.
      const addedPerson = people.find((person) => person.id === personId);
      if (addedPerson && groupData) {
        setGroupData((prev) => ({
          ...prev,
          users: [...prev.users, { user: addedPerson }],
        }));
      }
      // Also, remove the added person from the people list.
      setPeople((prev) => prev.filter((person) => person.id !== personId));
      setSuccess("User added successfully to group");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle input change for group form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for Back button
  const handleBackButton = () => {
    window.history.back();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 pl-48">
        <div className="container mx-auto flex items-center">
          <div>
            <a href="/" className="text-white">Home</a> &gt; Edit Group
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4 px-4">
        <h1 className="text-2xl font-medium text-gray-800 mb-6 pl-40">Edit Group</h1>
        <div className="border-b border-gray-400 mb-2 ml-40 mr-28 w-[calc(100%-14rem)]"></div>

        {/* Group Form: Only one field for Group Name */}
        <div className="mb-6 pl-40 pr-40">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Group Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Type group name here"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
          />
          {/* Save and Delete buttons under group name */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-orange-500 text-white px-3 py-2 rounded flex items-center mr-2"
              onClick={handleSaveGroup}
            >
              <Save size={16} className="mr-1" />
              Save
            </button>
            <button
              type="button"
              className="bg-red-700 text-white px-3 py-2 rounded flex items-center"
              onClick={handleDeleteGroup}
            >
              <Trash size={16} className="mr-1" />
              Delete
            </button>
          </div>
        </div>

        {/* Existing Members Table */}
        {groupData && groupData.users && (
          <>
            <h2 className="text-xl font-medium text-gray-800 mb-4 pl-40 pr-40">
              Members of this Group
            </h2>
            <div className="mb-8 pl-40 pr-40">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left border border-gray-300">ID</th>
                    <th className="py-2 px-4 text-left border border-gray-300">Name</th>
                    <th className="py-2 px-4 text-left border border-gray-300">Identity</th>
                    <th className="py-2 px-4 text-center border border-gray-300">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.users.map((entry) => {
                    const user = entry.user;
                    return (
                      <tr key={user.id} className="border-b border-gray-300">
                        <td className="py-2 px-4 text-sm border border-gray-300">{user.id}</td>
                        <td className="py-2 px-4 border border-gray-300">
                          <span className="text-orange-500">
                            {`${user.firstName} ${user.lastName}`}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-sm border border-gray-300">
                          {user.email}
                        </td>
                        <td className="py-2 px-4 text-center border border-gray-300">
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="rounded border border-gray-300 px-2 py-1 text-sm text-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Section to Add E People */}
        <h2 className="text-xl font-medium text-gray-800 mb-4 pl-40 pr-40">
          Add E People
        </h2>
        <div className="flex mb-4 pl-40 pr-40">
          <input
            type="text"
            placeholder="Search E-persons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-orange-500 text-white px-3 py-2 rounded"
          >
            Search
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-2 pl-40 pr-40">
          {people.length > 0
            ? `Now Showing: ${(peoplePage - 1) * itemsPerPage + 1}-${Math.min(
                totalPeople,
                peoplePage * itemsPerPage
              )} of ${totalPeople}`
            : "No results found"}
        </div>

        <div className="pl-40 pr-40">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left border border-gray-300">ID</th>
                <th className="py-2 px-4 text-left border border-gray-300">Name</th>
                <th className="py-2 px-4 text-left border border-gray-300">Identity</th>
                <th className="py-2 px-4 text-left border border-gray-300">Add</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => (
                <tr key={person.id} className="border-b border-gray-300">
                  <td className="py-2 px-4 text-sm border border-gray-300">{person.id}</td>
                  <td className="py-2 px-4 border border-gray-300">
                    <span className="text-orange-500">{`${person.firstName} ${person.lastName}`}</span>
                  </td>
                  <td className="py-2 px-4 text-sm border border-gray-300">{person.email}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    <button
                      onClick={() => handleAddPerson(person.id)}
                      className="rounded border border-gray-300 w-6 h-6 flex items-center justify-center"
                    >
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls for search users */}
        {people.length > 0 && (
          <div className="flex justify-center mt-6 pl-40 pr-40">
            <div className="flex">
              <button
                onClick={handlePrevPage}
                disabled={peoplePage === 1}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-l"
              >
                &lt;
              </button>
              {Array.from({ length: totalPeoplePages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPeoplePage(pageNum);
                    handleSearch();
                  }}
                  className={`border border-gray-300 px-3 py-1 mx-0.5 ${
                    peoplePage === pageNum ? "bg-orange-500 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={peoplePage === totalPeoplePages}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-r"
              >
                &gt;
              </button>
            </div>
          </div>
        )}

        {/* Back Button at the end */}
        <div className="flex justify-end mt-6 pl-40 pr-40">
          <button
            type="button"
            onClick={handleBackButton}
            className="border border-orange-500 text-orange-500 px-3 py-2 rounded flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupPage;
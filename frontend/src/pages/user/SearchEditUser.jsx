import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchEditUser = () => {
  const [userSearch, setUserSearch] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // Fetch users based on the search term.
  const fetchUsers = async (searchTerm) => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/user?query=${searchTerm}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      const users = data.results ? data.results.results : data.data;
      setFetchedUsers(users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update search results when the search term changes.
  useEffect(() => {
    fetchUsers(userSearch);
  }, [userSearch]);

  // When a user is selected, navigate to the EditUser page.
  const handleSelectUser = (user) => {
    navigate(`/editUser/${user.id}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-orange-500 text-white p-4 pl-44">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-white">Home</a> &gt; Search Edit User
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4 px-4 pl-44 pr-44">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h1 className="text-2xl font-medium text-gray-700 mb-6">Search User</h1>
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search for a user to edit"
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner">
            {loadingUsers ? (
              <p className="text-center text-gray-600 text-sm">Loading...</p>
            ) : fetchedUsers.length > 0 ? (
              fetchedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="font-medium mb-1 text-base">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 text-sm">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEditUser;
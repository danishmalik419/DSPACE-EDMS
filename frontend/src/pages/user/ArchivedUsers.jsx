import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ArchivedUser() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState("");
  
  // searchQuery is updated on every keystroke; appliedSearchQuery is used to actually fetch data.
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  
  // Fetch users when page or appliedSearchQuery changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    const fetchUsers = async () => {
      try {
        // Update the URL to include the query if appliedSearchQuery is provided
        const url = `${API_URL}/librarian/user/all?page=${page}&size=${size}&query=${encodeURIComponent(appliedSearchQuery)}&isArchived=true`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const res = await response.json();
        let data = res.data.data;
        setUsers(data);
        setTotalPages(res.data.totalPages);
        setTotalUsers(res.data.totalUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      }
    };

    fetchUsers();
  }, [page, appliedSearchQuery, API_URL, size]);

  const handleSearch = (e) => {
    e.preventDefault();
    // When search button is clicked, reset page to 0 and update appliedSearchQuery.
    setPage(0);
    setAppliedSearchQuery(searchQuery);
  };

  const handleNextPage = () => {
    if (page + 1 < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber - 1);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const handleDelete = (userId) => {
    console.log("Delete user:", userId);
  };

  return (
    <>
      <div className="bg-orange-500 px-5 py-3 text-white mb-5">
        <div className="text-sm">
          <span className="font-bold ml-28 cursor-pointer" onClick={() => navigate("/")}>
            Home
          </span>
          &gt; <span className="font-bold">E People</span>
        </div>
      </div>

      <div className="font-sans max-w-6xl mx-auto px-4">
        {/* Title and add user button */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-gray-800 font-normal text-xl">E People</h2>
        </div>

        {/* Search bar */}
        <div className="mb-5">
          <form onSubmit={handleSearch} className="flex border border-gray-300 bg-gray-100 p-3 rounded">
            <input
              type="text"
              placeholder="Search E person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded mr-3 text-sm"
            />
            <button 
              type="submit"
              className="bg-orange-500 text-white border-none py-2 px-4 rounded mr-3 text-sm hover:bg-orange-600"
            >
              Search
            </button>
          </form>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        {/* User table */}
        <div className="mb-5 overflow-x-auto border border-gray-300 rounded">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 border-b border-gray-300 font-normal text-gray-700">ID</th>
                <th className="text-left py-3 px-4 border-b border-gray-300 font-normal text-gray-700">Name</th>
                <th className="text-left py-3 px-4 border-b border-gray-300 font-normal text-gray-700">Email</th>
                <th className="text-left py-3 px-4 border-b border-gray-300 font-normal text-gray-700">Edit</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-500 font-mono break-all">{user.id}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700 break-all text-sm">
                      {user.firstName + " " + (user.lastName || "")}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700 break-all text-sm">{user.email}</td>
                    <td className="py-3 px-4 border-b border-gray-200 flex gap-1 justify-center">
                      <button
                        className="bg-transparent border-none cursor-pointer p-0 text-base text-gray-600 hover:text-orange-500"
                        onClick={() => handleEdit(user.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer p-0 text-base text-gray-600 hover:text-orange-500"
                        onClick={() => handleDelete(user.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-1 my-5">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page <= 0}
            className={`px-3 py-1 border border-gray-300 min-w-8 text-gray-700 ${page <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-1 border min-w-8 ${page === pageNum - 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className={`px-3 py-1 border border-gray-300 min-w-8 text-gray-700 ${page >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
}

export default ArchivedUser;
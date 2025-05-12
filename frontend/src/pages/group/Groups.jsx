import React, { useState, useEffect } from "react";
import { Search, Edit2, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GroupsPage = () => {
  const navigate = useNavigate();

  // State for groups fetched from API
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);

  // State for search input (controlled by user) and applied search term (used for API call)
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalGroups / itemsPerPage);

  // Function to fetch groups from API
  const fetchGroups = async (page, keyword) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/group?page=${page - 1}&limit=${itemsPerPage}&keyword=${encodeURIComponent(keyword)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        console.error("Failed to fetch groups", response.status);
        return;
      }
      const data = await response.json();
      if (data.success) {
        // Map each group to add a "members" alias for _count.users
        const groupsWithMembers = data.data.groups.map((group) => ({
          ...group,
          members: group._count.users,
        }));
        setGroups(groupsWithMembers);
        setTotalGroups(data.data.total);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // On initial mount and when currentPage or appliedSearchTerm changes, fetch groups.
  useEffect(() => {
    fetchGroups(currentPage, appliedSearchTerm);
  }, [currentPage, appliedSearchTerm]);

  // Handle search button click: apply the current search term and reset to page 1.
  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-orange-500 text-white p-2">
        <div className="container mx-auto flex items-center pl-40">
          <div>
            <a href="/" className="text-white">Home</a> &gt; E People
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4 px-11">
        <div className="flex justify-between items-center mb-4 pl-28 pr-28">
          <h1 className="text-3xl font-medium text-gray-800">Groups</h1>
          <button
            className="border border-orange-500 text-orange-500 px-3 py-2 rounded flex items-center"
            onClick={() => navigate("/createGroup")}
          >
            <span className="mr-1">+</span>
            Add Group
          </button>
        </div>

        <div className="border-b border-gray-400 mb-4 ml-28 mr-28 w-[calc(100%-14rem)]"></div>

        <div className="flex mb-4 pl-28 pr-28">
          <input
            type="text"
            placeholder="Search Group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-orange-500 text-white px-4 py-2 flex items-center rounded-r"
          >
            <Search size={18} />
            <span className="ml-1">Search</span>
          </button>
        </div>

        <div className="mb-4 pl-28 pr-28">
          <div className="text-sm text-gray-600 mb-2">
            Now Showing: {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(totalGroups, currentPage * itemsPerPage)} of {totalGroups}
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-t border-b border-gray-300">
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">ID</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">Name</th>
                <th className="py-3 px-4 text-center font-medium text-gray-700 border-r border-gray-300">Members</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Edit</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-gray-300 hover:bg-white">
                  <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-300">{group.id}</td>
                  <td className="py-3 px-4 border-r border-gray-300">
                    <span className="text-orange-500">{group.name}</span>
                  </td>
                  <td className="py-3 px-4 text-center border-r border-gray-300">{group.members}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => navigate(`/editGroup/${group.id}`)}
                        className="border border-gray-300 p-1 rounded"
                      >
                        <Edit2 size={16} className="text-gray-600" />
                      </button>
                      <button className="border border-gray-300 p-1 rounded">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <div className="flex">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border border-gray-300 px-3 py-1 mx-1 rounded-l"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`border border-gray-300 px-3 py-1 mx-0.5 ${
                  currentPage === pageNum ? "bg-orange-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border border-gray-300 px-3 py-1 mx-1 rounded-r"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
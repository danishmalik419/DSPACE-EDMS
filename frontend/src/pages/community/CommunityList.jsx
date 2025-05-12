import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const CommunityHierarchy = () => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/browse/hierarchy`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }
      const data = await response.json();
      // Assuming the API returns the hierarchy in data.data
      setHierarchy(data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Recursive function to render a community with any nested sub-communities
  const renderCommunity = (community, level = 0) => {
    return (
      <div key={community.id} style={{ marginLeft: `${level * 1.5}rem` }} className="my-1">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => toggleExpand(community.id)}
        >
          <span className="inline-block w-4 mr-2 text-gray-500">
            {expandedItems.includes(community.id) ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </span>
          <span className="text-orange-500 font-medium">{community.name}</span>
          {community.subCommunities && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {community.subCommunities.length} Sub-communities
            </span>
          )}
          {community.collections && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {community.collections.length} Collections
            </span>
          )}
        </div>
        {expandedItems.includes(community.id) && (
          <div className="ml-4 mt-1">
            {community.description && (
              <p className="text-sm text-gray-500">{community.description}</p>
            )}
            {community.collections &&
              community.collections.map((collection) => (
                <div key={collection.id} className="ml-4 mt-2">
                  <div className="flex items-center">
                    <span className="text-gray-700 font-medium">{collection.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {collection.itemCount} items
                    </span>
                  </div>
                </div>
              ))}
            {community.subCommunities &&
              community.subCommunities.map((sub) =>
                renderCommunity(sub, level + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-orange-500 text-white py-2 px-4 pl-48">
        <a href="/" className="text-white">Home</a> &gt; List of Communities
      </div>
      <div className="p-6 pl-44">
        <h1 className="text-3xl font-medium text-gray-800 mb-6">
          List Of Communities
        </h1>
        <div className="space-y-6">
          {hierarchy.length > 0 ? (
            hierarchy.map((community) => renderCommunity(community, 0))
          ) : (
            <p>No communities found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHierarchy;
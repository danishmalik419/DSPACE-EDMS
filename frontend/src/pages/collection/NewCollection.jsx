import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NewCollection() {
  // Form state management
  const [name, setName] = useState("");
  const [introductoryText, setIntroductoryText] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [news, setNews] = useState("");
  const [communityId, setCommunityId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [formView, setFormView] = useState("communitySelection"); // initial view

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Community search state
  const [communitySearch, setCommunitySearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const navigate = useNavigate();

  // File handling
  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0] || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      setLogoFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Fetch communities based on search term
  const fetchCommunities = async (searchTerm) => {
    setLoadingCommunities(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/community?query=${searchTerm}&isArchived=false`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      const data = await response.json();
      const communities = data.results.results;
      // Assuming API returns an array in data.data
      setCommunities(communities || []);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to fetch communities. Please try again.");
    } finally {
      setLoadingCommunities(false);
    }
  };

  // When communitySearch changes, fetch matching communities
  useEffect(() => {
    fetchCommunities(communitySearch);
  }, [communitySearch]);

  // Navigation handlers
  const handleCreateTopLevel = () => {
    setCommunityId(null);
    setFormView("createForm");
  };

  const handleSelectCommunity = (id) => {
    setCommunityId(id.toString());
    setFormView("createForm");
  };

  const handleBackToSelection = () => {
    setFormView("communitySelection");
  };

  // Form submission handler: create collection with communityId in payload.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const collectionObject = {
        name,
        introductoryText,
        shortDescription,
        copyrightText,
        news,
        communityId, // Using communityId (top-level if null, else selected community)
      };
      const collectionJSON = JSON.stringify(collectionObject);

      const formData = new FormData();
      formData.set("collection", collectionJSON);
      if (logoFile) {
        formData.set("logo", logoFile);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/collection/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const message = `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      await response.json();
      setSuccess("Collection created successfully!");
    } catch (err) {
      console.error("Error creating Collection:", err);
      setError(err.message || "Failed to create Collection. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans shadow-lg rounded-lg overflow-hidden my-5">
      <div className="bg-orange-500 text-white p-4 text-left font-semibold text-xl shadow-md">
        Create a Collection
      </div>

      <div className="bg-white">
        <div className="p-6">
          {formView === "communitySelection" ? (
            <>
              <button
                className="w-full p-4 bg-white border border-gray-200 rounded-lg text-center mb-5 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-md text-base font-medium text-gray-700"
                onClick={handleCreateTopLevel}
              >
                Create a top-level Collection
              </button>
              
              <div className="text-center my-6 relative text-gray-500 font-medium">
                <div className="absolute top-1/2 left-0 w-2/5 h-px bg-gray-200"></div>
                Or
                <div className="absolute top-1/2 right-0 w-2/5 h-px bg-gray-200"></div>
              </div>
              
              <p className="mb-4 text-base text-gray-700">
                Create a Collection in Community:
              </p>
              
              <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Search for a community"
                  className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base"
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner">
                {loadingCommunities ? (
                  <p className="text-center text-gray-600 text-sm">Loading...</p>
                ) : communities.length > 0 ? (
                  communities.map((community) => (
                    <div
                      key={community.id}
                      className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                      onClick={() => handleSelectCommunity(community.id)}
                    >
                      <div className="font-medium mb-1 text-base">
                        {community.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {community.shortDescription || "No description available."}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 text-sm">No communities found</p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  Name: *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type collection name here"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  Introductory Text (HTML):
                </label>
                <textarea
                  value={introductoryText}
                  onChange={(e) => setIntroductoryText(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type introductory text here"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  Short Description:
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type short description here"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  Copyright text (HTML):
                </label>
                <textarea
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type copyright text here"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  News (HTML):
                </label>
                <textarea
                  value={news}
                  onChange={(e) => setNews(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type news here"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium text-base text-gray-700">
                  Logo:
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-5 bg-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-gray-400"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <div className="text-base text-gray-600">
                    Drop your files here, or <span className="text-orange-500 font-medium">click to browse</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {logoFile ? `Selected file: ${logoFile.name}` : "Drag and drop files here"}
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-5">
                <button 
                  type="button" 
                  className="px-5 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={handleBackToSelection}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                  Save
                </button>
              </div>

              {success && <p className="text-green-600 mt-3">{success}</p>}
              {error && <p className="text-red-600 mt-3">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewCollection;
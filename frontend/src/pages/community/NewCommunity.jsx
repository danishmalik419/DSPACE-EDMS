import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NewCommunity() {
  // Form states
  const [name, setName] = useState("");
  const [introductoryText, setIntroductoryText] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [news, setNews] = useState("");
  const [parentCommunity, setParentCommunity] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [formView, setFormView] = useState("parentSelection"); 

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for dynamic community search (parent selection)
  const [communitySearch, setCommunitySearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const communityObject = {
        name,
        introductoryText,
        shortDescription,
        copyrightText,
        news,
        parentCommunity, // null for top-level, or parent's id for sub-community
      };
      const communityJSON = JSON.stringify(communityObject);

      const formData = new FormData();
      formData.set("community", communityJSON);
      if (logoFile) {
        formData.set("logo", logoFile);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/community/create`,
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
      setSuccess("Community created successfully!");
    } catch (err) {
      console.error("Error creating community:", err);
      setError(err.message || "Failed to create community. Please try again.");
    }
  };

  // Fetch communities from API based on communitySearch query.
  const fetchCommunities = async (searchTerm) => {
    setLoadingCommunities(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/community?query=${searchTerm}&isArchived=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Community search failed with status ${response.status}`);
      }
      const data = await response.json();
      const communitiesRes = data.results.results;
      // Assuming the API returns an array of community objects.
      setCommunities(communitiesRes);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to fetch communities. Please try again.");
    } finally {
      setLoadingCommunities(false);
    }
  };

  // When the community search term changes, fetch communities.
  useEffect(() => {
    fetchCommunities(communitySearch);
  }, [communitySearch]);

  const handleCreateTopLevel = () => {
    setParentCommunity(null);
    setFormView("createForm");
  };

  const handleSelectParent = (communityId) => {
    setParentCommunity(communityId.toString());
    setFormView("createForm");
  };

  const handleBackToSelection = () => {
    setFormView("parentSelection");
  };

  return (
    <div className="w-full font-sans shadow-lg rounded-lg overflow-hidden mx-auto my-5 max-w-4xl">
      <div className="bg-orange-500 text-white py-4 px-6 text-left font-semibold text-xl shadow-md">
        Create a Community
      </div>
      <div className="p-0 bg-white">
        <div className="bg-white w-full mx-auto rounded-b-lg">
          <div className="p-6 md:p-8">
            {formView === "parentSelection" ? (
              <>
                <button
                  className="block w-full py-4 px-4 bg-white border border-gray-200 rounded-md text-center mb-5 cursor-pointer transition-all duration-200 font-medium text-base text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow-md"
                  onClick={handleCreateTopLevel}
                >
                  Create a top-level Community
                </button>
                <div className="text-center my-6 text-gray-500 relative font-medium">
                  <div className="absolute top-1/2 left-0 w-2/5 h-px bg-gray-200"></div>
                  Or
                  <div className="absolute top-1/2 right-0 w-2/5 h-px bg-gray-200"></div>
                </div>
                <p className="mb-4 text-base text-gray-700">
                  Create a Sub-Community in
                </p>
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    🔍
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a community"
                    className="w-full py-3 px-4 pl-10 border border-gray-200 rounded-md mt-1.5 mb-3 text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-1.5 shadow-inner">
                  {loadingCommunities ? (
                    <p className="text-center text-gray-600 text-sm">Loading...</p>
                  ) : communities.length > 0 ? (
                    communities.map((community) => (
                      <div
                        key={community.id}
                        className="p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 rounded-md mb-1.5 hover:bg-gray-100"
                        onClick={() => handleSelectParent(community.id)}
                      >
                        <div className="font-medium mb-1 text-base">
                          {community.name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {community.shortDescription}
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
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    Name: *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full py-3 px-4 border border-gray-200 rounded-md mt-1.5 mb-5 text-sm transition-all duration-200 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your name here"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    Introductory Text (HTML):
                  </label>
                  <textarea
                    value={introductoryText}
                    onChange={(e) => setIntroductoryText(e.target.value)}
                    rows={3}
                    className="w-full py-3 px-4 border border-gray-200 rounded-md mt-1.5 mb-5 text-sm transition-all duration-200 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your text here"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    Short Description:
                  </label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={2}
                    className="w-full py-3 px-4 border border-gray-200 rounded-md mt-1.5 mb-5 text-sm transition-all duration-200 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your text here"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    Copyright text (HTML):
                  </label>
                  <textarea
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    rows={2}
                    className="w-full py-3 px-4 border border-gray-200 rounded-md mt-1.5 mb-5 text-sm transition-all duration-200 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your text here"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    News (HTML):
                  </label>
                  <textarea
                    value={news}
                    onChange={(e) => setNews(e.target.value)}
                    rows={2}
                    className="w-full py-3 px-4 border border-gray-200 rounded-md mt-1.5 mb-5 text-sm transition-all duration-200 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your text here"
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-1.5 font-medium text-sm text-gray-700">
                    Logo:
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md py-8 px-5 text-center mb-5 bg-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-gray-400"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById("file-input").click()}
                  >
                    <div className="text-gray-600 text-base">
                      Drop your files here, or{" "}
                      <span className="text-orange-500 font-medium">
                        click to browse
                      </span>
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
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    className="py-2.5 px-4 bg-gray-100 text-gray-700 border border-gray-300 rounded-md cursor-pointer font-medium transition-all duration-200 text-sm hover:bg-gray-200"
                    onClick={handleBackToSelection}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-orange-500 text-white border-none rounded-md cursor-pointer font-medium transition-all duration-200 text-sm shadow-md hover:bg-orange-600"
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
    </div>
  );
}

export default NewCommunity;
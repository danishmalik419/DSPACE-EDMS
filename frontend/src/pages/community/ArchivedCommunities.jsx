import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ArchivedCommunity() {
  // Form state for editing community details
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [name, setName] = useState("");
  const [introductoryText, setIntroductoryText] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [news, setNews] = useState("");
  const [parentCommunity, setParentCommunity] = useState(null);
  // For logo handling: new logo file and existing logo details
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  // formView: "search" for searching a community to edit; "editForm" for editing selected community.
  const [formView, setFormView] = useState("search");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for dynamic community search
  const [communitySearch, setCommunitySearch] = useState("");
  const [fetchedCommunities, setFetchedCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const navigate = useNavigate();

  // Logo file handling: validate type and size before setting state.
  const handleLogoChange = (e) => {
    const file = e.target.files[0] || null;
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
        return;
      }
      if (file.size > maxSize) {
        setError("File is too large. Maximum allowed size is 2MB.");
        return;
      }
      setLogoFile(file);
      setError("");
    } else {
      setLogoFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 2 * 1024 * 1024;
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
        return;
      }
      if (file.size > maxSize) {
        setError("File is too large. Maximum allowed size is 2MB.");
        return;
      }
      setLogoFile(file);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Fetch communities from API based on search term.
  const fetchCommunities = async (searchTerm) => {
    setLoadingCommunities(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/community?query=${searchTerm}&isArchived=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      // API may return either { results: { results: [...] } } or { data: [...] }
      const communities = data.results ? data.results.results : data.data;
      setFetchedCommunities(communities || []);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to fetch communities. Please try again.");
    } finally {
      setLoadingCommunities(false);
    }
  };

  // Trigger community search when the search term changes.
  useEffect(() => {
    fetchCommunities(communitySearch);
  }, [communitySearch]);

  // When a community is selected, fetch its full details.
  const handleSelectCommunity = async (community) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/community/${community.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch community details");
      }
      const data = await response.json();
      if (data.success) {
        const comm = data.data;
        setSelectedCommunityId(comm.id);
        setName(comm.name);
        setIntroductoryText(comm.introductoryText || "");
        setShortDescription(comm.shortDescription || "");
        setCopyrightText(comm.copyrightText || "");
        setNews(comm.news || "");
        setParentCommunity(comm.parentCommunity); // may be null
        // Save existing logo if thumbnail exists with valid properties.
        if (comm.thumbnail && comm.thumbnail.name && comm.thumbnail.size && comm.thumbnail.type) {
          setExistingLogo(comm.thumbnail);
        } else {
          setExistingLogo(null);
        }
        setFormView("editForm");
      }
    } catch (err) {
      console.error("Error fetching community details:", err);
      setError("Failed to fetch community details.");
    }
  };

  // Allows user to return to the community search view.
  const handleBackToSelection = () => {
    setFormView("search");
  };

  // Form submission handler for updating community details (excluding logo)
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
        parentCommunity,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      // Update community details (JSON body) at /admin/community/edit/:communityId
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/community/edit/${selectedCommunityId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(communityObject),
        }
      );

      if (!response.ok) {
        const message = `Update community failed with status ${response.status}`;
        throw new Error(message);
      }

      await response.json();
      setSuccess("Community updated successfully!");

      // If a new logo file is selected, update the thumbnail separately.
      if (logoFile) {
        const formData = new FormData();
        formData.append("thumbnail", logoFile);
        const thumbResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/file/thumbnail/${selectedCommunityId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        if (!thumbResponse.ok) {
          throw new Error(`Thumbnail update failed with status ${thumbResponse.status}`);
        }
        await thumbResponse.json();
      }
    } catch (err) {
      console.error("Error editing Community:", err);
      setError(err.message || "Failed to edit Community. Please try again.");
    }
  };

  // Archive Community handler.
  const handleArchiveCommunity = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in first.");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/community/archive/${selectedCommunityId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to archive community, status ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setSuccess("Community archived successfully!");
      } else {
        throw new Error(data.message || "Failed to archive community");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="bg-orange-500 text-white p-4 pl-44">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-white">
              Home
            </a>{" "}
            &gt; Edit Community
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleArchiveCommunity}
              className="border border-white-500 text-white-500 px-3 py-1 rounded text-sm flex items-center"
            >
              <span className="mr-1">📥</span> Archive Community
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto font-sans shadow-lg rounded-lg overflow-hidden my-5">
        {formView === "search" && (
          <div className="bg-white p-6">
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                🔍
              </div>
              <input
                type="text"
                placeholder="Search for a community to edit"
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base"
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
              />
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner">
              {loadingCommunities ? (
                <p className="text-center text-gray-600 text-sm">Loading...</p>
              ) : fetchedCommunities.length > 0 ? (
                fetchedCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                    onClick={() => handleSelectCommunity(community)}
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
          </div>
        )}

        {formView === "editForm" && (
          <div className="bg-white p-6">
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
                  placeholder="Type community name here"
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

              {/* Logo Section */}
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
                    {logoFile
                      ? `New logo selected: ${logoFile.name}`
                      : existingLogo && existingLogo.size && existingLogo.type
                      ? `Current logo: ${existingLogo.name} (${Math.round(existingLogo.size / 1024)}KB, ${existingLogo.type})`
                      : "Drop your files here, or click to browse"}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {logoFile
                      ? `Selected file: ${logoFile.name}`
                      : "Drag and drop files here"}
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
          </div>
        )}
      </div>
    </>
  );
}

export default ArchivedCommunity;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditCollection() {
  // Form state management for editing
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [name, setName] = useState("");
  const [introductoryText, setIntroductoryText] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [news, setNews] = useState("");
  // Instead of parentCollection, we use communityId
  const [communityId, setCommunityId] = useState(null);
  // For logo handling
  const [logoFile, setLogoFile] = useState(null);
  // Store the existing logo details from the fetched collection details
  const [existingLogo, setExistingLogo] = useState(null);
  // formView: "search" for searching a collection to edit, "editForm" for editing selected collection.
  const [formView, setFormView] = useState("search");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for dynamic collection search
  const [collectionSearch, setCollectionSearch] = useState("");
  const [fetchedCollections, setFetchedCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const navigate = useNavigate();

  // ----- Logo file handling -----
  const handleLogoChange = (e) => {
    const file = e.target.files[0] || null;
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.");
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
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.");
        return;
      }
      setLogoFile(file);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ----- Fetch collections from API based on search term -----
  const fetchCollections = async (searchTerm) => {
    setLoadingCollections(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/search/collection?query=${searchTerm}&isArchived=false`,
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
      // Assuming API returns either { results: { results: [...] } } or { data: [...] }
      const collections = data.results ? data.results.results : data.data;
      setFetchedCollections(collections || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError("Failed to fetch collections. Please try again.");
    } finally {
      setLoadingCollections(false);
    }
  };

  // Trigger collection search when the search term changes.
  useEffect(() => {
    fetchCollections(collectionSearch);
  }, [collectionSearch]);

  // When a collection is selected, fetch its full details.
  const handleSelectCollection = async (collection) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/collection/${collection.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch collection details");
      }
      const data = await response.json();
      if (data.success) {
        const coll = data.data;
        setSelectedCollectionId(coll.id);
        setCommunityId(coll.community.id);
        setName(coll.name);
        setIntroductoryText(coll.introductoryText || "");
        setShortDescription(coll.shortDescription || "");
        setCopyrightText(coll.copyrightText || "");
        setNews(coll.news || "");
        // Store existing logo only if available with valid properties.
        if (
          coll.thumbnail &&
          coll.thumbnail.name &&
          coll.thumbnail.size &&
          coll.thumbnail.type
        ) {
          setExistingLogo(coll.thumbnail);
        } else {
          setExistingLogo(null);
        }
        setFormView("editForm");
      }
    } catch (err) {
      console.error("Error fetching collection details:", err);
      setError("Failed to fetch collection details.");
    }
  };

  // Allows the user to return to the collection search view.
  const handleBackToSelection = () => {
    setFormView("search");
  };

  // ----- Form submission handler for updating the collection (non-logo fields) -----
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
        communityId,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      // Call update collection API (JSON body)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/collection/edit/${selectedCollectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(collectionObject),
        }
      );

      if (!response.ok) {
        const message = `Update collection failed with status ${response.status}`;
        throw new Error(message);
      }

      await response.json();
      setSuccess("Collection updated successfully!");

      // If a new logo file is selected, call the updateThumbnail API separately.
      if (logoFile) {
        const formData = new FormData();
        formData.append("thumbnail", logoFile);
        const thumbResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/file/thumbnail/${selectedCollectionId}`,
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
      console.error("Error editing Collection:", err);
      setError(err.message || "Failed to edit Collection. Please try again.");
    }
  };

  // ----- Archive Collection Handler -----
  const handleArchiveCollection = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in first.");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/collection/archive/${selectedCollectionId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to archive collection, status ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setSuccess("Collection archived successfully!");
      } else {
        throw new Error(data.message || "Failed to archive collection");
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
            &gt; Edit Collection
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleArchiveCollection}
              className="border border-white-500 text-white-500 px-3 py-1 rounded text-sm flex items-center"
            >
              <span className="mr-1">📥</span> Archive Collection
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
                placeholder="Search for a collection to edit"
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
              />
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner">
              {loadingCollections ? (
                <p className="text-center text-gray-600 text-sm">Loading...</p>
              ) : fetchedCollections.length > 0 ? (
                fetchedCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <div className="font-medium mb-1 text-base">
                      {collection.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {collection.shortDescription || "No description available."}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 text-sm">No collections found</p>
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
                  onClick={() => setFormView("search")}
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

export default EditCollection;
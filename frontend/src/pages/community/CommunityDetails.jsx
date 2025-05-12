import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function CommunityDetails() {
  const { communityId } = useParams(); // from URL: /communities/:communityId
  const navigate = useNavigate();

  // ----- State for fetching & displaying community info
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----- State for create collection form
  const [collectionName, setCollectionName] = useState("");
  const [introText, setIntroText] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [news, setNews] = useState("");
  const [license, setLicense] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // ----- For success/error feedback when creating a collection
  const [collectionError, setCollectionError] = useState("");
  const [collectionSuccess, setCollectionSuccess] = useState("");

  // ---------------------------------------------------------
  // 1) FETCH COMMUNITY DETAILS ON MOUNT
  // ---------------------------------------------------------
  useEffect(() => {
    if (!communityId) {
      setError("No community ID provided.");
      setLoading(false);
      return;
    }
    fetchCommunityDetails(communityId);
  }, [communityId]);

  const fetchCommunityDetails = async (id) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      let headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/community/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const res = await response.json();
      const data = res.data;
      setCommunity(data);
    } catch (err) {
      console.error("Error fetching community details:", err);
      setError(err.message || "Failed to fetch community details");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2) HANDLE FORM SUBMIT TO CREATE A COLLECTION
  // ---------------------------------------------------------
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setCollectionError("");
    setCollectionSuccess("");

    try {
      // Build the 'collection' JSON object
      const collectionObj = {
        name: collectionName,
        introductoryText: introText,
        shortDescription: shortDesc,
        copyrightText,
        news,
        license,
        communityId // we rely on the param from the current page
      };

      // Convert to JSON string
      const collectionJSON = JSON.stringify(collectionObj);

      // Prepare FormData
      const formData = new FormData();
      formData.append("collection", collectionJSON); // as text field (key: "collection")
      if (logoFile) {
        formData.append("logo", logoFile); // file field (key: "logo")
      }

      // Get token for auth
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      // Send POST request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/collection/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
          // Do NOT set Content-Type for FormData; let the browser handle it
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setCollectionSuccess("Collection created successfully!");
      console.log("Collection creation response:", data);

      // Optionally, you could reset form fields here
    //   setCollectionName("");
    //   setIntroText("");
    //   setShortDesc("");
    //   setCopyrightText("");
    //   setNews("");
    //   setLicense("");
    //   setLogoFile(null);

    } catch (err) {
      console.error("Error creating collection:", err);
      setCollectionError(err.message || "Failed to create collection");
    }
  };

  // 3) RENDER COMMUNITY DETAILS OR LOADING/ERROR
  if (loading) return <p>Loading community details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!community) return <p>No community data found.</p>;

  return (
    <div style={{ margin: "20px" }}>
      {/* ---------------- COMMUNITY DETAILS ---------------- */}
      <h2>Community: {community.name}</h2>
      {community.introductoryText && (
        <p>
          <strong>Intro:</strong> {community.introductoryText}
        </p>
      )}
      {community.shortDescription && (
        <p>
          <strong>Description:</strong> {community.shortDescription}
        </p>
      )}
      {community.news && (
        <p>
          <strong>News:</strong> {community.news}
        </p>
      )}
      {community.parentCommunity && (
        <p>
          <strong>Parent:</strong> {community.parentCommunity}
        </p>
      )}

      <button onClick={() => navigate(-1)}>Go Back</button>

      <hr style={{ margin: "20px 0" }} />

      {/* ---------------- CREATE COLLECTION FORM ---------------- */}
      <h3>Create a Collection inside this Community</h3>

      <form onSubmit={handleCreateCollection} style={{ maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Name:
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Introductory Text:
          <textarea
            rows={2}
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Short Description:
          <textarea
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Copyright Text:
          <textarea
            rows={2}
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          News:
          <textarea
            rows={2}
            value={news}
            onChange={(e) => setNews(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          License:
          <input
            type="text"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Logo (optional):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
            style={{ marginTop: "4px" }}
          />
        </label>

        <button type="submit">Create Collection</button>
      </form>

      {/* SUCCESS OR ERROR MESSAGES */}
      {collectionSuccess && <p style={{ color: "green" }}>{collectionSuccess}</p>}
      {collectionError && <p style={{ color: "red" }}>{collectionError}</p>}
    </div>
  );
}

export default CommunityDetails;
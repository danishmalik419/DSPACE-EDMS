import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function CollectionDetails() {
  const { collectionId } = useParams();  // e.g. /collections/123
  const navigate = useNavigate();

  // --------------------------
  // 1) Collection Details State
  // --------------------------
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------
  // 2) "Create Item" Form State
  // --------------------------
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");       // We'll parse into an array
  const [publisher, setPublisher] = useState("");
  const [language, setLanguage] = useState("");
  const [subjectKeywords, setSubjectKeywords] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [licenseConfirmed,  setLicenseConfirmed] = useState("false");

  // Mandatory fields
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [types, setTypes] = useState(""); // we'll parse into an array

  // Multiple file uploads
  const [files, setFiles] = useState([]);

  // For success/error feedback
  const [itemError, setItemError] = useState("");
  const [itemSuccess, setItemSuccess] = useState("");

  // --------------------------
  // 3) Fetch Collection Details on Mount
  // --------------------------
  useEffect(() => {
    if (!collectionId) {
      setError("No collection ID provided.");
      setLoading(false);
      return;
    }
    fetchCollectionDetails(collectionId);
  }, [collectionId]);

  const fetchCollectionDetails = async (id) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      let headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/collection/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();
      const data = json.data;
      setCollection(data); // e.g. { name, introductoryText, ... }
    } catch (err) {
      console.error("Error fetching collection details:", err);
      setError(err.message || "Failed to fetch collection details.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // 4) Handle "Create Item" Form Submission
  // --------------------------
  const handleCreateItem = async (e) => {
    e.preventDefault();
    setItemError("");
    setItemSuccess("");

    try {
      // Parse authors as array
      const authorsArray = authors
        .split(",")
        .map((author) => author.trim())
        .filter((a) => a.length > 0);

      // Parse types as array
      const typesArray = types
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Build the item object
      const itemObj = {
        title,
        authors: authorsArray,
        publisher,
        language,
        subjectKeywords,
        abstract: abstractText,
        description,
        // Mandatory fields
        dateOfIssue, // e.g. "2023-10-15" (ISO date string)
        types: typesArray,
        licenseConfirmed: licenseConfirmed=="true",
        // Link to this collection
        collectionId,
      };

      // Convert to JSON
      const itemJSON = JSON.stringify(itemObj);

      // Build FormData
      const formData = new FormData();
      formData.append("item", itemJSON); // 'item' field as JSON string

      // Attach multiple files (if any)
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      if(thumbnail!=null){
        formData.append("thumbnail", thumbnail);
      }

      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage. Please log in first.");
      }

      if(!licenseConfirmed){
        throw new Error("License is not accepted");
      }

      // Send POST request to create item
      const response = await fetch(`${import.meta.env.VITE_API_URL}/item/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT manually set Content-Type for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setItemSuccess("Item created successfully!");
      console.log("Create Item Response:", data);

      // Optionally reset form fields
    //   setTitle("");
    //   setAuthors("");
    //   setPublisher("");
    //   setLanguage("");
    //   setSubjectKeywords("");
    //   setAbstractText("");
    //   setDescription("");
    //   setDateOfIssue("");
    //   setTypes("");
    //   setFiles([]);
    //   setThumbnail(null);
    // setLicenseConfirmed("false");

    } catch (err) {
      console.error("Error creating item:", err);
      setItemError(err.message || "Failed to create item.");
    }
  };

  // --------------------------
  // 5) Render
  // --------------------------
  if (loading) return <p>Loading collection details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!collection) return <p>No collection data found.</p>;

  return (
    <div style={{ margin: "20px" }}>
      <h2>Collection: {collection.name}</h2>
      {collection.introductoryText && (
        <p>
          <strong>Intro:</strong> {collection.introductoryText}
        </p>
      )}
      {collection.shortDescription && (
        <p>
          <strong>Description:</strong> {collection.shortDescription}
        </p>
      )}
      {collection.news && (
        <p>
          <strong>News:</strong> {collection.news}
        </p>
      )}
      {collection.license && (
        <p>
          <strong>License:</strong> {collection.license}
        </p>
      )}

      <button onClick={() => navigate(-1)}>Go Back</button>

      <hr style={{ margin: "20px 0" }} />

      {/* ---------------- CREATE ITEM FORM ---------------- */}
      <h3>Create an Item in this Collection</h3>
      <form onSubmit={handleCreateItem} style={{ maxWidth: "400px" }}>
        {/* Title (Required) */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Upload thumbnail:
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            style={{ marginTop: "4px" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Title (required):
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Authors */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Authors (comma-separated):
          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="e.g. Robert C. Martin, John Doe"
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Publisher */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Publisher:
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Language */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Language:
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Subject Keywords */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Subject Keywords:
          <input
            type="text"
            value={subjectKeywords}
            onChange={(e) => setSubjectKeywords(e.target.value)}
            placeholder="e.g. Clean Code, Agile"
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Abstract */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Abstract:
          <textarea
            rows={2}
            value={abstractText}
            onChange={(e) => setAbstractText(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Description */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Description:
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Mandatory: Date of Issue */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Date of Issue (required):
          <input
            type="date"
            value={dateOfIssue}
            onChange={(e) => setDateOfIssue(e.target.value)}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Mandatory: Types */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Types (comma-separated, required):
          <input
            type="text"
            value={types}
            onChange={(e) => setTypes(e.target.value)}
            placeholder="e.g. Book, Article"
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </label>

        {/* Multiple Files */}
        <label style={{ display: "block", marginBottom: "10px" }}>
          Upload PDF(s):
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => setFiles(e.target.files)}
            style={{ marginTop: "4px" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          Accept license:
          <select
            value={licenseConfirmed}
            onChange={(e) => setLicenseConfirmed(e.target.value)}
            style={{ marginLeft: "8px" }}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>

        <button type="submit">Create Item</button>
      </form>

      {/* SUCCESS/ERROR MESSAGES */}
      {itemSuccess && <p style={{ color: "green" }}>{itemSuccess}</p>}
      {itemError && <p style={{ color: "red" }}>{itemError}</p>}
    </div>
  );
}

export default CollectionDetails;
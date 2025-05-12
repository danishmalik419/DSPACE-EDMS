import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * A standalone React page to search for communities and display paginated results.
 * This version reads a token from localStorage and includes "Authorization: Bearer <token>"
 * in the headers for the search request.
 */
function Community() {
  // State for user input
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10); // Default page size
  const [total, setTotal] = useState(0);

  // Data list state
  const [communities, setCommunities] = useState([]);

  // Error or status message
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /**
   * Fetch communities based on searchTerm, page, size.
   * Includes the token (if present) as Bearer in the headers.
   */
  const fetchCommunities = async () => {
    // If there's no search term, clear results and return
    if (!searchTerm.trim()) {
      setCommunities([]);
      setTotal(0);
      return;
    }

    setError("");

    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // Build the request URL
    // Example: ${import.meta.env.VITE_API_URL}/search/community?query=AI&page=2&size=10
    const url = `${import.meta.env.VITE_API_URL}/search/community?query=${encodeURIComponent(
      searchTerm
    )}&page=${page}&size=${size}`;

    try {
      // Construct request headers, including the Bearer token if present
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // The response shape (based on your example):
      // {
      //   "results": {
      //       "total": 1,
      //       "page": 1,
      //       "size": 10,
      //       "results": [ {...community...} ]
      //   }
      // }
      const data = await response.json();
      if (data.results) {
        setCommunities(data.results.results || []);
        console.log(communities);
        setTotal(data.results.total || 0);
      } else {
        // Unexpected response shape
        setCommunities([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to fetch communities. Please try again.");
    }
  };

  // Whenever "page" or "size" changes, re-fetch if we have a valid searchTerm.
  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line
  }, [page, size]);

  // Handle search button click: reset page to 1, then fetch
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCommunities();
  };

  // Calculate total pages
  const totalPages = Math.ceil(total / size);

  // Next/Previous page handlers
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Search Community</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Enter search term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button type="submit">Search Community</button>
      </form>

      {/* If there's an error, display it */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Pagination info & buttons (only if we have results) */}
      {communities.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <p>
            Page {page} of {totalPages} (Total results: {total})
          </p>
          <button onClick={handlePrevPage} disabled={page <= 1}>
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages || totalPages === 0}
            style={{ marginLeft: "8px" }}
          >
            Next
          </button>
        </div>
      )}

      {/* Render list of communities */}
      <ul>
        {communities.map((community, index) => (
          <li
            key={index}
            style={{
              border: "1px solid #ccc",
              margin: "8px 0",
              padding: "8px"
            }}
          >
            <Link to={`/community/${community.id}`}>
              <h3>{community.name}</h3>
              <p><strong>Intro:</strong> {community.introductoryText}</p>
              <p><strong>Description:</strong> {community.shortDescription}</p>
              {community.news && (
                <p><strong>News:</strong> {community.news}</p>
              )}
              {community.parentCommunity && (
                <p><strong>Parent:</strong> {community.parentCommunity}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* If no communities found but we had a searchTerm and no error */}
      {communities.length === 0 && searchTerm.trim() && !error && (
        <p>No communities found.</p>
      )}

      <button
        style={{ margin: "40px" }}
        onClick={() => navigate("/newCommunity")}
      >
        Create Community
      </button>
    </div>
  );
}

export default Community;
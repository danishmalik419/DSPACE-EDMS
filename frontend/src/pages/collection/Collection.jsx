import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Collection() {
    // User input for searching
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10); // default page size
    const [total, setTotal] = useState(0);

    // Data list state
    const [collections, setCollections] = useState([]);

    // Error or status message
    const [error, setError] = useState("");

    /**
     * fetchCollections - Calls your backend to search collections.
     * If no searchTerm, clears results.
     */
    const fetchCollections = async () => {
        if (!searchTerm.trim()) {
            setCollections([]);
            setTotal(0);
            return;
        }

        setError("");

        // Build the URL with query, page, size
        const queryString = `query=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`;
        const url = `${import.meta.env.VITE_API_URL}/search/collection?${queryString}`;

        try {
            // Retrieve token from localStorage (if needed for auth)
            const token = localStorage.getItem("token");
            let headers = {
                "Content-Type": "application/json"
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            // The expected response shape (similar to your community search):
            // {
            //   "results": {
            //       "total": 2,
            //       "page": 1,
            //       "size": 10,
            //       "results": [ {...collection...} ]
            //   }
            // }
            const data = await response.json();

            // We assume the main data is under data.results
            if (data.results) {
                setCollections(data.results.results || []);
                setTotal(data.results.total || 0);
            } else {
                // Unexpected response shape
                setCollections([]);
                setTotal(0);
            }
        } catch (err) {
            console.error("Error searching collections:", err);
            setError("Failed to fetch collections. Please try again.");
        }
    };

    /**
     * Whenever page or size changes, re-fetch (if there's a searchTerm).
     */
    useEffect(() => {
        fetchCollections();
        // eslint-disable-next-line
    }, [page, size]);

    /**
     * handleSearch - Called when user clicks "Search Collections"
     * or presses Enter in the search bar. Resets page to 1 then fetches.
     */
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCollections();
    };

    // Calculate total pages
    const totalPages = Math.ceil(total / size);

    // Next/Previous page handlers
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    return (
        <div style={{ margin: "20px" }}>
            <h2>Search Collections</h2>

            <form onSubmit={handleSearch} style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Enter search term..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginRight: "8px" }}
                />
                <button type="submit">Search Collections</button>
            </form>

            {/* If there's an error, display it */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Pagination info & buttons (only if we have results) */}
            {collections.length > 0 && (
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

            {/* Render list of collections */}
            <ul>
                {collections.map((collection, index) => (
                    <li
                        key={index}
                        style={{
                            border: "1px solid #ccc",
                            margin: "8px 0",
                            padding: "8px"
                        }}
                    >
                        <Link to={`/collection/${collection.id}`}>
                            <h3>{collection.name}</h3>
                            <p>
                                <strong>Intro:</strong> {collection.introductoryText}
                            </p>
                            <p>
                                <strong>Description:</strong> {collection.shortDescription}
                            </p>
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
                        </Link>
                    </li>
                ))}
            </ul>

            {/* If no collections found but we have a searchTerm and no error */}
            {collections.length === 0 && searchTerm.trim() && !error && (
                <p>No collections found.</p>
            )}
        </div>
    );
}

export default Collection;
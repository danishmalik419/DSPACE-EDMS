import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

function GlobalSearch() {
  // Search state
  const [query, setQuery] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [authorsFilter, setAuthorsFilter] = useState([]); // selected authors
  const [showAuthorsPopup, setShowAuthorsPopup] = useState(false);
  const [authorSearchTerm, setAuthorSearchTerm] = useState("");
  const [startDateStart, setStartDateStart] = useState("");
  const [startDateEnd, setStartDateEnd] = useState("");
  const [endDateStart, setEndDateStart] = useState("");
  const [endDateEnd, setEndDateEnd] = useState("");
  const [hasFile, setHasFile] = useState(false);
  const [itemTypes, setItemTypes] = useState([]); // selected item types
  const [itemTypesInput, setItemTypesInput] = useState("");
  const [sortType, setSortType] = useState("MOST_RELEVANT");
  const authorsPopupRef = useRef(null);

  // Pagination state (page is 0-indexed)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Results and facet state
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({ authors: [], itemTypes: [] });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Handler for toggling an author facet filter
  const toggleAuthor = (author) => {
    setAuthorsFilter((prev) =>
      prev.includes(author)
        ? prev.filter((a) => a !== author)
        : [...prev, author]
    );
  };

  // Handler for toggling an item type facet filter
  const toggleItemType = (type) => {
    setItemTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorsPopupRef.current && !authorsPopupRef.current.contains(event.target)) {
        setShowAuthorsPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get("query");
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [location.search]);

  // Filter authors based on search term
  const filteredAuthors = facets.authors.filter(author =>
    author.key.toLowerCase().includes(authorSearchTerm.toLowerCase())
  );

  // Convert comma-separated string to array for item types.
  const handleItemTypesInputChange = (e) => {
    setItemTypesInput(e.target.value);
    const arr = e.target.value.split(",").map((t) => t.trim()).filter((t) => t);
    setItemTypes(arr);
  };

  // API call to fetch search results with facets
  const fetchGlobalSearch = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // Build request body with all filters
      const requestBody = JSON.stringify({
        page: page,
        pageSize: size,
        communityId,
        collectionId,
        keyword: query,
        authors: authorsFilter,
        startDateStart,
        startDateEnd,
        endDateStart,
        endDateEnd,
        hasFile,
        itemTypes,
        sortType,
        isArchived: "false"
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/search/item`,
        {
          method: "POST",
          headers,
          body: requestBody
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data.items) {
        setResults(data.items);
        setTotal(data.totalCount);
        setFacets({
          authors: data.facets.authors,
          itemTypes: data.facets.itemTypes
        });
      } else {
        setResults([]);
        setTotal(0);
        setFacets({ authors: [], itemTypes: [] });
      }
    } catch (err) {
      console.error("Error during global search:", err);
      setError("Failed to fetch search results. Please try again.");
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // reset page when searching
    fetchGlobalSearch();
  };

  // Re-fetch when any filter or pagination changes
  useEffect(() => {
    fetchGlobalSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, authorsFilter, startDateStart, startDateEnd, endDateStart, endDateEnd, hasFile, itemTypes, sortType, communityId, collectionId]);

  const totalPages = Math.ceil(total / size);

  return (
    <>
      <div className="bg-orange-500 px-5 py-3 text-white mb-5">
        <div className="text-sm">
          <span
            className="font-bold ml-28 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </span>{" "}
          &gt; <span className="font-bold">Search Items</span>
        </div>
      </div>
      <div className="flex px-32 flex-col min-h-screen bg-gray-100 font-sans">
        <div className="flex flex-1">
          {/* Sidebar with Filters */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h3 className="text-sm font-medium mb-4">Filters</h3>
            {/* Community ID Filter */}
            {/* (optional: uncomment if needed)
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Community ID</h4>
              <input
                type="text"
                placeholder="Community ID"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-xs"
              />
            </div>
            */}
            {/* Collection ID Filter */}
            {/* (optional: uncomment if needed)
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Collection ID</h4>
              <input
                type="text"
                placeholder="Collection ID"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-xs"
              />
            </div>
            */}

            {/* Author Facet - New Implementation */}
            <div className="mb-4 relative">
              <h4 className="text-xs font-medium mb-2">Author</h4>

              {/* Display first 5 authors */}
              {facets.authors.slice(0, 5).map((author, index) => (
                <div key={index} className="flex justify-between items-center mb-1 text-xs">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={authorsFilter.includes(author.key)}
                      onChange={() => toggleAuthor(author.key)}
                    />
                    {author.key}
                  </label>
                  <span className="text-gray-400">({author.doc_count})</span>
                </div>
              ))}

              {/* More button */}
              <button
                onClick={() => setShowAuthorsPopup(true)}
                className="text-xs text-blue-600 font-medium mt-1 cursor-pointer"
              >
                More
              </button>

              {/* Popup */}
              {showAuthorsPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div
                    ref={authorsPopupRef}
                    className="bg-white rounded-lg p-4 w-full max-w-md max-h-96 flex flex-col"
                  >
                    {/* Header with close button */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Select Authors</h3>
                      <button
                        onClick={() => setShowAuthorsPopup(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    {/* Search bar */}
                    <input
                      type="text"
                      placeholder="Search authors..."
                      value={authorSearchTerm}
                      onChange={(e) => setAuthorSearchTerm(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                    />

                    {/* Scrollable authors list */}
                    <div className="overflow-y-auto flex-grow">
                      {filteredAuthors.map((author, index) => (
                        <div key={index} className="flex justify-between items-center mb-2 py-1">
                          <label className="cursor-pointer">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={authorsFilter.includes(author.key)}
                              onChange={() => toggleAuthor(author.key)}
                            />
                            {author.key}
                          </label>
                          <span className="text-gray-400">({author.doc_count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Start Date Filters */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Start Date Range</h4>
              <input
                type="date"
                className="w-full p-1 border border-gray-300 rounded mb-2 text-xs"
                value={startDateStart}
                onChange={(e) => setStartDateStart(e.target.value)}
              />
              <input
                type="date"
                className="w-full p-1 border border-gray-300 rounded text-xs"
                value={startDateEnd}
                onChange={(e) => setStartDateEnd(e.target.value)}
              />
            </div>
            {/* End Date Filters */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">End Date Range</h4>
              <input
                type="date"
                className="w-full p-1 border border-gray-300 rounded mb-2 text-xs"
                value={endDateStart}
                onChange={(e) => setEndDateStart(e.target.value)}
              />
              <input
                type="date"
                className="w-full p-1 border border-gray-300 rounded text-xs"
                value={endDateEnd}
                onChange={(e) => setEndDateEnd(e.target.value)}
              />
            </div>
            {/* Item Types Filter */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Item Types</h4>
              <input
                type="text"
                placeholder="Enter comma-separated item types"
                value={itemTypesInput}
                onChange={handleItemTypesInputChange}
                className="w-full p-1 border border-gray-300 rounded text-xs mb-2"
              />
              {facets.itemTypes.map((bucket, index) => (
                <div key={index} className="flex justify-between items-center mb-1 text-xs">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={itemTypes.includes(bucket.key)}
                      onChange={() => toggleItemType(bucket.key)}
                    />
                    {bucket.key}
                  </label>
                  <span className="text-gray-400">({bucket.doc_count})</span>
                </div>
              ))}
              <div className="mt-2">
                <button
                  className="text-xs text-blue-500 underline"
                  onClick={() => setItemTypes([])}
                >
                  Clear Item Types Filter
                </button>
              </div>
            </div>
            {/* Sort */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Sort By</h4>
              <select
                className="w-full p-1 border border-gray-300 rounded text-xs"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="MOST_RELEVANT">Most Relevant</option>
                <option value="LATEST">Latest</option>
                <option value="OLDEST">Oldest</option>
              </select>
            </div>
            {/* Results Per Page */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Results Per Page</h4>
              <input
                className="w-full p-1 border border-gray-300 rounded text-xs"
                value={size}
                type="number"
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
              />
            </div>
            {/* Reset Filters */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setCommunityId("");
                  setCollectionId("");
                  setAuthorsFilter([]);
                  setAuthorSearchTerm("");
                  setStartDateStart("");
                  setStartDateEnd("");
                  setEndDateStart("");
                  setEndDateEnd("");
                  setHasFile(false);
                  setItemTypes([]);
                  setItemTypesInput("");
                  setSortType("MOST_RELEVANT");
                  setSize(10);
                }}
                className="bg-orange-500 text-white text-xs py-1 px-4 w-full rounded"
              >
                Reset Filters
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-5">
            {/* Search Box */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="flex flex-1">
                  <input
                    type="text"
                    placeholder="Search for keywords..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded-r-md"
                  >
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Search Results Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-1 text-gray-800">
                Search Results
              </h2>
              <p className="text-xs text-gray-600">
              Showing {Math.min(size, total - page * size)} of {total} results.
              </p>
            </div>

            {/* Search Results List */}
            <div>
              {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
              )}
              {results.length === 0 ? (
                <p className="text-gray-600">No results found</p>
              ) : (
                results.map((result) => (
                  <div
                    key={result.id}
                    className="flex bg-white mb-4 border border-gray-200 cursor-pointer"
                    onClick={() => navigate(`/item/${result.id}`)}
                  >
                    <div className="w-32 p-4 flex items-center justify-center">
                      <img
                        src={logo}
                        alt={result.title}
                        className="w-full h-auto bg-white border border-gray-300 object-cover"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                    <div className="flex-1 p-4 pr-4">
                      <div className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                        {result.type ? result.type.toUpperCase() : "ITEM"}
                      </div>
                      <h3 className="text-base font-bold mb-2 text-gray-800">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {result.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(result.date).toLocaleDateString()} | {result.collectionName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          className={`w-8 h-8 flex items-center justify-center border border-gray-300 ${
            page === 0 ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100"
          }`}
          disabled={page === 0}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        {/* Current Page */}
        <span className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white border border-orange-500 text-sm">
          {page + 1}
        </span>

        {/* Next Page Number (Preview) */}
        {page + 1 < totalPages && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 text-sm cursor-pointer"
          >
            {page + 2}
          </button>
        )}

        {/* Next Button */}
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className={`w-8 h-8 flex items-center justify-center border border-gray-300 ${
            page + 1 >= totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100"
          }`}
          disabled={page + 1 >= totalPages}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalSearch;
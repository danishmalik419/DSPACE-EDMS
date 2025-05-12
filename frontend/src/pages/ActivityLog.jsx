import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const ActivityLogPage = () => {
  const navigate = useNavigate();

  // Filter states
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [logTypeFilter, setLogTypeFilter] = useState('All Logs');
  // emailInput is the current value of the search input,
  // and searchEmail is used in the API call.
  const [searchEmail, setSearchEmail] = useState('');

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showLogTypeDropdown, setShowLogTypeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For custom date filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Log types fetched from API
  const [availableLogTypes, setAvailableLogTypes] = useState([]);

  // Refs for dropdowns
  const timeDropdownRef = useRef(null);
  const logTypeDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Logs state from API
  const [logs, setLogs] = useState([]);

  const [totalLogs, setTotalLogs] = useState(0);

  const timeOptions = ['Today', 'Last 7 days', 'Last 30 days', 'Custom Date'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
      if (logTypeDropdownRef.current && !logTypeDropdownRef.current.contains(event.target)) {
        setShowLogTypeDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) &&
        !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch available log types from API on mount
  useEffect(() => {
    const fetchLogTypes = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/analytics/log-types`,
          {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          }
        );
        const data = await response.json();
        if (data.success) {
          // Prepend "All Logs" so user can choose no filter
          setAvailableLogTypes(["All Logs", ...data.data]);
        }
      } catch (error) {
        console.error("Error fetching log types:", error);
      }
    };
    fetchLogTypes();
  }, []);

  // Helper: derive dates based on timeFilter.
  // When using "Custom Date", allow either startDate or endDate (or both) to be provided.
  const getDatesFromTimeFilter = () => {
    const today = new Date();
    let sDate = '';
    let eDate = '';
    if (timeFilter === 'Today') {
      sDate = today.toISOString().slice(0, 10);
      eDate = sDate;
    } else if (timeFilter === 'Last 7 days') {
      const past = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      sDate = past.toISOString().slice(0, 10);
      eDate = today.toISOString().slice(0, 10);
    } else if (timeFilter === 'Last 30 days') {
      const past = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
      sDate = past.toISOString().slice(0, 10);
      eDate = today.toISOString().slice(0, 10);
    } else if (timeFilter === 'Custom Date') {
      return { sDate: startDate || undefined, eDate: endDate || undefined };
    } else if (timeFilter.includes(' to ')) {
      const parts = timeFilter.split(' to ');
      sDate = parts[0] || undefined;
      eDate = parts[1] || undefined;
    }
    return { sDate, eDate };
  };

  // Fetch logs from API whenever filters, searchEmail, or page changes.
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { sDate, eDate } = getDatesFromTimeFilter();
        const emailParam = encodeURIComponent(searchEmail);
        const typeParam = logTypeFilter === 'All Logs' ? '' : logTypeFilter;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/analytics/logs?email=${emailParam}&startDate=${sDate || ''}&endDate=${eDate || ''}&type=${typeParam}&page=${page}&limit=10`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLogs(data.data.logs);
            setTotalPages(data.data.totalPages);
            setTotalLogs(data.data.total);
          }
        } else {
          console.error("Failed to fetch logs");
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    fetchLogs();
  }, [timeFilter, logTypeFilter, startDate, endDate, page, searchEmail]);

  const handleTimeFilterChange = (option) => {
    setTimeFilter(option);
    setShowTimeDropdown(false);
    if (option === 'Custom Date') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleLogTypeChange = (option) => {
    setLogTypeFilter(option);
    setShowLogTypeDropdown(false);
  };

  const handleDateSubmit = () => {
    if (startDate || endDate) {
      setTimeFilter(`${startDate || ''} to ${endDate || ''}`);
      setShowDatePicker(false);
    }
  };

  // Search button handler.
  const handleSearch = () => {
    setPage(0);
    // Update searchEmail only when Search is clicked.
    setSearchEmail(emailInput);
  };

  // Introduce a separate state variable for the search input.
  const [emailInput, setEmailInput] = useState('');

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const tabStyle = (isActive) =>
    `text-gray-500 hover:text-orange-600 font-medium flex items-center relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:transition-all after:duration-300 ${isActive ? "text-orange-500 after:bg-orange-500" : "after:bg-transparent"
    } mr-6 py-2`;

  const headerCellStyle =
    "px-6 py-3 text-center text-md font-medium text-gray-900 tracking-wider border border-gray-200";
  const cellStyle =
    "px-6 py-4 whitespace-nowrap text-center text-md font-medium text-gray-700 border border-gray-200";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-orange-500 text-white p-2">
        <div className="container mx-auto flex items-center">
          <span className="font-bold ml-40 cursor-pointer" onClick={() => navigate("/")}>
            Home
          </span>
          <span className="mx-2 font-bold">&gt;</span>
          <span className="font-bold cursor-pointer">Activity Log</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 pl-40 pr-32">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6">Activity Log</h1>
        <div className="border-b border-gray-200 mb-6"></div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-grow md:w-96">
            <input
              type="text"
              placeholder="Enter email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <button onClick={handleSearch} className="bg-orange-500 text-white px-6 py-2 rounded-md flex items-center">
            Search
          </button>

          {/* Time Filter Dropdown */}
          <div className="relative" ref={timeDropdownRef}>
            <button
              className="bg-white px-4 py-2 border border-gray-300 rounded-md flex items-center justify-between"
              onClick={() => {
                setShowTimeDropdown(!showTimeDropdown);
                setShowLogTypeDropdown(false);
              }}
            >
              <span>{timeFilter}</span>
              <svg className="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            {showTimeDropdown && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTimeFilterChange(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute z-20 mt-1 p-4 bg-white border border-gray-300 rounded-md shadow-lg date-picker-container"
                style={{ width: '300px' }}
              >
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setShowDatePicker(false); setStartDate(''); setEndDate(''); }}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleDateSubmit}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md"
                    disabled={!startDate && !endDate}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Log Type Filter Dropdown */}
          <div className="relative" ref={logTypeDropdownRef}>
            <button
              className="bg-white px-4 py-2 border border-gray-300 rounded-md flex items-center justify-between"
              onClick={() => {
                setShowLogTypeDropdown(!showLogTypeDropdown);
                setShowTimeDropdown(false);
              }}
            >
              <span>{logTypeFilter}</span>
              <svg className="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            {showLogTypeDropdown && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                {availableLogTypes.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setLogTypeFilter(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-lg font-semibold mt-2">
          Total Logs: {totalLogs}
        </div>

        {/* Activity Log Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className={headerCellStyle}>ID</th>
                <th className={headerCellStyle}>Type</th>
                <th className={headerCellStyle}>User Email</th>
                <th className={headerCellStyle}>Time</th>
                <th className={headerCellStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className={cellStyle}>{row.id}</td>
                  <td className={cellStyle}>{row.type}</td>
                  <td className={cellStyle}>{row.userEmail}</td>
                  <td className={cellStyle}>{new Date(row.createdAt).toLocaleString()}</td>
                  <td className={cellStyle}>
                    {row.details
                      ? JSON.stringify(row.details)
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <button
            disabled={page === 0}
            onClick={handlePrevPage}
            className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={handleNextPage}
            className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;
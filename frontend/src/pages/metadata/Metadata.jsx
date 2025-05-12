import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const MetadataPage = () => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const [itemData, setItemData] = useState(null);
  const [keyMappings, setKeyMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch the item data.
  const fetchItemData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/item/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      if (data.success) {
        setItemData(data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching item data:", err);
      setError("Failed to fetch item data");
      setLoading(false);
    }
  };

  // Fetch key mappings for model type "Test".
  const fetchKeyMappings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/mapping/Item`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setKeyMappings(data.data);
      }
    } catch (err) {
      console.error("Error fetching key mappings:", err);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItemData();
      fetchKeyMappings();
    } else {
      setLoading(false);
    }
  }, [itemId]);

  // Helper function to return displayName if mapping exists; otherwise, return the original key.
  const mappingFor = (key) => {
    const mapping = keyMappings.find(
      (m) => m.keyName.toLowerCase() === key.toLowerCase()
    );
    if (mapping && !mapping.toDisplay) return null;
    return mapping ? mapping.displayName : key;
  };

  // Transform itemData into an array of rows.
  // For "metadata", expand its key-value pairs.
  // For "file" and "collection", display only their name.
  const getTableRows = () => {
    const rows = [];
    Object.entries(itemData).forEach(([key, value]) => {
      if (key === "metadata" && value && typeof value === "object") {
        Object.entries(value).forEach(([metaKey, metaValue]) => {
          const mappedKey = mappingFor(metaKey);
          if (mappedKey === null || metaValue === null) return; // skip this metadata field
          rows.push({ key: mappedKey, value: metaValue });
        });
      } else if (
        (key === "file" || key === "collection") &&
        value &&
        typeof value === "object"
      ) {
        const mappedKey = mappingFor(key);
        if (mappedKey === null) return; // skip this row if not to display
        rows.push({ key: mappedKey, value: value.name });
      } else {
        const mappedKey = mappingFor(key);
        if (mappedKey === null || value === null) return; // skip this row
        rows.push({ key: mappedKey, value });
      }
    });
    return rows;
  };


  const rows = itemData ? getTableRows() : [];

  if (loading) return <p className="text-center mt-10">Loading data...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 px-5 py-3 text-white mb-5">
        <div className="text-sm">
          <span
            className="font-bold ml-28 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </span>{" "}
          &gt; <span className="font-bold">Item Metadata</span>
        </div>
      </div>

      <div className="py-2 text-black flex items-center">
        <div className="w-full text-center">
          <h1 className="text-xl font-bold">Item Metadata</h1>
        </div>
      </div>

      {/* Metadata Table */}
      <div className="flex-grow p-4 max-w-6xl mx-auto w-full">
        <table className="w-full border-collapse">
          <tbody>
            {rows.length > 0 ? (
              rows.map(({ key, value }, index) => (
                <tr
                  key={`${key}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="border p-2 font-medium w-1/3">{key}</td>
                  <td className="border p-2">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4">
                  No metadata found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetadataPage;
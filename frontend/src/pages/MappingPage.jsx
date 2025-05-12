import React, { useState, useEffect } from "react";

const MappingPage = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch mappings for model type "Test"
  useEffect(() => {
    const fetchMappings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/mapping/Item`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setMappings(data.data);
        } else {
          setError(data.message || "Failed to fetch mappings");
        }
      } catch (err) {
        setError("Error fetching mappings");
      }
      setLoading(false);
    };

    fetchMappings();
  }, [token]);

  // Update display name when input changes.
  const handleDisplayNameChange = (id, value) => {
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.id === id ? { ...mapping, displayName: value } : mapping
      )
    );
  };

  // Update the toDisplay flag when checkbox changes.
  const handleCheckboxChange = (id, checked) => {
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.id === id ? { ...mapping, toDisplay: checked } : mapping
      )
    );
  };

  // Save mappings using the save API.
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    // Prepare payload using only keyName, displayName, and toDisplay.
    const payload = {
      type: "Item",
      mappings: mappings.map(({ keyName, displayName, toDisplay }) => ({
        keyName,
        displayName,
        toDisplay,
      })),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/mapping/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Mappings saved successfully.");
      } else {
        setError(data.message || "Failed to save mappings");
      }
    } catch (err) {
      setError("Error saving mappings");
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Loading mappings...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Key Mappings for Test</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {mappings.length === 0 ? (
        <p>No mappings found.</p>
      ) : (
        <div className="space-y-4">
          {mappings.map((mapping) => (
            <div
              key={mapping.id}
              className="flex items-center space-x-4 border p-2 rounded"
            >
              <div className="w-1/4">
                <strong>{mapping.keyName}</strong>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  value={mapping.displayName}
                  onChange={(e) =>
                    handleDisplayNameChange(mapping.id, e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={mapping.toDisplay}
                    onChange={(e) =>
                      handleCheckboxChange(mapping.id, e.target.checked)
                    }
                    className="mr-2"
                  />
                  To Display
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
      >
        {saving ? "Saving..." : "Save Mappings"}
      </button>
      {successMessage && (
        <p className="mt-2 text-green-500">{successMessage}</p>
      )}
    </div>
  );
};

export default MappingPage;
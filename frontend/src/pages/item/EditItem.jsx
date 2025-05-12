import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";

function EditItem() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Form state for item details (for creation via parentSelection view)
  const [parentItem, setParentItem] = useState(null);
  const [formView, setFormView] = useState("parentSelection"); // "parentSelection" or "editForm"
  const [activeTab, setActiveTab] = useState("status");

  // Fetched item details (used in editForm view)
  const [itemData, setItemData] = useState(null);
  // Flag to toggle metadata editing mode
  const [editingMetadata, setEditingMetadata] = useState(false);

  // Parent selection state
  const [parentItems, setParentItems] = useState([]);
  const [itemPage, setItemPage] = useState(0);
  const [totalItemPages, setTotalItemPages] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Collection modal state (for moving item to another collection)
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionSearchTerm, setCollectionSearchTerm] = useState("");
  const [appliedCollectionSearchTerm, setAppliedCollectionSearchTerm] = useState("");
  const [collections, setCollections] = useState([]);
  const [collectionPage, setCollectionPage] = useState(1);
  const [totalCollectionPages, setTotalCollectionPages] = useState(1);

  // ----- Metadata Editing Handlers -----
  const handleToggleEditMetadata = () => {
    setEditingMetadata(!editingMetadata);
  };

  const handleSaveEditedMetadata = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/item/edit/${itemData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Here we send the entire itemData as payload (including metadata)
        body: JSON.stringify(itemData),
      });
      if (!response.ok) {
        throw new Error(`Failed to update metadata, status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuccess("Metadata updated successfully!");
        setEditingMetadata(false);
      } else {
        throw new Error(data.message || "Failed to update metadata");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ----- Parent Selection: Fetch Items -----
  useEffect(() => {
    if (formView === "parentSelection") {
      const fetchItems = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/user/search/item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              page: itemPage,
              pageSize: 10,
              keyword: searchKeyword,
              isArchived: "false"
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setParentItems(data.items);
            setTotalItemPages(Math.ceil(data.totalCount / 10));
          } else {
            console.error("Failed to fetch items");
          }
        } catch (err) {
          console.error("Error fetching items:", err);
        }
      };
      fetchItems();
    }
  }, [formView, itemPage, searchKeyword, API_URL]);

  const handleBackButton = () => {
    if (formView === "editForm") {
      setFormView("parentSelection");
    } else {
      window.history.back();
    }
  };

  // ----- Fetch Item Details for Editing -----
  useEffect(() => {
    if (formView === "editForm" && parentItem) {
      const fetchItemDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/user/item/${parentItem}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok)
            throw new Error(`Failed to fetch item details, status ${response.status}`);

          const data = await response.json();
          if (data.success) {
            setItemData(data.data);
          } else {
            throw new Error(data.message || "Failed to fetch item details");
          }
        } catch (err) {
          setError(err.message);
        }
      };
      fetchItemDetails();
    }
  }, [formView, parentItem, API_URL]);

  // ----- Helper to Render All Item Fields (Non-editable view) -----
  const renderAllItemFields = () => {
    if (!itemData) return null;
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left border">Field</th>
            <th className="py-2 px-4 text-left border">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(itemData).map(([key, value]) => {
            // Fields we never let the user edit or we don't want to show as editable
            const uneditableFields = [
              "createdBy","createdAt","updatedBy","updatedAt","createdById","updatedById",
              "id","licenseConfirmed","isArchived","isDiscoverable","collectionId",
              "thumbnailId","fileId" // also don't show editing for fileId
            ];

            // If it's in uneditableFields, just show plain text (if we want it shown at all)
            if (uneditableFields.includes(key)) {
              return (
                <tr key={key}>
                  <td className="py-2 px-4 border">{key}</td>
                  <td className="py-2 px-4 border">{value !== null ? value.toString() : ""}</td>
                </tr>
              );
            }
            // For file field, show only file name (non-editable)
            if (key === "file" && value && typeof value === "object") {
              return (
                <tr key={key}>
                  <td className="py-2 px-4 border">{key}</td>
                  <td className="py-2 px-4 border">{value.name}</td>
                </tr>
              );
            }
            // For metadata, render each key-value pair as plain text
            if (key === "metadata" && value && typeof value === "object") {
              return Object.entries(value).map(([metaKey, metaVal]) => (
                <tr key={`metadata-${metaKey}`}>
                  <td className="py-2 px-4 border">metadata.{metaKey}</td>
                  <td className="py-2 px-4 border">{metaVal}</td>
                </tr>
              ));
            }
            // For collection, show as plain text
            if (key === "collection") {
              return (
                <tr key={key}>
                  <td className="py-2 px-4 border">{key}</td>
                  <td className="py-2 px-4 border">{value}</td>
                </tr>
              );
            }
            // Default: render as plain text
            return (
              <tr key={key}>
                <td className="py-2 px-4 border">{key}</td>
                <td className="py-2 px-4 border">
                  {value !== null ? value.toString() : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // ----- Build Payload Function -----
  const buildPayload = () => {
    if (!itemData) return {};
    // Exclude system fields and also the uneditable ones
    const excludeKeys = [
      "createdBy","createdAt","updatedBy","updatedAt","createdById","updatedById",
      "file","id","licenseConfirmed","isArchived","isDiscoverable","collectionId",
      "thumbnailId","fileId"
    ];

    const payload = { ...itemData };
    excludeKeys.forEach((key) => delete payload[key]);
    return payload;
  };

  // ----- Archive Handler -----
  const handleArchiveItem = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/item/archive/${itemData.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to archive item, status ${response.status}`);
      setSuccess("Item archived successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // ----- Toggle Discoverability Handler -----
  const handleToggleDiscoverable = async () => {
    try {
      if (!itemData) return;
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in first.");

      // Check isDiscoverable in itemData
      const currentlyDiscoverable = itemData.isDiscoverable === true;
      const endpoint = `${API_URL}/admin/item/toggle-discovery/${itemData.id}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to toggle discoverability, status ${response.status}`);
      }
      setSuccess("Item discoverability changed.");
      // Flip the local state for isDiscoverable
      setItemData((prev) => ({
        ...prev,
        isDiscoverable: !currentlyDiscoverable,
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // ----- Collection Modal Handlers -----
  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/search/collection?query=${encodeURIComponent(
          appliedCollectionSearchTerm
        )}&page=${collectionPage - 1}&limit=10&isArchived=false`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to fetch collections, status ${response.status}`);
      const data = await response.json();
      if (data.results) {
        setCollections(data.results.results);
        setTotalCollectionPages(Math.ceil(data.results.total / 10));
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  useEffect(() => {
    if (showCollectionModal) {
      fetchCollections();
    }
  }, [showCollectionModal, collectionPage, appliedCollectionSearchTerm, API_URL]);

  const handleSelectCollection = (collection) => {
    const confirmChange = window.confirm(
      "Are you sure you want to change the collection of this item?"
    );
    if (confirmChange) {
      handleChangeCollection(collection.id, collection.name);
    }
  };

  // Updated to call /admin/item/changeCollection/:itemId
  const handleChangeCollection = async (collectionId, collectionName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/item/changeCollection/${itemData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ collectionId }),
        }
      );
      if (!response.ok)
        throw new Error(`Failed to update item, status ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setSuccess("Collection updated successfully!");
        setItemData((prev) => ({ ...prev, collection: collectionName }));
        setShowCollectionModal(false);
      } else {
        throw new Error(data.message || "Failed to update collection");
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
            <a href="/" className="text-white">Home</a> &gt; Edit Item
          </div>
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto font-sans shadow-lg rounded-lg overflow-hidden my-5">
        <div className="bg-orange-500 text-white p-4 font-semibold text-xl shadow-md flex justify-between items-center">
          <span>Edit Item</span>
        </div>
        <div className="bg-white">
          <div className="p-6">
            {formView === "parentSelection" ? (
              <>
                {/* ---------- PARENT SELECTION VIEW ---------- */}
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    🔍
                  </div>
                  <input
                    type="text"
                    placeholder="Search for an Item"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base"
                  />
                  <button
                    onClick={() => {
                      setItemPage(0);
                      setSearchKeyword(keywordInput);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded"
                  >
                    Search
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner">
                  {parentItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                      onClick={() => {
                        setParentItem(item.id.toString());
                        setFormView("editForm");
                        setActiveTab("status");
                      }}
                    >
                      <div className="font-medium mb-1 text-base">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.subject}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    disabled={itemPage === 0}
                    onClick={() => setItemPage(itemPage - 1)}
                    className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {itemPage + 1} of {totalItemPages}
                  </span>
                  <button
                    disabled={itemPage >= totalItemPages - 1}
                    onClick={() => setItemPage(itemPage + 1)}
                    className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* ---------- EDIT FORM VIEW ---------- */}
                <div className="border-b mb-6">
                  <div className="flex">
                    <div
                      className={`mr-8 pb-2 cursor-pointer ${
                        activeTab === "status"
                          ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("status")}
                    >
                      Status
                    </div>
                    <div
                      className={`mr-8 pb-2 cursor-pointer ${
                        activeTab === "metadata"
                          ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("metadata")}
                    >
                      Metadata
                    </div>
                  </div>
                </div>

                {/* STATUS TAB */}
                {activeTab === "status" && itemData && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-48 font-medium text-gray-700">Item Internal ID</div>
                      <div className="text-gray-700 mr-2">:</div>
                      <div className="text-gray-700">{itemData.id}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-48 font-medium text-gray-700">Subject</div>
                      <div className="text-gray-700 mr-2">:</div>
                      <div className="text-gray-700">{itemData.subject}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-48 font-medium text-gray-700">Created At</div>
                      <div className="text-gray-700 mr-2">:</div>
                      <div className="text-gray-700">
                        {new Date(itemData.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-48 font-medium text-gray-700">Item Page</div>
                      <div className="text-gray-700 mr-2">:</div>
                      <div className="text-orange-500 hover:underline">
                        <a href={`https://edms.avtechfin.co.in/item/${itemData.id}`}>
                          {`https://edms.avtechfin.co.in/item/${itemData.id}`}
                        </a>
                      </div>
                    </div>
                    {itemData.file && (
                      <div className="flex items-center">
                        <div className="w-48 font-medium text-gray-700">File</div>
                        <div className="text-gray-700 mr-2">:</div>
                        <div className="text-gray-700">{itemData.file.name}</div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="w-48 font-medium text-gray-700">Collection</div>
                      <div className="text-gray-700 mr-2">:</div>
                      <div className="text-gray-700">{itemData.collection}</div>
                      <button
                        onClick={() => setShowCollectionModal(true)}
                        className="ml-4 border border-orange-500 text-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      >
                        Move to Collection
                      </button>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-6 space-y-4">
                      {/* Toggle discoverability: Show "Make Discoverable" if false, else "Make non-discoverable" */}
                      <div className="flex items-center">
                        <div className="w-48 font-medium text-gray-700">
                          {itemData.isDiscoverable
                            ? "Make item non-discoverable"
                            : "Make item discoverable"}
                        </div>
                        <div className="text-gray-700 mr-2">:</div>
                        <button
                          onClick={handleToggleDiscoverable}
                          className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-50"
                        >
                          {itemData.isDiscoverable
                            ? "Make non-discoverable"
                            : "Make Discoverable"}
                        </button>
                      </div>
                      <div className="flex items-center">
                        <div className="w-48 font-medium text-gray-700">Archive</div>
                        <div className="text-gray-700 mr-2">:</div>
                        <button
                          onClick={handleArchiveItem}
                          className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-50"
                        >
                          Archive
                        </button>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          onClick={handleBackButton}
                          className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-50 flex items-center"
                        >
                          <span className="mr-2">←</span> Back
                        </button>
                        {/* No Save button on the status tab */}
                      </div>
                    </div>
                  </div>
                )}

                {/* METADATA TAB */}
                {activeTab === "metadata" && itemData && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <button
                        onClick={handleToggleEditMetadata}
                        className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-50 flex items-center"
                      >
                        {editingMetadata ? "Stop Editing" : "Edit"}
                      </button>
                      {editingMetadata && (
                        <button
                          onClick={handleSaveEditedMetadata}
                          className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 flex items-center"
                        >
                          <FaSave size={16} className="mr-1" />
                          Save
                        </button>
                      )}
                    </div>
                    {editingMetadata ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left border">Field</th>
                            <th className="py-2 px-4 text-left border">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(itemData).map(([key, value]) => {
                            // Fields we don't want to let the user edit
                            const uneditableFields = [
                              "createdBy","createdAt","updatedBy","updatedAt","createdById","updatedById",
                              "id","licenseConfirmed","isArchived","isDiscoverable","collectionId",
                              "thumbnailId","fileId"
                            ];

                            if (uneditableFields.includes(key)) {
                              // Show it as plain text
                              return (
                                <tr key={key}>
                                  <td className="py-2 px-4 border">{key}</td>
                                  <td className="py-2 px-4 border">
                                    {value !== null ? value.toString() : ""}
                                  </td>
                                </tr>
                              );
                            }

                            if (key === "file" && value && typeof value === "object") {
                              return (
                                <tr key={key}>
                                  <td className="py-2 px-4 border">{key}</td>
                                  <td className="py-2 px-4 border">
                                    <input
                                      type="text"
                                      value={value.name}
                                      readOnly
                                      className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-100"
                                    />
                                  </td>
                                </tr>
                              );
                            }
                            if (key === "metadata" && value && typeof value === "object") {
                              return Object.entries(value).map(([metaKey, metaVal]) => (
                                <tr key={`metadata-${metaKey}`}>
                                  <td className="py-2 px-4 border">metadata.{metaKey}</td>
                                  <td className="py-2 px-4 border">
                                    <input
                                      type="text"
                                      value={metaVal}
                                      onChange={(e) =>
                                        setItemData((prev) => ({
                                          ...prev,
                                          metadata: {
                                            ...prev.metadata,
                                            [metaKey]: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                  </td>
                                </tr>
                              ));
                            }
                            if (key === "collection") {
                              return (
                                <tr key={key}>
                                  <td className="py-2 px-4 border">{key}</td>
                                  <td className="py-2 px-4 border">{value}</td>
                                </tr>
                              );
                            }
                            // Otherwise, show an editable input
                            return (
                              <tr key={key}>
                                <td className="py-2 px-4 border">{key}</td>
                                <td className="py-2 px-4 border">
                                  <input
                                    type="text"
                                    value={value !== null ? value.toString() : ""}
                                    onChange={(e) =>
                                      setItemData((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      // Non-editable (plain text) view
                      renderAllItemFields()
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Collection</h3>
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Search Collections..."
                value={collectionSearchTerm}
                onChange={(e) => setCollectionSearchTerm(e.target.value)}
                className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
              />
              <button
                onClick={() => {
                  setCollectionPage(1);
                  setAppliedCollectionSearchTerm(collectionSearchTerm);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-r"
              >
                Search
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left border border-gray-300">ID</th>
                    <th className="py-2 px-4 text-left border border-gray-300">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr
                      key={col.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSelectCollection(col)}
                    >
                      <td className="py-2 px-4 border border-gray-300">{col.id}</td>
                      <td className="py-2 px-4 border border-gray-300 text-orange-500">
                        {col.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCollectionPage((prev) => Math.max(prev - 1, 1))}
                disabled={collectionPage === 1}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-l"
              >
                &lt;
              </button>
              {Array.from({ length: totalCollectionPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCollectionPage(pageNum)}
                  className={`border border-gray-300 px-3 py-1 mx-0.5 ${
                    collectionPage === pageNum
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCollectionPage((prev) => Math.min(prev + 1, totalCollectionPages))}
                disabled={collectionPage === totalCollectionPages}
                className="border border-gray-300 px-3 py-1 mx-1 rounded-r"
              >
                &gt;
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditItem;
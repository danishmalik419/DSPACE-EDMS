import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NewItem() {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    // View state: "collectionSelection" or "createForm"
    const [formView, setFormView] = useState("collectionSelection");

    // Collection selection state
    const [collections, setCollections] = useState([]);
    const [collectionPage, setCollectionPage] = useState(1);
    const [totalCollectionPages, setTotalCollectionPages] = useState(1);
    const [collectionSearchTerm, setCollectionSearchTerm] = useState("");
    const [appliedCollectionSearchTerm, setAppliedCollectionSearchTerm] = useState("");
    const [selectedCollection, setSelectedCollection] = useState(null);

    // Form fields state for creating an item
    const [formFields, setFormFields] = useState({
        title: "",
        author: "",
        subject: "",
        keyword: "",
        department: "",
        branch: "",
        fileNumber: "",
        accountNumber: "",
        startDate: "",
        endDate: "",
        date: "",
        place: "",
        type: "",
        format: "",
        identifier: "",
        source: "",
        language: "",
        relation: "",
        coverage: "",
        rights: "",
        extent: "",
        remarks: "",
        donor: "",
        donationDate: "",
        custodian: "",
        isPayable: "No",
        classification: "",
        volume: "",
        collectionId: "", // Will be set after collection selection
    });

    // File states
    const [logoFile, setLogoFile] = useState(null);
    const [itemFile, setItemFile] = useState(null);

    // Extra metadata fields and their values
    const [metadataFields, setMetadataFields] = useState([]);
    const [metadataValues, setMetadataValues] = useState({});

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ----- Fetch Collections for Parent Collection Selection -----
    useEffect(() => {
        if (formView === "collectionSelection") {
            const fetchCollections = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                        `${API_URL}/admin/search/collection?query=${appliedCollectionSearchTerm}&page=${collectionPage - 1}&limit=10&isArchived=false`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (!response.ok) {
                        throw new Error(`Failed to fetch collections, status ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.results) {
                        setCollections(data.results.results);
                        setTotalCollectionPages(Math.ceil(data.results.total / 10));
                    }
                } catch (err) {
                    console.error("Error fetching collections:", err);
                    setError(err.message);
                }
            };
            fetchCollections();
        }
    }, [formView, collectionPage, appliedCollectionSearchTerm, API_URL]);

    const handleCollectionSearch = () => {
        setCollectionPage(1);
        setAppliedCollectionSearchTerm(collectionSearchTerm);
    };

    const handleSelectCollection = (collection) => {
        setSelectedCollection(collection);
        setFormFields((prev) => ({ ...prev, collectionId: collection.id }));
        setFormView("createForm");
    };

    // ----- Fetch Extra Metadata Fields from All Schemas -----
    useEffect(() => {
        if (formView === "createForm") {
            const fetchMetadataSchemas = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${API_URL}/admin/metadata/all`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch metadata schemas, status ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.success) {
                        // Flatten all fields from all schemas into a single array.
                        const allFields = data.data.flatMap((schema) =>
                            schema.fields.map((field) => ({
                                ...field,
                                schema: { name: schema.name },
                            }))
                        );
                        setMetadataFields(allFields);
                    }
                } catch (err) {
                    console.error("Error fetching metadata schemas:", err);
                    setError(err.message);
                }
            };
            fetchMetadataSchemas();
        }
    }, [formView, API_URL]);

    // ----- File Handling for Logo and Item File -----
    const handleLogoChange = (e) => {
        setLogoFile(e.target.files[0] || null);
    };

    const handleItemFileChange = (e) => {
        setItemFile(e.target.files[0] || null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith("image/")) {
            setLogoFile(files[0]);
        }
    };

    const handleItemFileDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setItemFile(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleItemFileDragOver = (e) => {
        e.preventDefault();
    };

    // ----- Handle Input Changes for Standard Fields -----
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ----- Handle Extra Metadata Input Changes -----
    const handleMetadataValueChange = (fieldId, value) => {
        setMetadataValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    // ----- Submit Form to Create Item -----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const creatorId = localStorage.getItem("userId") || "default-creator";

            // Build payload from formFields
            const payload = {
                title: formFields.title,
                collectionId: formFields.collectionId,
                createdById: creatorId,
                author: formFields.author,
                subject: formFields.subject || null,
                keyword: formFields.keyword || null,
                department: formFields.department || null,
                branch: formFields.branch || null,
                fileNumber: formFields.fileNumber || null,
                accountNumber: formFields.accountNumber || null,
                startDate: formFields.startDate ? new Date(formFields.startDate) : null,
                endDate: formFields.endDate ? new Date(formFields.endDate) : null,
                date: formFields.date ? new Date(formFields.date) : null,
                place: formFields.place || null,
                type: formFields.type || null,
                format: formFields.format || null,
                identifier: formFields.identifier || null,
                sourceLink: formFields.source || null,
                language: formFields.language || null,
                relation: formFields.relation || null,
                coverage: formFields.coverage || null,
                rights: formFields.rights || null,
                extent: formFields.extent || null,
                remarks: formFields.remarks || null,
                donor: formFields.donor || null,
                donationDate: formFields.donationDate ? new Date(formFields.donationDate) : null,
                custodian: formFields.custodian || null,
                isPayable: formFields.isPayable === "Yes",
                classification: formFields.classification || null,
                volume: formFields.volume || null,
                updatedById: creatorId,
            };

            // Build metadata array from metadataValues (only include fields where a value was entered)
            const metadataArray = metadataFields
                .filter((field) => metadataValues[field.id] && metadataValues[field.id].trim() !== "")
                .map((field) => ({
                    metadataFieldId: field.id,
                    value: metadataValues[field.id],
                }));

            // Add metadata array to payload if any values were provided
            if (metadataArray.length > 0) {
                payload.metadata = metadataArray;
            }

            const formData = new FormData();
            formData.set("item", JSON.stringify(payload));
            // Attach item file if provided
            if (itemFile) {
                formData.set("file", itemFile);
            }
            // Attach logo file if provided
            if (logoFile) {
                formData.set("logo", logoFile);
            }

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found. Please log in first.");
            const response = await fetch(`${API_URL}/admin/item/create`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            setSuccess("Item created successfully!");
        } catch (err) {
            console.error("Error creating Item:", err);
            setError(err.message || "Failed to create Item. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-orange-500 text-white p-4">
                <div className="container mx-auto flex items-center">
                    <span
                        className="font-bold ml-40 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        Home
                    </span>
                    <span className="mx-2 font-bold">&gt;</span>
                    <span className="font-bold">Create Item</span>
                </div>
            </div>

            <main className="container mx-auto p-6 pl-40 pr-16">
                {formView === "collectionSelection" ? (
                    <>
                        <h1 className="text-3xl font-semibold text-gray-700 mb-6">
                            Select Parent Collection
                        </h1>
                        <div className="relative mb-4">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Search for a collection"
                                value={collectionSearchTerm}
                                onChange={(e) => setCollectionSearchTerm(e.target.value)}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-lg text-base bg-white"
                            />
                            <button
                                onClick={handleCollectionSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded"
                            >
                                Search
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-2 shadow-inner bg-white">
                            {collections.map((col) => (
                                <div
                                    key={col.id}
                                    className="p-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg"
                                    onClick={() => handleSelectCollection(col)}
                                >
                                    <div className="font-medium mb-1 text-base">{col.name}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                disabled={collectionPage === 1}
                                onClick={() =>
                                    setCollectionPage((prev) => Math.max(prev - 1, 1))
                                }
                                className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {collectionPage} of {totalCollectionPages}
                            </span>
                            <button
                                disabled={collectionPage >= totalCollectionPages}
                                onClick={() =>
                                    setCollectionPage((prev) =>
                                        Math.min(prev + 1, totalCollectionPages)
                                    )
                                }
                                className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h1 className="text-3xl font-semibold text-gray-700 mb-6">
                            Create Item for {selectedCollection?.name}
                        </h1>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-base text-gray-700">
                                Title: *
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Type your item title here"
                                value={formFields.title}
                                onChange={handleFieldChange}
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-base text-gray-700">
                                Author:
                            </label>
                            <input
                                type="text"
                                name="author"
                                placeholder="Enter author"
                                value={formFields.author}
                                onChange={handleFieldChange}
                                className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-base text-gray-700">
                                Subject:
                            </label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="Enter subject"
                                value={formFields.subject}
                                onChange={handleFieldChange}
                                className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-base text-gray-700">
                                Keyword:
                            </label>
                            <input
                                type="text"
                                name="keyword"
                                placeholder="Enter keyword(s)"
                                value={formFields.keyword}
                                onChange={handleFieldChange}
                                className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        {/* Additional item fields... */}
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Start Date:
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formFields.startDate}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    End Date:
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formFields.endDate}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Date:
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formFields.date}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Place:
                                </label>
                                <input
                                    type="text"
                                    name="place"
                                    placeholder="Enter place"
                                    value={formFields.place}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Type:
                                </label>
                                <input
                                    type="text"
                                    name="type"
                                    placeholder="Enter type"
                                    value={formFields.type}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Format:
                                </label>
                                <input
                                    type="text"
                                    name="format"
                                    placeholder="Enter format"
                                    value={formFields.format}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Identifier:
                                </label>
                                <input
                                    type="text"
                                    name="identifier"
                                    placeholder="Enter identifier"
                                    value={formFields.identifier}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Source:
                                </label>
                                <input
                                    type="text"
                                    name="source"
                                    placeholder="Enter source"
                                    value={formFields.source}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Language:
                                </label>
                                <input
                                    type="text"
                                    name="language"
                                    placeholder="Enter language"
                                    value={formFields.language}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Relation:
                                </label>
                                <input
                                    type="text"
                                    name="relation"
                                    placeholder="Enter relation"
                                    value={formFields.relation}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Coverage:
                                </label>
                                <input
                                    type="text"
                                    name="coverage"
                                    placeholder="Enter coverage"
                                    value={formFields.coverage}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Rights:
                                </label>
                                <input
                                    type="text"
                                    name="rights"
                                    placeholder="Enter rights"
                                    value={formFields.rights}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Extent:
                                </label>
                                <input
                                    type="number"
                                    name="extent"
                                    placeholder="Enter extent"
                                    value={formFields.extent}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Remarks:
                                </label>
                                <textarea
                                    name="remarks"
                                    placeholder="Enter remarks"
                                    value={formFields.remarks}
                                    onChange={handleFieldChange}
                                    rows={2}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Donor:
                                </label>
                                <input
                                    type="text"
                                    name="donor"
                                    placeholder="Enter donor"
                                    value={formFields.donor}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Donation Date:
                                </label>
                                <input
                                    type="date"
                                    name="donationDate"
                                    value={formFields.donationDate}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Custodian:
                                </label>
                                <input
                                    type="text"
                                    name="custodian"
                                    placeholder="Enter custodian"
                                    value={formFields.custodian}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Is Payable:
                                </label>
                                <select
                                    name="isPayable"
                                    value={formFields.isPayable}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Classification:
                                </label>
                                <input
                                    type="text"
                                    name="classification"
                                    placeholder="Enter classification"
                                    value={formFields.classification}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-base text-gray-700">
                                    Volume:
                                </label>
                                <input
                                    type="text"
                                    name="volume"
                                    placeholder="Enter volume"
                                    value={formFields.volume}
                                    onChange={handleFieldChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        {/* File Input for attaching an item file */}
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-base text-gray-700">
                                Item File:
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-5 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                                onDrop={handleItemFileDrop}
                                onDragOver={handleItemFileDragOver}
                                onClick={() => document.getElementById("item-file-input").click()}
                            >
                                <div className="text-base text-gray-600">
                                    Drop your file here, or{" "}
                                    <span className="text-orange-500 font-medium">click to browse</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {itemFile ? `Selected file: ${itemFile.name}` : "Drag and drop file here"}
                                </p>
                                <input
                                    id="item-file-input"
                                    type="file"
                                    onChange={handleItemFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        {/* Extra Metadata Section */}
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-gray-700 mb-3">
                                Extra Metadata
                            </h2>
                            {metadataFields.length > 0 ? (
                                metadataFields.map((field) => (
                                    <div key={field.id} className="mb-4">
                                        <label className="block mb-1 font-medium text-gray-700">
                                            {`${field.schema.name}.${field.element}.${field.qualifier}`}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter value"
                                            value={metadataValues[field.id] || ""}
                                            onChange={(e) =>
                                                handleMetadataValueChange(field.id, e.target.value)
                                            }
                                            className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No extra metadata fields available.</p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 mt-5">
                            <button
                                type="button"
                                className="px-5 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                onClick={() => setFormView("collectionSelection")}
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
                )}
            </main>
        </div>
    );
}

export default NewItem;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function BatchImport() {
    const [contentFiles, setContentFiles] = useState(null);
    const [contentExcelFiles, setContentExcelFiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [importComplete, setImportComplete] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!contentFiles) {
            setError("Please select a zip file to upload.");
            return;
        }
        if (!contentExcelFiles) {
            setError("Please select an Excel file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("filesZip", contentFiles);
        formData.append("metadata", contentExcelFiles);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Please login.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/item/batch-create`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Request failed: ${errText}`);
            }

            setMessage("Items imported successfully.");
            setImportComplete(true);
        } catch (err) {
            setError(err.message || "Failed to import items.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSampleMetadata = () => {
        const link = document.createElement('a');
        link.href = '/assets/sample_metadata.xlsx';
        link.download = 'sample_metadata.xlsx';
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col font-serif">
            <div className="bg-orange-500 text-white py-3 px-5 flex items-center">
                <span className="font-bold ml-32 cursor-pointer">Home</span>
                <span className="mx-2 font-bold">&gt;</span>
                <span className="font-bold cursor-pointer">E-people</span>
            </div>
            <div className="max-w-3xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Import Batch</h2>
                <p className="text-sm text-gray-600 mb-6 border-b pb-4">
                    Drop or browse to a Simple Archive Format (SAF) zip file that includes the Items to import.
                </p>
                <div
                    className="border-2 border-dashed border-blue-500 bg-blue-50 rounded p-6 text-center cursor-pointer"
                    onClick={() => document.getElementById("fileInputZip").click()}
                >
                    <div className="text-blue-500 font-bold">Drop your zip file here, or click to browse</div>
                    <input
                        id="fileInputZip"
                        type="file"
                        className="hidden"
                        onChange={(e) => setContentFiles(e.target.files[0])}
                    />
                    {contentFiles && <p className="mt-2 text-sm text-gray-700">Selected file: {contentFiles.name}</p>}
                </div>
                <br /><br /><br />
                <div
                    className="border-2 border-dashed border-blue-500 bg-blue-50 rounded p-6 text-center cursor-pointer"
                    onClick={() => document.getElementById("fileInputExcel").click()}
                >
                    <div className="text-blue-500 font-bold">Drop your Excel file here, or click to browse</div>
                    <input
                        id="fileInputExcel"
                        type="file"
                        className="hidden"
                        onChange={(e) => setContentExcelFiles(e.target.files[0])}
                    />
                    {contentExcelFiles && <p className="mt-2 text-sm text-gray-700">Selected file: {contentExcelFiles.name}</p>}
                </div>

                {/* Button Container */}
                <div className="flex justify-between items-center mt-6">
                    {/* Back button on the left */}
                    <button
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>

                    {/* Buttons aligned on the right */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadSampleMetadata}
                            className="bg-white border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Download Excel File
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Proceed"}
                        </button>
                        {importComplete && (
                            <button
                                onClick={() => navigate("/search")}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Go to Search Items
                            </button>
                        )}
                    </div>
                </div>

                {message && <p className="text-green-600 mt-4">{message}</p>}
                {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>
        </div>
    );
}

export default BatchImport;

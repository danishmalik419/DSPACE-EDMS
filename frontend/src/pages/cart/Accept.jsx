import React from 'react';
import { useNavigate } from "react-router-dom";



const AcceptPage = () => {
    const navigate = useNavigate();
    const requestData = {
        requestId: "REQ-2024-00005",
        user: "Bhavana Goyal",
        dateSubmitted: "February 28, 2025",
        status: "Pending",
        items: [
            { fileName: "File name.pdf", type: "PDF", size: "2MB" },
            { fileName: "File name.mp3", type: "Audio", size: "5MB" },
            { fileName: "File name.mp4", type: "Video", size: "25MB" },
            { fileName: "File name.docx", type: "Document", size: "1.5MB" }
        ]
    };

    const handleDownload = (fileName) => {
        console.log(`Downloading ${fileName}`);
    };

    const handleDownloadAll = () => {
        console.log("Downloading all files");
    };

    const closeModal = () => {
        navigate("/request");
        setIsOpen(false);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white w-11/12 max-w-lg rounded shadow-lg">
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-lg text-gray-600 font-normal">Request Details</h2>
                    <button
                        onClick={closeModal}
                        className="bg-transparent border-0 text-xl cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="p-5">
                    <div className="mb-5">
                        <div className="flex mb-2">
                            <span className="w-32 text-gray-500">Request ID :</span>
                            <span>{requestData.requestId}</span>
                        </div>
                        <div className="flex mb-2">
                            <span className="w-32 text-gray-500">User :</span>
                            <span>{requestData.user}</span>
                        </div>
                        <div className="flex mb-2">
                            <span className="w-32 text-gray-500">Date Submitted :</span>
                            <span>{requestData.dateSubmitted}</span>
                        </div>
                        <div className="flex mb-2">
                            <span className="w-32 text-gray-500">Status :</span>
                            <button className="bg-yellow-50 text-yellow-500 border border-yellow-300 px-3 py-1 rounded-md text-sm">
                                {requestData.status}
                            </button>

                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Items in cart:</h3>
                        <div className="border border-gray-200 rounded">
                            <div className="grid grid-cols-4 p-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
                                <div>File Name</div>
                                <div>Type</div>
                                <div>Size</div>
                                <div>Action</div>
                            </div>

                            {requestData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 p-3 border-b border-gray-200 last:border-b-0">
                                    <div>{item.fileName}</div>
                                    <div>{item.type}</div>
                                    <div>{item.size}</div>
                                    <div>
                                        <button
                                            onClick={() => handleDownload(item.fileName)}
                                            className="text-orange-500 underline"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5">
                        <button
                            onClick={handleDownloadAll}
                            className="bg-green-600 text-white py-3 px-4 rounded font-medium w-full flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptPage;
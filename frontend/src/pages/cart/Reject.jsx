import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RejectPage = () => {
    const navigate = useNavigate();
    const [rejectionReason, setRejectionReason] = useState('');
    const [status, setStatus] = useState('Pending');

    const requestData = {
        requestId: "REQ-2024-00005",
        user: "Bhavana Goyal",
        dateSubmitted: "February 28, 2025",
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

    const handleReject = () => {
        setStatus('Rejected');
        console.log(`Rejecting request with reason: ${rejectionReason}`);
        navigate('/cartManagement');
    };

    const closeModal = () => {
        navigate('/request');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white w-11/12 max-w-lg rounded shadow-lg">
                <div className="flex justify-between items-center px-5 py-2 border-b border-gray-200">
                    <h2 className="text-lg text-gray-600 font-normal">Request Details</h2>
                    <button
                        onClick={closeModal}
                        className="bg-transparent border-0 text-xl cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-3">
                        <div className="flex mb-1">
                            <span className="w-32 text-gray-500 text-md">Request ID :</span>
                            <span className="text-md">{requestData.requestId}</span>
                        </div>
                        <div className="flex mb-1">
                            <span className="w-32 text-gray-500 text-md">User :</span>
                            <span className="text-md">{requestData.user}</span>
                        </div>
                        <div className="flex mb-1">
                            <span className="w-32 text-gray-500 text-md">Date Submitted :</span>
                            <span className="text-md">{requestData.dateSubmitted}</span>
                        </div>
                        <div className="flex mb-1">
                            <span className="w-32 text-gray-500 text-md">Status :</span>
                            <button className="bg-yellow-50 text-yellow-500 border border-yellow-300 px-3 py-1 rounded-md text-sm">
                                {status}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-md mb-2">Items in cart:</h3>
                        <div className="border border-gray-200 rounded mb-3">
                            <div className="grid grid-cols-4 p-2 bg-gray-50 border-b border-gray-200 font-medium text-gray-600 text-sm">
                                <div>File Name</div>
                                <div>Type</div>
                                <div>Size</div>
                                <div>Action</div>
                            </div>

                            {requestData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 p-2 border-b border-gray-200 last:border-b-0 text-sm">
                                    <div>{item.fileName}</div>
                                    <div>{item.type}</div>
                                    <div>{item.size}</div>
                                    <div>
                                        <button
                                            onClick={() => handleDownload(item.fileName)}
                                            className="text-gray-400 underline"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm">
                                <span className="text-gray-700">Reason for rejection: <span className="text-red-500">*</span></span>
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 h-16 text-md"
                                placeholder="Type your text here"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            onClick={handleReject}
                            className="bg-red-600 text-white py-2 px-4 rounded font-medium w-full flex items-center justify-center text-sm"
                        >
                            <span className="mr-2">✕</span> Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectPage;
import React from 'react';
import { X, Check, X as XIcon } from 'lucide-react';

const RequestDetailsDialog = () => {
  const handleClose = () => {
    window.location.href = '/cartManagement';
  
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-black bg-opacity-30">
      <div className="bg-white shadow-md rounded-md max-w-md w-full mx-4 border border-gray-200 max-h-screen overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-medium">Request Details</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex">
              <span className="text-gray-500 w-32">Request ID :</span>
              <span>REQ-2024-00005</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-32">User :</span>
              <span>Bhavana Goyal</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-32">Date Submitted :</span>
              <span>February 28, 2025</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Status :</span>
              <div className="px-2 py-0.5 text-sm font-medium bg-green-100 text-green-600 rounded-md">
                Resolved
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-4 text-gray-600">Items in cart:</h3>
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="py-2 px-4 font-medium text-gray-500">File Name</th>
                  <th className="py-2 px-4 font-medium text-gray-500">Type</th>
                  <th className="py-2 px-4 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4">File name.pdf</td>
                  <td className="py-2 px-4">PDF</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center text-green-600">
                      <Check size={16} className="mr-1" /> Accepted
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4">File name.mp3</td>
                  <td className="py-2 px-4">Audio</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center text-red-600">
                      <XIcon size={16} className="mr-1" /> Rejected
                    </div>
                  </td>
                </tr>
                <tr className="py-0">
                  <td colSpan={3} className="py-1 px-4 text-gray-500 text-sm italic">
                    Reason for rejection : Duplicate File
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4">File name.mp4</td>
                  <td className="py-2 px-4">Video</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center text-green-600">
                      <Check size={16} className="mr-1" /> Accepted
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4">File name.docx</td>
                  <td className="py-2 px-4">Document</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center text-green-600">
                      <Check size={16} className="mr-1" /> Accepted
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsDialog;
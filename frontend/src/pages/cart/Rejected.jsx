import React from 'react';
import { X } from 'lucide-react';

const RejectedRequestDetails = () => {
  const handleClose = () => {
    window.location.href = '/cartManagement';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white shadow-md rounded-md max-w-md w-full mx-4 border border-gray-200 max-h-screen overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-medium text-gray-700">Request Details</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-md">
            <div className="text-gray-500">Requet ID :</div>
            <div className="font-medium col-span-2">REQ-2024-00005</div>
            
            <div className="text-gray-500">User :</div>
            <div className="font-medium col-span-2">Bhavana Goyal</div>
            
            <div className="text-gray-500">Date Submitted :</div>
            <div className="font-medium col-span-2">February 28, 2025</div>
            
            <div className="text-gray-500">Status :</div>
            <div className="col-span-2">
              <button className="px-2 py-1 text-sm font-medium text-red-500 bg-red-50 border border-red-300 rounded-md">
                Rejected
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2 text-md text-gray-700">Items in cart:</h3>
            <table className="w-full text-md">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="py-2 px-2 font-medium text-gray-500">File Name</th>
                  <th className="py-2 px-2 font-medium text-gray-500">Type</th>
                  <th className="py-2 px-2 font-medium text-gray-500">Size</th>
                  <th className="py-2 px-2 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2">File name.pdf</td>
                  <td className="py-2 px-2">PDF</td>
                  <td className="py-2 px-2">2MB</td>
                  <td className="py-2 px-2">
                    <button className="text-gray-400 underline text-md">Download</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2">File name.mp3</td>
                  <td className="py-2 px-2">Audio</td>
                  <td className="py-2 px-2">5MB</td>
                  <td className="py-2 px-2">
                    <button className="text-gray-400 underline text-md">Download</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2">File name.mp4</td>
                  <td className="py-2 px-2">Video</td>
                  <td className="py-2 px-2">25MB</td>
                  <td className="py-2 px-2">
                    <button className="text-gray-400 underline text-md">Download</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2">File name.docx</td>
                  <td className="py-2 px-2">Document</td>
                  <td className="py-2 px-2">1.5MB</td>
                  <td className="py-2 px-2">
                    <button className="text-gray-400 underline text-md">Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-2">
            <div className="font-medium text-black-300 text-md">Reason for rejection :</div>
            <div className="text-gray-400 text-md ">
              Reason for rejection Reason for rejection Reason for rejection Reason for rejection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectedRequestDetails;
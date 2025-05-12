import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const RequestDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [itemsStatus, setItemsStatus] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});
  const [showReasonInputs, setShowReasonInputs] = useState({});

  // Fetch order details from the API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/librarian/order/getOrder/${orderId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const resData = await response.json();
        if (resData.success && resData.data) {
          setOrderData(resData.data);
        } else {
          console.error('Error in API response:', resData.message);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Initialize itemsStatus based on orderItems once the orderData is fetched
  useEffect(() => {
    if (orderData && orderData.orderItems) {
      const initialStatus = {};
      orderData.orderItems.forEach(item => {
        initialStatus[item.id] =
          item.isAccepted === null ? 'Pending' : (item.isAccepted ? 'Accepted' : 'Rejected');
      });
      setItemsStatus(initialStatus);
    }
  }, [orderData]);

  const closeModal = () => {
    navigate("/cartManagement");
  };

  // Helper function to call the review API.
  const callReviewAPI = async (orderItemId, action, reason) => {
    const token = localStorage.getItem('token');
    const payload = { orderItemId, action };
    if (action === "DECLINED") {
      payload.reason = reason;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/librarian/order/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );
    if (!response.ok) {
      throw new Error('Failed to review order item');
    }
    return response.json();
  };

  // Helper function to download file automatically.
  const downloadFile = async (fileId, fileName) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/librarian/file/${fileId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new Error('Failed to get file');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleFileAccept = async (orderItemId) => {
    // Mark as accepted immediately
    setItemsStatus(prev => ({ ...prev, [orderItemId]: 'Accepted' }));
    try {
      await callReviewAPI(orderItemId, "ACCEPTED", null);
    } catch (error) {
      console.error("Error calling review API for acceptance:", error);
    }
    // Find the order item details and download the file
    const orderItem = orderData.orderItems.find(it => it.id === orderItemId);
    if (orderItem && orderItem.item && orderItem.item.file) {
      try {
        await downloadFile(orderItem.item.file.id, orderItem.item.file.name);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }
  };

  const handleFileReject = (orderItemId) => {
    // Show reason input for rejection.
    setShowReasonInputs(prev => ({ ...prev, [orderItemId]: true }));
  };

  const handleReasonSubmit = async (orderItemId) => {
    if (!rejectReasons[orderItemId] || rejectReasons[orderItemId].trim() === '') {
      return; // Don't submit if reason is empty.
    }
    setItemsStatus(prev => ({ ...prev, [orderItemId]: 'Rejected' }));
    setShowReasonInputs(prev => ({ ...prev, [orderItemId]: false }));
    try {
      await callReviewAPI(orderItemId, "DECLINED", rejectReasons[orderItemId]);
    } catch (error) {
      console.error("Error calling review API for rejection:", error);
    }
  };

  const handleReasonChange = (orderItemId, reason) => {
    setRejectReasons(prev => ({ ...prev, [orderItemId]: reason }));
  };

  // Iteratively accept every item that is still pending
  const handleAcceptAll = async () => {
    if (!orderData || !orderData.orderItems) return;
    for (const orderItem of orderData.orderItems) {
      if (itemsStatus[orderItem.id] === 'Pending') {
        try {
          await handleFileAccept(orderItem.id);
        } catch (error) {
          console.error(`Error accepting order item ${orderItem.id}:`, error);
        }
      }
    }
  };

  if (!orderData) {
    return <div>Loading order details...</div>;
  }

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
              <span className="w-32 text-gray-600">Request ID:</span>
              <span>{orderData.id}</span>  
            </div>
            <div className="flex mb-2">
              <span className="w-32 text-gray-600">User:</span>
              <span>{orderData.user.firstName} {orderData.user.lastName}</span>
            </div>
            <div className="flex mb-2">
              <span className="w-32 text-gray-600">Date Submitted:</span>
              <span>{new Date(orderData.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex mb-2">
              <span className="w-32 text-gray-600">Status:</span>
              <button className="bg-yellow-50 text-yellow-500 border border-yellow-300 px-3 py-1 rounded-md text-sm">
                Pending
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Items in cart:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded">
              <div className="grid grid-cols-4 p-3 bg-gray-100 border-b border-gray-200 font-medium text-gray-600">
                <div>File Name</div>
                <div>Type</div>
                <div>Status</div>
                <div>Action</div>
              </div>

              {orderData.orderItems.map((orderItem) => (
                <div key={orderItem.id} className="border-b border-gray-200 last:border-b-0">
                  <div className="grid grid-cols-4 p-3">
                    <div>{orderItem.item.file.name}</div>
                    <div>{orderItem.item.file.type}</div>
                    <div>{itemsStatus[orderItem.id]}</div>
                    <div className="flex space-x-2">
                      {itemsStatus[orderItem.id] === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleFileAccept(orderItem.id)}
                            className="border border-green-600 text-green-600 bg-white px-3 py-1 rounded-md text-sm hover:bg-green-50"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleFileReject(orderItem.id)}
                            className="border border-gray-300 text-gray-600 bg-white px-3 py-1 rounded-md text-sm hover:bg-gray-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {itemsStatus[orderItem.id] === 'Accepted' && (
                        <div className="flex items-center text-green-600">
                          <span className="mr-1">✓</span> Accepted
                        </div>
                      )}

                      {itemsStatus[orderItem.id] === 'Rejected' && (
                        <div className="flex items-center text-red-600">
                          <span className="mr-1">×</span> Rejected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showReasonInputs[orderItem.id] && (
                    <div className="px-3 pb-3">
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder="Reason for rejection (required)"
                          className="border border-gray-300 rounded-l p-2 w-full"
                          value={rejectReasons[orderItem.id] || ''}
                          onChange={(e) => handleReasonChange(orderItem.id, e.target.value)}
                        />
                        <button 
                          onClick={() => handleReasonSubmit(orderItem.id)}
                          disabled={!rejectReasons[orderItem.id] || rejectReasons[orderItem.id].trim() === ''}
                          className="bg-gray-200 border border-gray-300 border-l-0 rounded-r p-2 px-3 disabled:text-gray-400"
                        >
                          <span>→</span>
                        </button>
                      </div>
                      {itemsStatus[orderItem.id] === 'Rejected' && (
                        <div className="text-sm text-gray-600 mt-1">
                          Reason: {rejectReasons[orderItem.id]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <button
              onClick={handleAcceptAll}
              disabled={
                !orderData.orderItems.some(item => itemsStatus[item.id] === 'Pending')
              }
              className="bg-orange-500 text-white py-2 px-6 rounded-md font-medium w-full disabled:bg-orange-300"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPage;
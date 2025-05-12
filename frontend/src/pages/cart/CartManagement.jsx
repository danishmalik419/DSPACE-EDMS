import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const CartManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  const getOrders = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/librarian/order`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const res = await response.json();
      const groups = res.data.data;

      // Flatten the grouped orders and compute item-level statuses
      const orders = groups.flatMap(group =>
        group.orders.map(order => {
          // Map each orderItem and compute its status
          const updatedOrderItems = order.orderItems.map(item => ({
            ...item,
            status: item.isAccepted === true
              ? 'Accepted'
              : item.isAccepted === false
                ? 'Rejected'
                : 'Pending'
          }));

          // If at least one item is pending, mark the order as 'Pending';
          // otherwise, mark it as 'Resolved'
          const orderStatus = updatedOrderItems.some(item => item.status === 'Pending')
            ? 'Pending'
            : 'Resolved';

          return {
            ...order,
            userName: `${group.user.firstName} ${group.user.lastName}`,
            orderItems: updatedOrderItems,
            status: orderStatus
          };
        })
      );

      setCartData(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'Pending':
        return cartData.filter(order => order.status === 'Pending');
      case 'Resolved':
        return cartData.filter(order => order.status === 'Resolved');
      default:
        return cartData;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-orange-500 text-white p-3 text-sm">
        <div className="ml-44">
          <a href="/">Home</a> &gt; Cart Management
        </div>
      </div>

      <div className="bg-white p-4 max-w-4xl ml-44">
        <h1 className="text-2xl font-semibold">Cart Management</h1>
      </div>

      <hr className="border-t-2 border-gray-200" />

      <div className="flex justify-left space-x-8 p-4 ml-44">
        {['All', 'Pending', 'Resolved'].map((tab) => (
          <button
            key={tab}
            className={`
              pb-2 
              ${activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-orange-500 hover:border-b-2 hover:border-orange-500'}
            `}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <hr className="border-t-2 border-gray-200" />

      <div className="max-w-4xl mx-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b">
              <th className="p-3 text-left">Request ID</th>
              <th className="p-3 text-left">User Name</th>
              <th className="p-3 text-left">Item Requested</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredItems().map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.userName}</td>
                <td className="p-3">
                  {order.orderItems && order.orderItems[0]
                    ? order.orderItems[0].item.title
                    : ''}
                </td>
                <td className="p-3">{order.orderItems ? order.orderItems.length : 0}</td>
                <td className="p-3">
                  <button
                    className="text-orange-500 hover:underline"
                    onClick={()=>{navigate(`/request/`+order.id)}}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CartManagement;
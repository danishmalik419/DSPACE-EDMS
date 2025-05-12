import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MyCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's cart from the API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/user/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch cart data");
        }
        return res.json();
      })
      .then((data) => {
        setCartItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch cart data");
        setLoading(false);
      });
  }, []);

  // Compute summary data by grouping items by file type (format)
  const summary = cartItems.reduce((acc, cartItem) => {
    const format = cartItem.item.file ? cartItem.item.file.type.toUpperCase() : "Unknown";
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {});
  const summaryArray = Object.entries(summary).map(([type, count]) => ({ type, count }));
  const totalItems = cartItems.length;

  const handleRemove = async (cartItemId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to remove item: ${errText}`);
      }
      // Remove the item from the cartItems state variable.
      setCartItems((prevItems) => prevItems.filter(item => item.id !== cartItemId));
      alert("Item removed successfully");
    } catch (error) {
      console.error("Error removing cart item:", error);
      alert("Error removing item from cart");
    }
  };
  

  const handleSubmitCart = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to submit cart: ${errText}`);
      }
      // Clear the cart state variable on successful submission.
      setCartItems([]);
      alert("Cart submitted successfully");
    } catch (error) {
      console.error("Error submitting cart:", error);
      alert("Error submitting cart");
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-orange-500 text-white p-2">
        <div className="container mx-auto flex">
          <a href="/" className="text-white ml-12">Home</a>
          <span className="text-white ml-2">{'>'}</span>
          <span className="text-white ml-2">My Cart</span>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="container mx-auto p-4">
        <h1 className="text-lg font-medium">My cart</h1>
        <p className="text-gray-600 text-sm">
          Review your selected documents before submitting the request.
        </p>
        <hr className="my-4 border-gray-300" />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Document List (Left Side) */}
        <div className="w-full md:w-2/3 shadow p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-gray-700">Document Title</th>
                  <th className="p-2 text-left text-gray-700">Format</th>
                  <th className="p-2 text-left text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((cart) => (
                  <tr key={cart.id}>
                    <td className="p-2">{cart.item.title}</td>
                    <td className="p-2">
                      {cart.item.file ? cart.item.file.type.toUpperCase() : "Unknown"}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleRemove(cart.id)}
                        className="bg-red-800 text-white px-4 py-2 flex items-center gap-2 hover:bg-red-700"
                      >
                        <X size={16} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {cartItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-2 text-center text-gray-600">
                      Your cart is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 shadow p-4">
          <h2 className="font-medium text-lg mb-2">Summary</h2>
          {summaryArray.map((item, index) => (
            <div key={index} className="flex justify-between text-sm mb-1">
              <span>{item.type}</span>
              <span className="text-gray-600">x{item.count}</span>
            </div>
          ))}
          <div className="border-t border-gray-300 mt-2 pt-2 text-sm">
            <div className="flex justify-between font-medium">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
          </div>
          <button
            onClick={handleSubmitCart}
            className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 w-full mt-4 text-sm"
          >
            Proceed
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Once your documents are ready to be submitted, you can request librarian approval. The librarian will review and notify you via email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyCartPage;
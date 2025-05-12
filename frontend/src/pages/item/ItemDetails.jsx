import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { HiInformationCircle } from "react-icons/hi";
import { IoMdCart } from "react-icons/io";
import logo from "../../assets/logo.jpg";

function ItemDetails() {
  const [searchParams] = useSearchParams();
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/user/item/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItem(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [itemId]);

  const role = localStorage.getItem("role");

  // Function to add the item to the user's cart (for role "USER")
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      alert("Item added to cart successfully");
    } catch (err) {
      console.error(err);
      alert("Item Already Requested");
    }
  };

  // Function to download the file (for admin or librarian)
  const handleDownloadFile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/librarian/file/${item.file.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading file");
    }
  };

  // Function to redirect to metadata page with itemId as a query parameter.
  const handleShowMetadata = () => {
    navigate(`/metadata?itemId=${item.id}`);
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-orange-500 text-white">
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center space-x-2">
            <a href="/" className="text-sm hover:underline">
              Home
            </a>
            <span className="text-sm">/</span>
            <p
              className="text-sm"
            >
              {item.collection}
            </p>
            <span className="text-sm">/</span>
            <span className="text-sm">{item.title}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 md:px-20 py-6">
          <h1 className="text-2xl font-bold mb-6 text-center">{item.title}</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="border border-gray-200 p-2">
                <img
                  src={logo}
                  alt={item.title}
                  className="w-full h-auto bg-white border border-gray-300 object-cover"
                  style={{ maxHeight: "300px" }}
                />

                <div className="mt-4 space-y-2">
                  <div>
                    <div className="text-base font-semibold">Date</div>
                    <div className="text-base">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  {
                    item.author && (
                      <div>
                    <div className="text-base font-semibold">Author</div>
                    <div className="text-base">{item.author}</div>
                  </div>
                    )
                  }
                  <div>
                    <div className="text-base font-semibold">Collection</div>
                    <div className="text-base">{item.collection}</div>
                  </div>
                </div>

                {role === "USER" ? (
                  <button
                    onClick={handleAddToCart}
                    className="mt-4 w-3/4 bg-orange-500 text-white py-3 px-2 text-sm flex items-center justify-center"
                  >
                    <span className="mr-1">
                      <IoMdCart className="text-white text-lg" />
                    </span>
                    Add to cart
                  </button>
                ) : (
                  <div
                    onClick={handleDownloadFile}
                    className="mt-4 w-3/4 bg-gray-200 text-black py-3 px-2 text-sm flex items-center justify-center cursor-pointer"
                  >
                    {item.file && item.file.name
                      ? item.file.name
                      : "No file available"}
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-3/4">
              <div className="mb-6">
                <h2 className="text-base font-semibold mb-2">Abstract</h2>
                <p className="text-sm text-gray-700">{item.subject}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-base font-semibold mb-2">URI</h2>
                <p className="text-sm text-orange-500">
                  <a href={window.location.href} className="hover:underline">
                    {window.location.href}
                  </a>
                </p>
              </div>

              <div className="inline-block">
                <button
                  onClick={handleShowMetadata}
                  className="text-orange-500 border border-orange-500 rounded-none px-6 py-2 text-sm flex items-center"
                >
                  <HiInformationCircle className="mr-1 text-orange-500 text-lg" />{" "}
                  Show all metadata
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ItemDetails;
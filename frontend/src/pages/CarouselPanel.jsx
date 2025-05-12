import React, { useState, useEffect, useRef } from "react";

const CarouselAdminPage = () => {
  const [images, setImages] = useState([]); // Array of image objects with blob URL
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch image details and then fetch each image blob to display in the card.
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images-details/Carousel`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const imageObjs = data.data;
        // Fetch all image blobs concurrently
        const imagesWithBlob = await Promise.all(
          imageObjs.map(async (imgObj) => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/static-image/${imgObj.id}`);
            if (!res.ok) {
              throw new Error("Failed to fetch image blob");
            }
            const blob = await res.blob();
            const objectURL = URL.createObjectURL(blob);
            return { ...imgObj, objectURL };
          })
        );
        setImages(imagesWithBlob);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Remove an image using the remove API and update the list.
  const handleRemove = async (imageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/file/remove-static/${imageId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Update the list after removal
        fetchImages();
      } else {
        alert("Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Error removing image");
    }
  };

  // Handle file selection and call the add API.
  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/file/add-static/Carousel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        // Refresh list when an image is added
        fetchImages();
      } else {
        alert("Failed to add image: " + data.message);
      }
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Error adding image");
    }
  };

  // When the add image button is clicked, trigger the hidden file input.
  const handleAddButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Carousel Images Administration</h1>
      <button
        onClick={handleAddButtonClick}
        className="mb-4 px-4 py-2 bg-orange-500 text-white rounded"
      >
        Add Image
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleAddImage}
        accept="image/*"
      />
      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? (
        <p>No images found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="border rounded p-2 shadow">
              <img
                src={img.objectURL}
                alt={img.imageName}
                className="w-full h-48 object-cover mb-2"
              />
              <p>
                <strong>Name:</strong> {img.imageName}
              </p>
              <p>
                <strong>Extension:</strong> {img.imageExtension}
              </p>
              <p>
                <strong>Type:</strong> {img.imageFor}
              </p>
              <p>
                <strong>Size:</strong> {parseFloat((img.imageSize / 1000000).toFixed(2))} MB
              </p>
              <button
                onClick={() => handleRemove(img.id)}
                className="mt-2 px-2 py-1 border border-orange-500  text-orange-500 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselAdminPage;
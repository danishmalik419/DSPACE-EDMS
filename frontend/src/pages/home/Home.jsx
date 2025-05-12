import React, { useState, useEffect } from "react";
import ArtifactCard from "../../components/ArtifactCard";
import book from "../../assets/book.jpg";
import news from "../../assets/news.jpg";
import photo from "../../assets/photo.jpg";
import tap from "../../assets/tap.jpg";
import card from "../../assets/card.jpg";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const artifacts = [
  { id: 1, label: "NEWSPAPERS", image: news },
  { id: 2, label: "PHOTORAPHS", image: photo },
  { id: 3, label: "MANUSCRIPTS", image: book },
  { id: 4, label: "MICROFILMS", image: tap }
];

const submissions = [
  {
    id: 1,
    image: card,
    title: "Artificial Intelligence and Medical Humanities",
    author: "(Springer Nature, 2020-07-11) Ostherr, Kirsten",
    description:
      "The use of artificial intelligence in healthcare has led to debates about the role of human clinicians in the increasingly technological contexts of medicine. Some researchers have argued that AI will augment the capacities of physicians and."
  },
  {
    id: 2,
    image: card,
    title: "Artificial Intelligence and Medical Humanities",
    author: "(Springer Nature, 2020-07-11) Ostherr, Kirsten",
    description:
      "The use of artificial intelligence in healthcare has led to debates about the role of human clinicians in the increasingly technological contexts of medicine. Some researchers have argued that AI will augment the capacities of physicians and."
  },
  {
    id: 3,
    image: card,
    title: "Artificial Intelligence and Medical Humanities",
    author: "(Springer Nature, 2020-07-11) Ostherr, Kirsten",
    description:
      "The use of artificial intelligence in healthcare has led to debates about the role of human clinicians in the increasingly technological contexts of medicine. Some researchers have argued that AI will augment the capacities of physicians and."
  },
  {
    id: 4,
    image: card,
    title: "Artificial Intelligence and Medical Humanities",
    author: "(Springer Nature, 2020-07-11) Ostherr, Kirsten",
    description:
      "The use of artificial intelligence in healthcare has led to debates about the role of human clinicians in the increasingly technological contexts of medicine. Some researchers have argued that AI will augment the capacities of physicians and."
  },
  // Other submissions...
];

const SubmissionCard = ({ image, title, author, description }) => {
  return (
    <div className="flex border-b border-gray-300">
      <div className="w-40 flex-shrink-0">
        <img
          src={image}
          alt="Submission"
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex flex-col justify-between p-4">
        <div>
          <div className="mb-2">
            <div className="bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded inline-block">
              Published
            </div>
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-600">{author}</p>
          <p className="text-gray-700 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

const DigitalArchivePlatform = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    if (carouselImages.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [carouselImages]);  

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Handle pressing Enter in the search input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (localStorage.getItem("token")) {
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/images-details/Carousel`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const json = await response.json();
        const imageObjs = json.data;
        if(imageObjs.length > 0){
          const images = [];
          for(let i=0; i<imageObjs.length; i++){
            const imageObj = imageObjs[i];
            const response = await fetch(`${import.meta.env.VITE_API_URL}/static-image/${imageObj.id}`);
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            images.push(objectURL);
          }
          setCarouselImages(images);
          console.log(images);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    }
    fetchImages();
  }, []);

  return (
    <>
      {/* Fullscreen Carousel Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Carousel Images */}
        <div className="absolute inset-0 w-full h-full">
          {carouselImages.map((img, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={img} 
                alt={`Slide ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

        {/* Content */}
        <div className="relative z-20 w-full h-full flex items-center">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between w-full h-full pl-[250px]">
            <div className="w-full md:w-1/2 text-white z-30 md:ml-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Unlock the <span className="text-orange-500">Past</span>, Preserve the{" "}
                <span className="text-orange-500">Future</span>
              </h1>
              <p className="text-gray-200 mb-6 text-base md:text-lg">
                Explore our digitized collection of rare manuscripts, newspapers,
                photographs, microfilm, and artifacts all at one place for your research work.
              </p>
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="w-full px-4 py-2 pl-10 text-black border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute z-30 top-1/2 w-full flex justify-between px-4 pl-[150px]">
          <button 
            onClick={prevSlide}
            className="bg-white/30 hover:bg-white/50 text-white rounded-full p-2 transition"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="bg-white/30 hover:bg-white/50 text-white rounded-full p-2 transition"
          >
            →
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Artifacts Section */}
      <div className="p-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Explore By Artifact Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 justify-center gap-5">
            {artifacts.map((artifact) => (
              <div key={artifact.id} className="flex justify-center">
                <ArtifactCard image={artifact.image} label={artifact.label} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6">Recent Submissions</h1>
          <div className="space-y-6">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} {...submission} />
            ))}
          </div>
          <div className="flex justify-start mt-4">
            <button className="border border-orange-500 text-orange-500 px-3 py-1 text-sm rounded hover:bg-orange-100">
              Load More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalArchivePlatform;
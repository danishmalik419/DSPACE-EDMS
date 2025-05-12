import React from 'react';

const ArtifactCard = ({ image, label }) => {
  return (
    <div className="relative flex flex-col items-center overflow-hidden border border-gray-200 shadow-none">
      <img 
        src={image}  
        alt={label} 
        className="w-full h-62 object-cover bg-gray-100" 
      />
      <div className="absolute bottom-0 w-full flex justify-center pb-2">
        <span className="bg-orange-500 text-white text-xs font-medium px-4 py-1 uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ArtifactCard;

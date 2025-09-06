// BusinessMapSVG.tsx
import React from "react";

export const BusinessMapSVG: React.FC = () => {
  return (
    <img
      src={`${import.meta.env.BASE_URL}asset/business-map.webp`}
      alt="Business Map"
      className="absolute top-0 left-0 h-full w-full object-cover pointer-events-none"
    />
  );
};

export default BusinessMapSVG;

import React from 'react';

export const BusinessMapSVG: React.FC = () => {
    return (
        <img
            src="/public/asset/business-map.png"
            alt="Business Map"
            className="absolute top-0 left-0 h-full w-full object-cover pointer-events-none"
        />
    );
};

export default BusinessMapSVG;
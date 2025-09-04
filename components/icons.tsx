

import React from 'react';
import { PetType } from '../types';

interface IconProps {
    className?: string;
}

export const IqIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-blue-400"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

export const HappinessIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-yellow-400"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zM7.293 14.707a1 1 0 010-1.414L8.586 12H11.414l1.293 1.293a1 1 0 01-1.414 1.414L10 13.414l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

export const eqIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-purple-400"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7zm-1 4a1 1 0 100 2h2a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

export const HealthIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-red-500"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

export const SkillIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-green-400"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
  </svg>
);

export const MoneyIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-1 text-green-400"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.328zM11.567 9.182c-.158.103-.346.196-.567.267V7.849a2.5 2.5 0 001.162.333z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.743 1.118 1 1 0 00.816 1.789a2.535 2.535 0 011.927-1.118V8.5a1 1 0 102 0V6.255a2.535 2.535 0 011.927 1.118 1 1 0 10.816-1.79 4.535 4.535 0 00-1.743-1.118V5zM10 12.5a2.5 2.5 0 01-2.5-2.5 1 1 0 10-2 0 4.5 4.5 0 004.5 4.5 1 1 0 100-2z" clipRule="evenodd" />
    </svg>
);

export const MaleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-blue-300"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

export const FemaleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-pink-300"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

export const DogIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H9c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>
);
export const CatIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 15.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5c2.5 0 2.5-2.5 5-2.5V3.14c-2.5 0-2.5 2.5-5 2.5S12 3.14 9.5 3.14c-2.5 0-2.5 2.5-5 2.5v12.36zM19.5 21c-2.5 0-2.5-2.5-5-2.5s-2.5 2.5-5 2.5-2.5-2.5-5-2.5v-2.14c2.5 0 2.5 2.5 5 2.5s2.5-2.5 5-2.5 2.5 2.5 5 2.5v2.14z"/></svg>
);
export const ParrotIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>
);
export const HorseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c-4.26 0-7.75 3.49-7.75 7.75 0 1.95.73 3.73 1.94 5.12.6.7 1.54 1.13 2.56 1.13.9 0 1.73-.37 2.34-.98.6-.6.98-1.44.98-2.34 0-1.02-.45-1.92-1.17-2.56-.72-.63-1.7-1-2.75-1-1.28 0-2.4.63-3.12 1.56-.37.47-.88.75-1.44.75-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5c.31 0 .6.1.84.27.76.55 1.74.88 2.8.88 1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5-3.5 1.57-3.5 3.5v.5h-2v-.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5H11v2h1c1.38 0 2.5-1.12 2.5-2.5 0-.69-.28-1.32-.73-1.77.45-.45.73-1.08.73-1.77 0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5c0 .69.28 1.32.73 1.77-.45.45-.73 1.08-.73 1.77 0 1.38 1.12 2.5 2.5 2.5h1v2h-1c-2.49 0-4.5-2.01-4.5-4.5 0-1.17.45-2.24 1.2-3.06C6.76 13.99 6.25 12.8 6.25 11.5c0-3.18 2.57-5.75 5.75-5.75S17.75 8.32 17.75 11.5c0 1.3-.51 2.49-1.34 3.34.75.84 1.2 1.91 1.2 3.06 0 2.49-2.01 4.5-4.5 4.5h-1v-2h1c1.38 0 2.5-1.12 2.5-2.5z"/></svg>
);
export const FishIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

export const RobotAvatarIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
    <rect x="25" y="30" width="50" height="40" rx="8" fill="#64748b" />
    <circle cx="40" cy="50" r="6" fill="#67e8f9" stroke="white" strokeWidth="2" />
    <circle cx="60" cy="50" r="6" fill="#67e8f9" stroke="white" strokeWidth="2" />
    <line x1="50" y1="30" x2="50" y2="20" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="15" r="5" fill="#ef4444" />
  </svg>
);


export const UpgradeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
  </svg>
);

export const getPetIcon = (petType: PetType): React.ReactElement | null => {
    const props = { className: 'h-4 w-4 mr-1 inline-block text-cyan-400' };
    switch(petType) {
        case PetType.Dog: return <DogIcon {...props} />;
        case PetType.Cat: return <CatIcon {...props} />;
        case PetType.Parrot: return <ParrotIcon {...props} />;
        case PetType.Horse: return <HorseIcon {...props} />;
        case PetType.Fish: return <FishIcon {...props} />;
        default: return null;
    }
}

export const LockClosedIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
  );
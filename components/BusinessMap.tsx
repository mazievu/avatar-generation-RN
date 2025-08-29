

import React, { useState, useRef, useMemo } from 'react';
import type { GameState, BusinessDefinition, Business, Character, Manifest } from '../types';
import { Language, t } from '../localization';
import { BUSINESS_DEFINITIONS, BUSINESS_MAP_LOCATIONS } from '../constants';
import { BusinessMapSVG } from './BusinessMapSVG';
import { calculateBusinessMonthlyNetIncome } from '../utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { RobotAvatarIcon } from './icons';

// Modal for purchasing
const BusinessPurchaseModal: React.FC<{
    businessKey: string;
    businessDef: BusinessDefinition;
    familyFund: number;
    onBuy: (key: string) => void;
    onClose: () => void;
    lang: Language;
}> = ({ businessKey, businessDef, familyFund, onBuy, onClose, lang }) => {
    const canAfford = familyFund >= businessDef.cost;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="comic-panel-wrapper" style={{'--rotate': '1deg'} as React.CSSProperties} onClick={e => e.stopPropagation()}>
                <div className="comic-panel p-6 max-w-md w-full">
                    <h3 className="text-2xl font-black text-blue-400 mb-2">{t(businessDef.nameKey, lang)}</h3>
                    <p className="text-slate-500 mb-1">{t('base_revenue_label', lang)}: ${businessDef.baseRevenue.toLocaleString()}/mo</p>
                    <p className="text-slate-500 mb-4">{t('cost_label', lang)}: ${businessDef.cost.toLocaleString()}</p>
                    
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="chunky-button chunky-button-slate">
                            {t('cancel_button', lang)}
                        </button>
                        <button onClick={() => onBuy(businessKey)} disabled={!canAfford} className="chunky-button chunky-button-green">
                            {t('buy_button', lang)} (${businessDef.cost.toLocaleString()})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal for selecting which business to manage
const BusinessManageSelectionModal: React.FC<{
    businessType: string;
    ownedBusinesses: Business[];
    onManage: (business: Business) => void;
    onClose: () => void;
    lang: Language;
}> = ({ businessType, ownedBusinesses, onManage, onClose, lang }) => {
    const businessDef = BUSINESS_DEFINITIONS[businessType]; // Assuming businessType is like 'culinary_t1' or 'medicine_t1'
    if (!businessDef) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="comic-panel-wrapper" style={{ '--rotate': '-1deg' } as React.CSSProperties} onClick={e => e.stopPropagation()}>
                <div className="comic-panel p-6 max-w-md w-full">
                    <h3 className="text-2xl font-black text-blue-400 mb-4">
                        {t('manage_business_title', lang)}: {t(businessDef.nameKey, lang)}
                    </h3>
                    <p className="text-slate-500 mb-4">{t('select_business_to_manage', lang)}:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {ownedBusinesses.map(business => (
                            <div key={business.id} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg shadow-sm">
                                <span className="font-semibold text-slate-800">
                                    {t(BUSINESS_DEFINITIONS[business.type]?.nameKey || 'unknown_business', lang)} (ID: {business.id.substring(0, 4)}...)
                                </span>
                                <button
                                    onClick={() => onManage(business)}
                                    className="chunky-button chunky-button-blue text-sm"
                                >
                                    {t('manage_button', lang)}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="chunky-button chunky-button-slate">
                            {t('cancel_button', lang)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BusinessMap: React.FC<{
    gameState: GameState;
    onBuyBusiness: (businessType: string) => void;
    onManageBusiness: (business: Business) => void;
    lang: Language;
    images: Record<string, HTMLImageElement>;
    manifest: Manifest;
    mainView: 'tree' | 'business';
    onBackToTree: () => void;
}> = ({ gameState, onBuyBusiness, onManageBusiness, lang, images, manifest, mainView, onBackToTree }) => {
    const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
    const [showManageModalForType, setShowManageModalForType] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeft = useRef(0);
    const scrollTop = useRef(0);

    const ownedBusinessesByType = useMemo(() => {
        const map = new Map<string, Business[]>();
        Object.values(gameState.familyBusinesses).forEach(b => {
            if (!map.has(b.type)) {
                map.set(b.type, []);
            }
            map.get(b.type)?.push(b);
        });
        return map;
    }, [gameState.familyBusinesses]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!mapContainerRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - mapContainerRef.current.offsetLeft;
        startY.current = e.pageY - mapContainerRef.current.offsetTop;
        scrollLeft.current = mapContainerRef.current.scrollLeft;
        scrollTop.current = mapContainerRef.current.scrollTop;
        mapContainerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseLeaveOrUp = () => {
        if (!mapContainerRef.current) return;
        isDragging.current = false;
        mapContainerRef.current.style.cursor = 'grab';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !mapContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - mapContainerRef.current.offsetLeft;
        const y = e.pageY - mapContainerRef.current.offsetTop;
        const walkX = (x - startX.current) * 2;
        const walkY = (y - startY.current) * 2;
        mapContainerRef.current.scrollLeft = scrollLeft.current - walkX;
        mapContainerRef.current.scrollTop = scrollTop.current - walkY;
    };
    
    const handleBuy = (key: string) => {
        onBuyBusiness(key);
        setSelectedLocationKey(null);
    }
    
    const businessDefForModal = selectedLocationKey ? BUSINESS_DEFINITIONS[selectedLocationKey] : null;

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center mb-2 p-2 flex-shrink-0">
                <h3 className="text-2xl font-black text-indigo-500">{t('purchase_business_title', lang)}</h3>
                <button onClick={onBackToTree} className="chunky-button chunky-button-slate">{t('back_button', lang)}</button>
            </div>
            <div className="flex-grow relative">
                <div 
                    ref={mapContainerRef}
                    className={`absolute inset-0 bg-slate-200 rounded-xl overflow-auto cursor-grab border-4 border-slate-300 shadow-inner ${mainView === 'business' ? 'w-full h-full' : 'max-w-[800px] max-h-[600px]'}`}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                >
                    <div 
                        className="relative" 
                        style={{ 
                            width: '3000px', 
                            height: '3000px',
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left'
                        }}
                    >
                        <BusinessMapSVG />

                        {Object.entries(BUSINESS_MAP_LOCATIONS).map(([businessDefKey, loc]) => {
                            const businessDef = BUSINESS_DEFINITIONS[businessDefKey];
                            if (!businessDef) return null;

                            const ownedOfType = ownedBusinessesByType.get(businessDefKey);
                            const isOwned = ownedOfType && ownedOfType.length > 0;
                            const businessToManage = isOwned ? ownedOfType[0] : null;
                            
                            const bubbleWidth = 180;
                            const bubbleHeight = businessToManage ? 120 : 90;

                            const topPosition = loc.y - bubbleHeight - 15 - 20 - 10;
                            const leftPosition = loc.x + (loc.width / 2) - (bubbleWidth / 2);

                            return (
                                <button
                                    key={businessDefKey}
                                    className={`business-hotspot ${businessToManage ? 'business-hotspot--owned' : 'business-hotspot--available'}`}
                                    style={{
                                        left: `${leftPosition}px`,
                                        top: `${topPosition}px`,
                                        width: `${bubbleWidth}px`,
                                        height: `${bubbleHeight}px`,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isOwned) {
                                            if (ownedOfType && ownedOfType.length === 1) {
                                                onManageBusiness(ownedOfType[0]);
                                            } else {
                                                setShowManageModalForType(businessDefKey);
                                            }
                                        } else {
                                            setSelectedLocationKey(businessDefKey);
                                        }
                                    }}
                                    aria-label={t(businessDef.nameKey, lang)}
                                >
                                    <span className="font-bold text-sm drop-shadow-sm">{t(businessDef.nameKey, lang)}</span>
                                     {businessToManage ? 
                                        (
                                            <div className="mt-1 w-full">
                                                <p className={`font-mono font-bold text-sm ${calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers) >= 0 ? '+' : ''}${Math.round(calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers)).toLocaleString()}/mo
                                                </p>
                                                <div className="flex justify-center items-center gap-1 mt-2 -mb-1">
                                                     {businessToManage.slots.map((slot, i) => {
                                                         if (!slot.assignedCharacterId) return null;
                                                         
                                                         if (slot.assignedCharacterId === 'robot') {
                                                            return (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-300 shadow-sm">
                                                                    <RobotAvatarIcon className="w-full h-full" />
                                                                </div>
                                                            );
                                                         }
                                                         
                                                         const char = gameState.familyMembers[slot.assignedCharacterId];
                                                         if (!char) return null;
                                                         
                                                         return (
                                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-300 shadow-sm">
                                                                <AgeAwareAvatarPreview manifest={manifest} character={char} images={images} size={{width: 32, height: 32}} />
                                                            </div>
                                                         );
                                                     })}
                                                </div>
                                                <span className="block text-xs font-semibold text-blue-600 mt-2">{t('manage_button', lang)}</span>
                                            </div>
                                        )
                                        : <span className="block text-sm text-amber-500 font-bold mt-1">${businessDef.cost.toLocaleString()}</span>
                                    }
                                </button>
                            );
                        })}
                    </div>
                </div>
                 <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md flex items-center gap-2 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-32 cursor-pointer"
                        aria-label="Zoom slider"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
            </div>

            {selectedLocationKey && businessDefForModal && (
                <BusinessPurchaseModal 
                    businessKey={selectedLocationKey}
                    businessDef={businessDefForModal}
                    familyFund={gameState.familyFund}
                    onBuy={handleBuy}
                    onClose={() => setSelectedLocationKey(null)}
                    lang={lang}
                />
            )}

            {showManageModalForType && ownedBusinessesByType.has(showManageModalForType) && (
                <BusinessManageSelectionModal
                    businessType={showManageModalForType}
                    ownedBusinesses={ownedBusinessesByType.get(showManageModalForType) || []}
                    onManage={(business) => {
                        onManageBusiness(business);
                        setShowManageModalForType(null); // Close modal after managing
                    }}
                    onClose={() => setShowManageModalForType(null)}
                    lang={lang}
                />
            )}
        </div>
    );
};
import * as React from 'react';
import type { PurchasedAsset, AssetDefinition, Stats } from '../types';
import { Language, t } from '../localization';
import { ASSET_DEFINITIONS } from '../constants';
import { IqIcon, HappinessIcon, eqIcon, HealthIcon, SkillIcon } from './icons'; // Assuming these icons are available

interface AssetSlotProps {
    asset: AssetDefinition;
    isOwned: boolean;
    canAfford: boolean;
    onPurchase: (assetId: string) => void;
    lang: Language;
    onViewDetails: (asset: AssetDefinition) => void; // New prop
}

const statIcons: Record<keyof Stats, React.ElementType> = {
    iq: IqIcon,
    happiness: HappinessIcon,
    eq: eqIcon,
    health: HealthIcon,
    skill: SkillIcon,
};

const AssetSlot: React.FC<AssetSlotProps> = ({ asset, isOwned, canAfford, onPurchase, lang, onViewDetails }) => {
    return (
        <div
            onClick={() => onViewDetails(asset)} // Make the entire slot clickable
            className={`relative p-2 rounded-lg flex flex-col items-center justify-between text-center text-sm transition-all duration-200 ease-in-out cursor-pointer aspect-square
            ${isOwned ? 'bg-green-100 border-green-300' : 'bg-slate-50 border-slate-200'}
            ${!isOwned && canAfford ? 'hover:bg-blue-100 hover:border-blue-300' : ''}
            border-2 shadow-sm overflow-hidden`}>
            
            {asset.imageSrc && (
                <div className="flex-shrink-0 w-full h-2/3 flex items-center justify-center p-1">
                    <img src={asset.imageSrc} alt={t(asset.nameKey, lang)} className="max-w-full max-h-full object-contain" />
                </div>
            )}

            <div className="flex-grow flex flex-col justify-end w-full">
                <p className="font-bold text-slate-700 text-xs truncate w-full px-1">{t(asset.nameKey, lang)}</p>
                <p className="text-xs font-mono text-slate-500">Tier: {asset.tier}</p>
            </div>
            {isOwned && (
                <span className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {t('asset_owned_label', lang)}
                </span>
            )}
        </div>
    );
};


const FamilyAssetsPanelInternal: React.FC<{
    purchasedAssets: PurchasedAsset[];
    familyFund: number;
    onPurchaseAsset: (assetId: string) => void;
    lang: Language;
}> = ({ purchasedAssets, familyFund, onPurchaseAsset, lang }) => {
    const ownedAssetIds = new Set(purchasedAssets.map(a => a.id));
    const [selectedAsset, setSelectedAsset] = React.useState<AssetDefinition | null>(null); // New state for selected asset
    
    const assetsByType = Object.values(ASSET_DEFINITIONS).reduce((acc, asset) => {
        if (!acc[asset.type]) {
            acc[asset.type] = [];
        }
        acc[asset.type].push(asset);
        return acc;
    }, {} as Record<string, AssetDefinition[]>);

    const totalAssetValue = purchasedAssets.reduce((sum, asset) => {
        const def = ASSET_DEFINITIONS[asset.id];
        return sum + (def ? def.cost : 0);
    }, 0);

    return (
        <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-2xl font-black mb-2 text-blue-400">{t('family_assets_title', lang)}</h3>
            <p className="mb-4 text-slate-600">
                {t('total_value_label', lang)}: <span className="font-bold text-green-600">${totalAssetValue.toLocaleString()}</span>
            </p>
            
            <h4 className="text-md font-extrabold mb-2 text-blue-400">{t('assets_purchase', lang)}</h4>
            <div className="space-y-4">
                {Object.entries(assetsByType).map(([type, assets]) => (
                    <div key={type}>
                        <h5 className="font-bold text-slate-600 mb-1">{t(`asset_type_${type}` as any, lang)}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {assets.sort((a,b) => a.tier - b.tier).map(asset => {
                                const isOwned = ownedAssetIds.has(asset.id);
                                const canAfford = familyFund >= asset.cost;
                                return (
                                    <AssetSlot
                                        key={asset.id}
                                        asset={asset}
                                        isOwned={isOwned}
                                        canAfford={canAfford}
                                        onPurchase={onPurchaseAsset}
                                        lang={lang}
                                        onViewDetails={setSelectedAsset} // Pass setSelectedAsset
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {selectedAsset && (
                <AssetDetailModal
                    asset={selectedAsset}
                    isOwned={ownedAssetIds.has(selectedAsset.id)}
                    canAfford={familyFund >= selectedAsset.cost}
                    onPurchase={onPurchaseAsset}
                    onClose={() => setSelectedAsset(null)}
                    lang={lang}
                />
            )}
        </div>
    );
};
export const FamilyAssetsPanel = React.memo(FamilyAssetsPanelInternal);


// New AssetDetailModal component
interface AssetDetailModalProps {
    asset: AssetDefinition;
    isOwned: boolean;
    canAfford: boolean;
    onPurchase: (assetId: string) => void;
    onClose: () => void;
    lang: Language;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, isOwned, canAfford, onPurchase, onClose, lang }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="comic-panel-wrapper" style={{ '--rotate': '1deg' } as React.CSSProperties}>
                <div className="comic-panel p-6 max-w-md w-full relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-4xl font-bold">&times;</button>
                    
                    <h2 className="text-3xl font-black text-pink-400 mb-4">{t(asset.nameKey, lang)}</h2>
                    
                    {asset.imageSrc && (
                        <div className="w-full h-48 bg-white rounded-md overflow-hidden border border-slate-200 mb-4 flex items-center justify-center">
                            <img src={asset.imageSrc} alt={t(asset.nameKey, lang)} className="w-full h-full object-contain" />
                        </div>
                    )}

                    <p className="text-slate-600 mb-3">{t(asset.descriptionKey, lang)}</p>
                    
                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-700">
                            <span className="font-bold">{t('asset_cost_label', lang)}:</span> ${asset.cost.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-700">
                            <span className="font-bold">{t('asset_tier', lang)}:</span> {asset.tier}
                        </p>
                        {Object.keys(asset.effects).length > 0 && (
                            <div className="flex flex-wrap gap-x-2 items-center text-sm text-slate-700">
                                <span className="font-bold">{t('asset_effects', lang)}:</span>
                                {Object.entries(asset.effects).map(([stat, val]) => {
                                    const Icon = statIcons[stat as keyof Stats];
                                    return (
                                        <span key={stat} className="inline-flex items-center mr-2">
                                            {Icon && <Icon className="w-4 h-4 mr-1 text-purple-500" />}
                                            {t(`stat_${stat}` as any, lang)} {val > 0 ? `+${(val * 100).toFixed(0)}%` : `${(val * 100).toFixed(0)}%`}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        {isOwned ? (
                            <span className="chunky-button chunky-button-slate text-lg cursor-default">
                                {t('asset_owned_label', lang)}
                            </span>
                        ) : (
                            <button
                                onClick={() => { onPurchase(asset.id); onClose(); }}
                                disabled={!canAfford}
                                className="chunky-button chunky-button-green text-lg">
                                {t('asset_purchase_button', lang)} (${asset.cost.toLocaleString()})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
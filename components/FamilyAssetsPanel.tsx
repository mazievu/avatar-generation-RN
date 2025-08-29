import * as React from 'react';
import type { PurchasedAsset, AssetDefinition } from '../types';
import { Language, t } from '../localization';
import { ASSET_DEFINITIONS } from '../constants';

const FamilyAssetsPanelInternal: React.FC<{
    purchasedAssets: PurchasedAsset[];
    familyFund: number;
    onPurchaseAsset: (assetId: string) => void;
    lang: Language;
}> = ({ purchasedAssets, familyFund, onPurchaseAsset, lang }) => {
    const ownedAssetIds = new Set(purchasedAssets.map(a => a.id));
    
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
            <p className="mb-4 text-slate-600">{t('total_value_label', lang)}: <span className="font-bold text-green-600">${totalAssetValue.toLocaleString()}</span></p>
            
            <h4 className="text-md font-extrabold mb-2 text-blue-400">{t('assets_purchase', lang)}</h4>
            <div className="space-y-4">
                {Object.entries(assetsByType).map(([type, assets]) => (
                    <div key={type}>
                        <h5 className="font-bold text-slate-600 mb-1">{t(`asset_type_${type}` as any, lang)}</h5>
                        <div className="space-y-2">
                            {assets.sort((a,b) => a.tier - b.tier).map(asset => {
                                const isOwned = ownedAssetIds.has(asset.id);
                                const canAfford = familyFund >= asset.cost;
                                return (
                                    <div key={asset.id} className={`p-2 rounded-lg flex justify-between items-center text-sm ${isOwned ? 'bg-green-100' : 'bg-slate-50'}`}>
                                        <div>
                                            <p className="font-bold">{t(asset.nameKey, lang)} <span className="text-xs font-mono text-slate-400">({t('asset_tier', lang)} {asset.tier})</span></p>
                                            <p className="text-xs text-slate-500">{t(asset.descriptionKey, lang)}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{t('asset_effects', lang)}: {Object.entries(asset.effects).map(([stat, val]) => `${t(`stat_${stat}` as any, lang)} +${(val*100).toFixed(0)}%`).join(', ')}</p>
                                        </div>
                                        {isOwned ? (
                                            <span className="chunky-button chunky-button-slate text-xs !py-1 !px-2 cursor-default">{t('asset_owned_label', lang)}</span>
                                        ) : (
                                            <button onClick={() => onPurchaseAsset(asset.id)} disabled={!canAfford} className="chunky-button chunky-button-green text-xs !py-1 !px-2">
                                                {t('asset_purchase_button', lang)} (${asset.cost.toLocaleString()})
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export const FamilyAssetsPanel = React.memo(FamilyAssetsPanelInternal);

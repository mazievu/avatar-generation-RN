import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';


import type { PurchasedAsset, AssetDefinition, Stats, Language } from '../core/types';
import { t } from '../core/localization';
import { ASSET_DEFINITIONS } from '../core/constants';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons'; // Assuming these icons are available
import { ComicPanelModal } from './ComicPanelModal';
import { imageAssets } from './ImageAssets';

interface AssetSlotProps {
    asset: AssetDefinition;
    isOwned: boolean;
    canAfford: boolean;
    lang: Language;
    onViewDetails: (asset: AssetDefinition) => void; // New prop
}

const statIcons: Record<keyof Stats, React.ElementType> = {
    iq: IqIcon,
    happiness: HappinessIcon,
    eq: EqIcon,
    health: HealthIcon,
    skill: SkillIcon,
};

const AssetSlot: React.FC<AssetSlotProps> = ({ asset, isOwned, canAfford, lang, onViewDetails }) => {
    return (
        <TouchableOpacity
            onPress={() => onViewDetails(asset)}
            style={[
                assetSlotStyles.container,
                isOwned ? assetSlotStyles.owned : assetSlotStyles.available,
                !isOwned && canAfford && assetSlotStyles.canAfford,
            ]}
            activeOpacity={0.7}
        >
            {asset.imageSrc && (
                <View style={assetSlotStyles.imageContainer}>
                    <Image source={imageAssets[asset.imageSrc]} style={assetSlotStyles.image} accessibilityLabel={t(asset.nameKey, lang)} />
                </View>
            )}

            <View style={assetSlotStyles.detailsContainer}>
                <Text style={assetSlotStyles.name} numberOfLines={1} ellipsizeMode="tail">{t(asset.nameKey, lang)}</Text>
                <Text style={assetSlotStyles.tier}>Tier: {asset.tier}</Text>
            </View>
            {isOwned && (
                <View style={assetSlotStyles.ownedLabelContainer}>
                    <Text style={assetSlotStyles.ownedLabelText}>
                        {t('asset_owned_label', lang)}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const assetSlotStyles = StyleSheet.create({
    available: {
        backgroundColor: '#f8fafc', // bg-slate-50
        borderColor: '#e2e8f0', // border-slate-200
    },
    canAfford: {
        // hover:bg-blue-100 hover:border-blue-300 - not directly applicable
    },
    container: {
        alignItems: 'center',
        aspectRatio: 1,
        borderWidth: 2,
        borderRadius: 8,
        elevation: 1, // shadow-sm
        flexBasis: '30%', // For a ~3 column layout with gaps
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: 8,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        textAlign: 'center',
    },
    detailsContainer: {
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    image: {
        maxHeight: '100%',
        maxWidth: '100%',
        resizeMode: 'contain', // object-contain
    },
    imageContainer: {
        alignItems: 'center',
        height: '100%', // h-4/5, increased from 66%
        justifyContent: 'center',
        padding: 4, // p-1
        flexShrink: 0,
        width: '100%',
    },
    name: {
        color: '#333', // slate-700
        fontSize: 12, // text-xs
        fontWeight: 'bold',
        paddingHorizontal: 4, // px-1
        width: '100%',
    },
    owned: {
        backgroundColor: '#dcfce7', // bg-green-100
        borderColor: '#86efad', // border-green-300
    },
    ownedLabelContainer: {
        backgroundColor: '#22c55e', // bg-green-500
        borderRadius: 9999, // rounded-full
        paddingHorizontal: 8, // px-2
        paddingVertical: 2, // py-0.5
        position: 'absolute',
        right: 4, // right-1
        top: 4, // top-1
    },
    ownedLabelText: {
        color: 'white',
        fontSize: 12, // text-xs
        fontWeight: 'bold',
    },
    tier: {
        color: '#64748b', // slate-500
        fontSize: 12, // text-xs
        // fontFamily: 'monospace', // font-mono
    },
});

const assetDetailModalStyles = StyleSheet.create({
    actionButtonContainer: {
        alignItems: 'center', // text-center
    },
    chunkyButton: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: 8,
        justifyContent: 'center',
        paddingVertical: 12, // py-3
        width: '100%',
    },
    chunkyButtonDisabled: {
        opacity: 0.6,
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    chunkyButtonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    chunkyButtonText: {
        color: 'white',
        fontSize: 18, // text-lg
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 16, // right-4
        top: 16, // top-4
    },
    closeButtonText: {
        color: '#94a3b8', // slate-400
        fontSize: 32, // text-4xl
        fontWeight: 'bold',
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 12, // mb-3
    },
    detailLabel: {
        fontWeight: 'bold',
    },
    detailText: {
        color: '#333', // slate-700
        fontSize: 14, // text-sm
        marginBottom: 8, // for space-y-2
    },
    detailsSection: {
        // space-y-2
        marginBottom: 16, // mb-4
    },
    effectIcon: {
        height: 16, // h-4
        marginRight: 4, // mr-1
        width: 16, // w-4
    },
    effectItem: {
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: 8, // mr-2
    },
    effectText: {
        fontSize: 14,
    },
    effectsContainer: {
        alignItems: 'center',
        color: '#333', // slate-700
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-x-2
        fontSize: 14, // text-sm
    },
    image: {
        height: '100%',
        resizeMode: 'contain',
        width: '100%', // object-contain
    },
    imageContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#e2e8f0', // border-slate-200
        borderRadius: 8, // rounded-md
        borderWidth: 1,
        height: 192, // h-48
        justifyContent: 'center',
        marginBottom: 16, // mb-4
        overflow: 'hidden',
        width: '100%',
    },
    title: {
        color: '#ec4899', // pink-400
        fontSize: 28, // text-3xl
        fontWeight: 'bold', // font-black
        marginBottom: 16, // mb-4
    },
});

const familyAssetsPanelStyles = StyleSheet.create({
    assetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    assetTypeSection: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        marginBottom: 24,
        padding: 16,
    },
    assetTypeTitle: {
        color: '#334155',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    assetTypesContainer: {
        // flex-wrap container for asset types
    },
    container: {
        flex: 1,
        padding: 16,
    },
    purchaseSectionTitle: {
        color: '#1e293b',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 24,
    },
    title: {
        color: '#1e293b',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    totalValueAmount: {
        color: '#16a34a',
        fontWeight: 'bold',
    },
    totalValueText: {
        color: '#475569',
        fontSize: 16,
        marginBottom: 16,
    },
});

const FamilyAssetsPanelInternal: React.FC<{
    purchasedAssets: Record<string, PurchasedAsset>;
    familyFund: number;
    onPurchaseAsset: (assetId: string) => void;
    lang: Language;
}> = ({ purchasedAssets, familyFund, onPurchaseAsset, lang }) => {
    const ownedAssetIds = new Set(Object.keys(purchasedAssets));
    const [selectedAsset, setSelectedAsset] = React.useState<AssetDefinition | null>(null); // New state for selected asset
    
    const assetsByType = Object.values(ASSET_DEFINITIONS).reduce((acc, asset) => {
        if (!acc[asset.type]) {
            acc[asset.type] = [];
        }
        acc[asset.type].push(asset);
        return acc;
    }, {} as Record<string, AssetDefinition[]>);

    const totalAssetValue = Object.values(purchasedAssets).reduce((sum, asset) => {
        const def = ASSET_DEFINITIONS[asset.id];
        return sum + (def ? def.cost : 0);
    }, 0);

    return (
        <ScrollView style={familyAssetsPanelStyles.container}>
            <Text style={familyAssetsPanelStyles.title}>{t('family_assets_title', lang)}</Text>
            <Text style={familyAssetsPanelStyles.totalValueText}>
                {t('total_value_label', lang)}: <Text style={familyAssetsPanelStyles.totalValueAmount}>${totalAssetValue.toLocaleString()}</Text>
            </Text>
            
            <Text style={familyAssetsPanelStyles.purchaseSectionTitle}>{t('assets_purchase', lang)}</Text>
            <View style={familyAssetsPanelStyles.assetTypesContainer}>
                {Object.entries(assetsByType).map(([type, assets]) => (
                    <View key={type} style={familyAssetsPanelStyles.assetTypeSection}>
                        <Text style={familyAssetsPanelStyles.assetTypeTitle}>{t(`asset_type_${type}` as keyof typeof ASSET_DEFINITIONS, lang)}</Text>
                        <View style={familyAssetsPanelStyles.assetGrid}>
                            {assets.sort((a,b) => a.tier - b.tier).map(asset => {
                                const isOwned = ownedAssetIds.has(asset.id);
                                const canAfford = familyFund >= asset.cost;
                                return (
                                    <AssetSlot
                                        key={asset.id}
                                        asset={asset}
                                        isOwned={isOwned}
                                        canAfford={canAfford}
                                        lang={lang}
                                        onViewDetails={setSelectedAsset} // Pass setSelectedAsset
                                    />
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>

            {selectedAsset && (
                <ComicPanelModal
                    visible={true}
                    onClose={() => setSelectedAsset(null)}
                    // rotate="-1deg" // Example rotation, can be adjusted
                >
                    {/* Content of the old AssetDetailModal goes here */}
                    <TouchableOpacity onPress={() => setSelectedAsset(null)} style={assetDetailModalStyles.closeButton}>
                        <Text style={assetDetailModalStyles.closeButtonText}>&times;</Text>
                    </TouchableOpacity>

                    <Text style={assetDetailModalStyles.title}>{t(selectedAsset.nameKey, lang)}</Text>

                    {selectedAsset.imageSrc && (
                        <View style={assetDetailModalStyles.imageContainer}>
                            <Image source={imageAssets[selectedAsset.imageSrc]} style={assetDetailModalStyles.image} accessibilityLabel={t(selectedAsset.nameKey, lang)} />
                        </View>
                    )}

                    <Text style={assetDetailModalStyles.description}>{t(selectedAsset.descriptionKey, lang)}</Text>

                    <View style={assetDetailModalStyles.detailsSection}>
                        <Text style={assetDetailModalStyles.detailText}>
                            <Text style={assetDetailModalStyles.detailLabel}>{t('asset_cost_label', lang)}:</Text> ${selectedAsset.cost.toLocaleString()}
                        </Text>
                        <Text style={assetDetailModalStyles.detailText}>
                            <Text style={assetDetailModalStyles.detailLabel}>{t('asset_tier', lang)}:</Text> {selectedAsset.tier}
                        </Text>
                        {Object.keys(selectedAsset.effects).length > 0 && (
                            <View style={assetDetailModalStyles.effectsContainer}>
                                <Text style={assetDetailModalStyles.detailLabel}>{t('asset_effects', lang)}:</Text>
                                {Object.entries(selectedAsset.effects).map(([stat, val]) => {
                                    const Icon = statIcons[stat as keyof Stats];
                                    const color = '#a78bfa'; // purple-500
                                    return (
                                        <View key={stat} style={assetDetailModalStyles.effectItem}>
                                            {Icon && <Icon color={color} style={assetDetailModalStyles.effectIcon} />}
                                            <Text style={[assetDetailModalStyles.effectText, { color }]}>
                                                {t(`stat_${stat}` as keyof Stats, lang)} {val > 0 ? `+${(val * 100).toFixed(0)}%` : `${(val * 100).toFixed(0)}%`}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={assetDetailModalStyles.actionButtonContainer}>
                        {ownedAssetIds.has(selectedAsset.id) ? (
                            <View style={[assetDetailModalStyles.chunkyButton, assetDetailModalStyles.chunkyButtonSlate]}>
                                <Text style={assetDetailModalStyles.chunkyButtonText}>
                                    {t('asset_owned_label', lang)}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => { onPurchaseAsset(selectedAsset.id); setSelectedAsset(null); }}
                                disabled={!(familyFund >= selectedAsset.cost)}
                                style={[assetDetailModalStyles.chunkyButton, assetDetailModalStyles.chunkyButtonGreen, !(familyFund >= selectedAsset.cost) && assetDetailModalStyles.chunkyButtonDisabled]}
                            >
                                <Text style={assetDetailModalStyles.chunkyButtonText}>
                                    {t('asset_purchase_button', lang)} (${selectedAsset.cost.toLocaleString()})
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ComicPanelModal>
            )}
        </ScrollView>
    );
};
export const FamilyAssetsPanel = React.memo(FamilyAssetsPanelInternal);
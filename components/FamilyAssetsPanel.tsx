import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import type { PurchasedAsset, AssetDefinition, Stats, Language } from '../core/types';
import { t } from '../core/localization';
import { ASSET_DEFINITIONS } from '../core/constants';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons'; // Assuming these icons are available
import { ModalBase } from './ui'; // Assuming ModalBase is now in ui.tsx
import { imageAssets } from './ImageAssets';

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
    eq: EqIcon,
    health: HealthIcon,
    skill: SkillIcon,
};

const AssetSlot: React.FC<AssetSlotProps> = ({ asset, isOwned, canAfford, onPurchase, lang, onViewDetails }) => {
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
    container: {
        position: 'relative',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        fontSize: 14,
        aspectRatio: 1,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // shadow-sm
        overflow: 'hidden',
        flexGrow: 1,
        flexBasis: '30%', // For a ~3 column layout with gaps
    },
    owned: {
        backgroundColor: '#dcfce7', // bg-green-100
        borderColor: '#86efad', // border-green-300
    },
    available: {
        backgroundColor: '#f8fafc', // bg-slate-50
        borderColor: '#e2e8f0', // border-slate-200
    },
    canAfford: {
        // hover:bg-blue-100 hover:border-blue-300 - not directly applicable
    },
    imageContainer: {
        flexShrink: 0,
        width: '100%',
        height: '66%', // h-2/3
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4, // p-1
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        resizeMode: 'contain', // object-contain
    },
    detailsContainer: {
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
    },
    name: {
        fontWeight: 'bold',
        color: '#333', // slate-700
        fontSize: 12, // text-xs
        width: '100%',
        paddingHorizontal: 4, // px-1
    },
    tier: {
        fontSize: 12, // text-xs
        // fontFamily: 'monospace', // font-mono
        color: '#64748b', // slate-500
    },
    ownedLabelContainer: {
        position: 'absolute',
        top: 4, // top-1
        right: 4, // right-1
        backgroundColor: '#22c55e', // bg-green-500
        borderRadius: 9999, // rounded-full
        paddingHorizontal: 8, // px-2
        paddingVertical: 2, // py-0.5
    },
    ownedLabelText: {
        color: 'white',
        fontSize: 12, // text-xs
        fontWeight: 'bold',
    },
});


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
        <View style={assetDetailModalStyles.overlay}>
            <View style={assetDetailModalStyles.comicPanelWrapper}>
                <View style={assetDetailModalStyles.comicPanel}>
                    <TouchableOpacity onPress={onClose} style={assetDetailModalStyles.closeButton}>
                        <Text style={assetDetailModalStyles.closeButtonText}>&times;</Text>
                    </TouchableOpacity>

                    <Text style={assetDetailModalStyles.title}>{t(asset.nameKey, lang)}</Text>

                    {asset.imageSrc && (
                        <View style={assetDetailModalStyles.imageContainer}>
                            <Image source={imageAssets[asset.imageSrc]} style={assetDetailModalStyles.image} accessibilityLabel={t(asset.nameKey, lang)} />
                        </View>
                    )}

                    <Text style={assetDetailModalStyles.description}>{t(asset.descriptionKey, lang)}</Text>

                    <View style={assetDetailModalStyles.detailsSection}>
                        <Text style={assetDetailModalStyles.detailText}>
                            <Text style={assetDetailModalStyles.detailLabel}>{t('asset_cost_label', lang)}:</Text> ${asset.cost.toLocaleString()}
                        </Text>
                        <Text style={assetDetailModalStyles.detailText}>
                            <Text style={assetDetailModalStyles.detailLabel}>{t('asset_tier', lang)}:</Text> {asset.tier}
                        </Text>
                        {Object.keys(asset.effects).length > 0 && (
                            <View style={assetDetailModalStyles.effectsContainer}>
                                <Text style={assetDetailModalStyles.detailLabel}>{t('asset_effects', lang)}:</Text>
                                {Object.entries(asset.effects).map(([stat, val]) => {
                                    const Icon = statIcons[stat as keyof Stats];
                                    const color = '#a78bfa'; // purple-500
                                    return (
                                        <View key={stat} style={assetDetailModalStyles.effectItem}>
                                            {Icon && <Icon color={color} style={assetDetailModalStyles.effectIcon} />}
                                            <Text style={[assetDetailModalStyles.effectText, { color }]}>
                                                {t(`stat_${stat}` as any, lang)} {val > 0 ? `+${(val * 100).toFixed(0)}%` : `${(val * 100).toFixed(0)}%`}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={assetDetailModalStyles.actionButtonContainer}>
                        {isOwned ? (
                            <View style={[assetDetailModalStyles.chunkyButton, assetDetailModalStyles.chunkyButtonSlate]}>
                                <Text style={assetDetailModalStyles.chunkyButtonText}>
                                    {t('asset_owned_label', lang)}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => { onPurchase(asset.id); onClose(); }}
                                disabled={!canAfford}
                                style={[assetDetailModalStyles.chunkyButton, assetDetailModalStyles.chunkyButtonGreen, !canAfford && assetDetailModalStyles.chunkyButtonDisabled]}
                            >
                                <Text style={assetDetailModalStyles.chunkyButtonText}>
                                    {t('asset_purchase_button', lang)} (${asset.cost.toLocaleString()})
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const assetDetailModalStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: 16,
    },
    comicPanelWrapper: {
        // transform: [{ rotate: '1deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24, // p-6
        maxWidth: 400, // max-w-md
        width: '100%',
        position: 'relative',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    closeButton: {
        position: 'absolute',
        top: 16, // top-4
        right: 16, // right-4
    },
    closeButtonText: {
        color: '#94a3b8', // slate-400
        fontSize: 32, // text-4xl
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28, // text-3xl
        fontWeight: 'bold', // font-black
        color: '#ec4899', // pink-400
        marginBottom: 16, // mb-4
    },
    imageContainer: {
        width: '100%',
        height: 192, // h-48
        backgroundColor: 'white',
        borderRadius: 8, // rounded-md
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0', // border-slate-200
        marginBottom: 16, // mb-4
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // object-contain
    },
    description: {
        color: '#475569', // slate-600
        marginBottom: 12, // mb-3
        fontSize: 16,
    },
    detailsSection: {
        // space-y-2
        marginBottom: 16, // mb-4
    },
    detailText: {
        fontSize: 14, // text-sm
        color: '#333', // slate-700
        marginBottom: 8, // for space-y-2
    },
    detailLabel: {
        fontWeight: 'bold',
    },
    effectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-x-2
        alignItems: 'center',
        fontSize: 14, // text-sm
        color: '#333', // slate-700
    },
    effectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8, // mr-2
    },
    effectIcon: {
        width: 16, // w-4
        height: 16, // h-4
        marginRight: 4, // mr-1
    },
    effectText: {
        fontSize: 14,
    },
    actionButtonContainer: {
        alignItems: 'center', // text-center
    },
    chunkyButton: {
        width: '100%',
        paddingVertical: 12, // py-3
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 4,
    },
    chunkyButtonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    chunkyButtonText: {
        color: 'white',
        fontSize: 18, // text-lg
        fontWeight: 'bold',
    },
    chunkyButtonDisabled: {
        opacity: 0.6,
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
                        <Text style={familyAssetsPanelStyles.assetTypeTitle}>{t(`asset_type_${type}` as any, lang)}</Text>
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
                                        onPurchase={onPurchaseAsset}
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
                <AssetDetailModal
                    asset={selectedAsset}
                    isOwned={ownedAssetIds.has(selectedAsset.id)}
                    canAfford={familyFund >= selectedAsset.cost}
                    onPurchase={onPurchaseAsset}
                    onClose={() => setSelectedAsset(null)}
                    lang={lang}
                />
            )}
        </ScrollView>
    );
};
export const FamilyAssetsPanel = React.memo(FamilyAssetsPanelInternal);

const familyAssetsPanelStyles = StyleSheet.create({
    container: {
        padding: 16, // p-4
        flex: 1, // h-full
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold', // font-black
        marginBottom: 8, // mb-2
        color: '#60a5fa', // blue-400
    },
    totalValueText: {
        marginBottom: 16, // mb-4
        color: '#475569', // slate-600
        fontSize: 16,
    },
    totalValueAmount: {
        fontWeight: 'bold',
        color: '#22c55e', // green-600
    },
    purchaseSectionTitle: {
        fontSize: 18, // text-md
        fontWeight: 'bold', // font-extrabold
        marginBottom: 8, // mb-2
        color: '#60a5fa', // blue-400
    },
    assetTypesContainer: {
        // space-y-4
    },
    assetTypeSection: {
        marginBottom: 16, // for space-y-4
    },
    assetTypeTitle: {
        fontWeight: 'bold',
        color: '#475569', // slate-600
        marginBottom: 4, // mb-1
    },
    assetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 12,
    },
});
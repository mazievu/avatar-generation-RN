import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageSourcePropType, Dimensions } from 'react-native';


import Slider from '@react-native-community/slider'; // Import Slider

import type { GameState, BusinessDefinition, Business, Character, Manifest, Language } from '../core/types';
import { t } from '../core/localization';
import { BUSINESS_DEFINITIONS, BUSINESS_MAP_LOCATIONS } from '../core/constants';
import { BusinessMapSVG } from './BusinessMapSVG';
import { calculateBusinessMonthlyNetIncome, getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { RobotAvatarIcon } from './icons';
import { ComicPanelModal } from './ComicPanelModal';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

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
        <ComicPanelModal visible={true} onClose={onClose} rotate="-1deg">
            <Text style={businessPurchaseModalStyles.title}>{t(businessDef.nameKey, lang)}</Text>
            <Text style={businessPurchaseModalStyles.description}>
                {t('cost_label', lang, { cost: businessDef.cost.toLocaleString() })}
            </Text>
            <Text style={businessPurchaseModalStyles.baseRevenueText}>{t('base_revenue_label', lang)}: ${businessDef.baseRevenue.toLocaleString()}/mo</Text>
            <View style={businessPurchaseModalStyles.buttonGroup}>
                <TouchableOpacity onPress={onClose} style={[businessPurchaseModalStyles.button, businessPurchaseModalStyles.buttonSlate]}>
                    <Text style={businessPurchaseModalStyles.buttonText}>
                        {t('cancel_button', lang)}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onBuy(businessKey)} disabled={!canAfford} style={[businessPurchaseModalStyles.button, businessPurchaseModalStyles.buttonGreen, !canAfford && businessPurchaseModalStyles.buttonDisabled]}>
                    <Text style={businessPurchaseModalStyles.buttonText}>
                        {t('buy_button', lang)} (${businessDef.cost.toLocaleString()})
                    </Text>
                </TouchableOpacity>
            </View>
        </ComicPanelModal>
    );
};

const businessPurchaseModalStyles = StyleSheet.create({
    baseRevenueText: {
        color: '#64748b', // slate-500
        marginBottom: 4,
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12, // gap-3
        marginTop: 16, // mt-4
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    description: {
        color: '#333',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
});

// Modal for selecting which business to manage
const BusinessManageSelectionModal: React.FC<{
    businessType: string;
    ownedBusinesses: Business[];
    onManage: (business: Business) => void;
    onClose: () => void;
    lang: Language;
}> = ({ businessType, ownedBusinesses, onManage, onClose, lang }) => {
    const businessDef = BUSINESS_DEFINITIONS[businessType];
    if (!businessDef) return null;

    return (
        <ComicPanelModal visible={true} onClose={onClose} rotate="1deg">
            <Text style={businessManageSelectionModalStyles.title}>{t('manage_business_title', lang)}</Text>
            <Text style={businessManageSelectionModalStyles.description}>
                {t('select_business_to_manage', lang, { businessName: t(businessDef.nameKey, lang) })}
            </Text>
            <ScrollView style={businessManageSelectionModalStyles.scrollView}>
                {ownedBusinesses.map(business => (
                    <View key={business.id} style={businessManageSelectionModalStyles.businessItem}>
                        <Text style={businessManageSelectionModalStyles.businessName}>
                            {t(BUSINESS_DEFINITIONS[business.type]?.nameKey || 'unknown_business', lang)} (ID: {business.id.substring(0, 4)}...)
                        </Text>
                        <TouchableOpacity
                            onPress={() => onManage(business)}
                            style={[businessManageSelectionModalStyles.button, businessManageSelectionModalStyles.buttonBlue]}
                        >
                            <Text style={businessManageSelectionModalStyles.buttonText}>
                                {t('manage_button', lang)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <View style={businessManageSelectionModalStyles.buttonGroup}>
                <TouchableOpacity onPress={onClose} style={[businessManageSelectionModalStyles.button, businessManageSelectionModalStyles.buttonSlate]}>
                    <Text style={businessManageSelectionModalStyles.buttonText}>
                        {t('cancel_button', lang)}
                    </Text>
                </TouchableOpacity>
            </View>
        </ComicPanelModal>
    );
};

const businessManageSelectionModalStyles = StyleSheet.create({
    businessItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f1f5f9', // slate-100
        padding: 12, // p-3
        borderRadius: 8, // rounded-lg
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 8, // space-y-2
    },
    businessName: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        flex: 1,
        marginRight: 8,
    },
    button: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonBlue: {
        backgroundColor: '#60a5fa', // blue-400
        borderBottomWidth: 4,
        borderColor: '#3b82f6', // blue-500
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12, // gap-3
        marginTop: 24, // mt-6
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    description: {
        color: '#333',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    scrollView: {
        maxHeight: 240, // max-h-60
        marginBottom: 16, // mb-4
        paddingRight: 8, // pr-2
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
});

export const BusinessMap: React.FC<{
    gameState: GameState;
    onBuyBusiness: (businessType: string) => void;
    onManageBusiness: (business: Business) => void;
    lang: Language;
    images: Record<string, ImageSourcePropType>;
    manifest: Manifest;
    mainView: 'tree' | 'business';
    onBackToTree: () => void;
}> = ({ gameState, onBuyBusiness, onManageBusiness, lang, images, manifest, mainView, onBackToTree }) => {
    const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
    const [showManageModalForType, setShowManageModalForType] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    // Removed mapContainerRef and dragging related refs/state

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

    const handleBuy = (key: string) => {
        onBuyBusiness(key);
        setSelectedLocationKey(null);
    }

    const businessDefForModal = selectedLocationKey ? BUSINESS_DEFINITIONS[selectedLocationKey] : null;

    return (
        <View style={businessMapStyles.container}>
            <View style={businessMapStyles.header}>
                <Text style={businessMapStyles.title}>{t('purchase_business_title', lang)}</Text>
                <TouchableOpacity onPress={onBackToTree} style={[businessMapStyles.button, businessMapStyles.buttonSlate]}>
                    <Text style={businessMapStyles.buttonText}>{t('back_button', lang)}</Text>
                </TouchableOpacity>
            </View>
            <View style={businessMapStyles.mapWrapper}>
                <View
                    style={[
                        businessMapStyles.mapContainer,
                        mainView === 'business' ? businessMapStyles.mapContainerFull : businessMapStyles.mapContainerPartial
                    ]}
                >
                    <View
                        style={[
                            businessMapStyles.mapContent,
                            { transform: [{ scale: zoom }] }
                        ]}
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
                                <TouchableOpacity
                                    key={businessDefKey}
                                    style={[
                                        businessMapStyles.businessHotspot,
                                        isOwned ? businessMapStyles.businessHotspotOwned : businessMapStyles.businessHotspotAvailable,
                                        {
                                            left: leftPosition,
                                            top: topPosition,
                                            width: bubbleWidth,
                                            height: bubbleHeight,
                                        }
                                    ]}
                                    onPress={() => {
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
                                    accessibilityLabel={t(businessDef.nameKey, lang)}
                                >
                                    <Text style={businessMapStyles.hotspotName}>{t(businessDef.nameKey, lang)}</Text>
                                     {businessToManage ?
                                        (
                                            <View style={businessMapStyles.ownedBusinessDetails}>
                                                <Text style={[businessMapStyles.ownedBusinessNetIncome, calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers) >= 0 ? businessMapStyles.netIncomePositive : businessMapStyles.netIncomeNegative]}>
                                                    {calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers) >= 0 ? '+' : ''}${Math.round(calculateBusinessMonthlyNetIncome(businessToManage, gameState.familyMembers)).toLocaleString()}/mo
                                                </Text>
                                                <View style={businessMapStyles.assignedWorkers}>
                                                     {businessToManage.slots.map((slot, i) => {
                                                         if (!slot.assignedCharacterId) return null;

                                                         if (slot.assignedCharacterId === 'robot') {
                                                            return (
                                                                <View key={i} style={businessMapStyles.workerAvatar}>
                                                                    <RobotAvatarIcon style={businessMapStyles.robotAvatarIcon} />
                                                                </View>
                                                            );
                                                         }

                                                         const char = gameState.familyMembers[slot.assignedCharacterId];
                                                         if (!char) return null;

                                                         return (
                                                            <View key={i} style={businessMapStyles.workerAvatar}>
                                                                <AgeAwareAvatarPreview manifest={manifest} character={char} images={images} size={{width: 32, height: 32}} />
                                                            </View>
                                                         );
                                                     })}
                                                </View>
                                                <Text style={businessMapStyles.manageButtonText}>{t('manage_button', lang)}</Text>
                                            </View>
                                        )
                                        : <Text style={businessMapStyles.costText}>${businessDef.cost.toLocaleString()}</Text>
                                    }
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                 <View style={businessMapStyles.zoomControl}>
                    <Text style={businessMapStyles.zoomIcon}>-</Text>
                    <Slider
                        style={businessMapStyles.slider}
                        minimumValue={0.5}
                        maximumValue={2}
                        step={0.1}
                        value={zoom}
                        onValueChange={setZoom}
                        minimumTrackTintColor="#60a5fa" // blue-400
                        maximumTrackTintColor="#cbd5e1" // slate-300
                        thumbTintColor="#2563eb" // blue-700
                    />
                    <Text style={businessMapStyles.zoomIcon}>+</Text>
                </View>
            </View>

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
        </View>
    );
};

const businessMapStyles = StyleSheet.create({
    assignedWorkers: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4, // gap-1
        marginTop: 8, // mt-2
        marginBottom: -4, // -mb-1
    },
    businessHotspot: {
        alignItems: 'center',
        borderRadius: 8,
        elevation: 3,
        justifyContent: 'center',
        padding: 8,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    businessHotspotAvailable: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-white/80
        borderColor: '#fbbf24', // border-amber-400
        borderWidth: 2,
    },
    businessHotspotOwned: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90
        borderColor: '#22c55e', // border-green-500
        borderWidth: 2,
    },
    button: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    costText: {
        // display: 'flex', // block
        fontSize: 14, // text-sm
        color: '#f59e0b', // text-amber-500
        fontWeight: 'bold',
        marginTop: 4, // mt-1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8, // mb-2
        padding: 8, // p-2
        flexShrink: 0, // flex-shrink-0
    },
    hotspotName: {
        fontWeight: 'bold',
        fontSize: 14, // text-sm
        textShadowColor: 'rgba(0,0,0,0.1)', // drop-shadow-sm
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    manageButtonText: {
        // display: 'flex', // block
        fontSize: 12, // text-xs
        fontWeight: 'bold',
        color: '#2563eb', // text-blue-600
        marginTop: 8, // mt-2
    },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#e2e8f0', // bg-slate-200
        borderRadius: 12, // rounded-xl
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#cbd5e1', // border-4 border-slate-300
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // shadow-inner
    },
    mapContainerFull: {
        height: '100%',
        width: '100%',
    },
    mapContainerPartial: {
        maxHeight: 600,
        maxWidth: 800,
    },
    mapContent: {
        position: 'relative',
        width: 3000, // Fixed size for the map content
        height: 3000, // Fixed size for the map content
        // transform handled by state
        // transformOrigin: 'top left' is default for scale in RN
    },
    mapWrapper: {
        flexGrow: 1, // flex-grow
        position: 'relative',
    },
    netIncomeNegative: {
        color: '#ef4444', // text-red-600
    },
    netIncomePositive: {
        color: '#22c55e', // text-green-600
    },
    ownedBusinessDetails: {
        marginTop: 4, // mt-1
        width: '100%',
        alignItems: 'center',
    },
    ownedBusinessNetIncome: {
        fontFamily: 'monospace', // font-mono
        fontWeight: 'bold',
        fontSize: 14, // text-sm
    },
    robotAvatarIcon: {
        height: '100%',
        width: '100%',
    },
    slider: {
        width: 128, // w-32
        height: 40, // Example height, adjust as needed
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold', // font-black
        color: '#4f46e5', // indigo-500
    },
    workerAvatar: {
        width: 32, // w-8
        height: 32, // h-8
        borderRadius: 16, // rounded-full
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
        backgroundColor: '#cbd5e1', // bg-slate-300
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1, // shadow-sm
    },
    zoomControl: {
        position: 'absolute',
        bottom: 16, // bottom-4
        right: 16, // right-4
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-white/80
        // backdrop-blur-sm is not directly supported
        padding: 8, // p-2
        borderRadius: 8, // rounded-lg
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // shadow-md
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // gap-2
        zIndex: 20,
    },
    zoomIcon: {
        fontSize: 24, // h-6 w-6
        color: '#475569', // text-slate-600
        fontWeight: 'bold',
    },
});
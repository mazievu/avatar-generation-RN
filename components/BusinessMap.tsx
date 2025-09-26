import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageSourcePropType, TouchableOpacity, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

import type { GameState, BusinessDefinition, Business, Manifest, Language } from '../core/types';
import { t } from '../core/localization';
import { BUSINESS_DEFINITIONS, BUSINESS_MAP_LOCATIONS } from '../core/constants';
import { BusinessMapSVG } from './BusinessMapSVG';
import { calculateBusinessMonthlyNetIncome } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { RobotAvatarIcon } from './icons';
import { ComicPanelModal } from './ComicPanelModal';

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
        fontSize: 14,
        marginBottom: 4,
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
        gap: 12, // gap-3
        justifyContent: 'flex-end',
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
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
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
        alignItems: 'center',
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: 8, // rounded-lg
        elevation: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8, // space-y-2
        padding: 12, // p-3
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    businessName: {
        color: '#1e293b', // slate-800
        flex: 1,
        fontWeight: 'bold',
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
        gap: 12, // gap-3
        justifyContent: 'flex-end',
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
        marginBottom: 16, // mb-4
        maxHeight: 240, // max-h-60
        paddingRight: 8, // pr-2
    },
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
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
    onBackToTree: () => void;
}> = ({ gameState, onBuyBusiness, onManageBusiness, lang, images, manifest, onBackToTree }) => {
    const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
    const [showManageModalForType, setShowManageModalForType] = useState<string | null>(null);

    const scale = useSharedValue(0.8);
    const savedScale = useSharedValue(0.8);
    const translateX = useSharedValue(-1200);
    const translateY = useSharedValue(-1100);
    const savedTranslateX = useSharedValue(-1200);
    const savedTranslateY = useSharedValue(-1100);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            const newScale = savedScale.value * e.scale;
            scale.value = Math.max(0.5, Math.min(newScale, 3)); // Clamp scale
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    const animatedMapStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ] as NonNullable<ViewStyle['transform']>,
    }));

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
                
            </View>
            <GestureDetector gesture={composedGesture}>
                <Animated.View
                    style={businessMapStyles.mapContainer}
                >
                    <Animated.View
                        style={[
                            businessMapStyles.mapContent,
                            animatedMapStyle
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
                    </Animated.View>
                </Animated.View>
            </GestureDetector>

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
                        setShowManageModalForType(null);
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
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center',
        marginBottom: -4,
        marginTop: 8,
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#fbbf24',
        borderWidth: 2,
    },
    businessHotspotOwned: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#22c55e',
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
        backgroundColor: '#64748b',
        borderBottomWidth: 4,
        borderColor: '#475569',
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
        color: '#f59e0b',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        flexShrink: 0,
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: 8,
    },
    hotspotName: {
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    manageButtonText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
    },
    mapContainer: {
        backgroundColor: '#e2e8f0',
        borderColor: '#cbd5e1',
        borderRadius: 12,
        borderWidth: 4,
        bottom: 0,
        elevation: 1,
        left: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        top: 0,
    },
    mapContent: {
        height: 3000,
        position: 'relative',
        width: 3000,
    },
    mapWrapper: {
        flexGrow: 1,
        position: 'relative',
    },
    netIncomeNegative: {
        color: '#ef4444',
    },
    netIncomePositive: {
        color: '#22c55e',
    },
    ownedBusinessDetails: {
        alignItems: 'center',
        marginTop: 4,
        width: '100%',
    },
    ownedBusinessNetIncome: {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
    },
    robotAvatarIcon: {
        height: '100%',
        width: '100%',
    },
    slider: {
        height: 40,
        width: 128,
    },
    title: {
        color: '#4f46e5',
        fontSize: 24,
        fontWeight: 'bold',
    },
    workerAvatar: {
        backgroundColor: '#cbd5e1',
        borderColor: 'white',
        borderRadius: 16,
        borderWidth: 2,
        elevation: 1,
        height: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: 32,
    },
    zoomControl: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        bottom: 16,
        elevation: 3,
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        position: 'absolute',
        right: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 20,
    },
    zoomIcon: {
        color: '#475569',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, ImageSourcePropType } from 'react-native';


import { Picker } from '@react-native-picker/picker';
import type { Business, GameState, Manifest, Language } from '../core/types';
import { BUSINESS_DEFINITIONS, ROBOT_HIRE_COST } from '../core/constants';
import * as localization from '../core/localization';
import { getCharacterDisplayName, calculateEmployeeSalary } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { UpgradeIcon, RobotAvatarIcon, CloseIcon } from './icons';
import { LifePhase, CharacterStatus } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';




interface BusinessManagementModalProps {
    lang: Language;
    business: Business;
    gameState: GameState;
    onAssignToBusiness: (businessId: string, slotIndex: number, characterId: string | null) => void;
    onUpgradeBusiness: (businessId: string) => void;
    onSellBusiness: (businessId: string) => void;
    onClose: () => void;
    images: Record<string, ImageSourcePropType>;
    manifest: Manifest;
}

export const BusinessManagementModal: React.FC<BusinessManagementModalProps> = ({
    business,
    gameState,
    onAssignToBusiness,
    onUpgradeBusiness,
    onSellBusiness,
    onClose,
    lang,
    images,
    manifest
}) => {
    const businessDef = BUSINESS_DEFINITIONS[business.type];
    if (!businessDef) return null;

    const upgradeCost = businessDef.cost * 0.75;
    const canUpgrade = business.level < 2 && gameState.familyFund >= upgradeCost;

    const availableMembers = Object.values(gameState.familyMembers).filter(char => {
        if (!char.isAlive || char.age < 18 || char.phase === LifePhase.Retired) return false;
        
        const isCurrentlyAssignedHere = business.slots.some(slot => slot.assignedCharacterId === char.id);
        if (isCurrentlyAssignedHere) return true;
        
        const isAvailableForWork = [CharacterStatus.Unemployed, CharacterStatus.Idle, CharacterStatus.Working].includes(char.status);
        
        const isWorkingInAnotherBusiness = Object.values(gameState.familyBusinesses).some(b => 
            b.id !== business.id && b.slots.some(s => s.assignedCharacterId === char.id)
        );

        return isAvailableForWork && !isWorkingInAnotherBusiness;
    });

    const handleAssignmentChange = (slotIndex: number, newCharacterId: string) => {
        if (newCharacterId === 'unassigned') {
            onAssignToBusiness(business.id, slotIndex, null);
        } else if (newCharacterId === 'robot') {
            onAssignToBusiness(business.id, slotIndex, 'robot');
        } else {
            onAssignToBusiness(business.id, slotIndex, newCharacterId);
        }
    };

        return (
        <ComicPanelModal visible={true} onClose={onClose} rotate="-2deg">
            <View style={businessManagementModalStyles.header}>
                <View>
                    <Text style={businessManagementModalStyles.title}>{localization.t(businessDef.nameKey, lang)}</Text>
                    <Text style={businessManagementModalStyles.levelText}>{localization.t('level_label', lang)}: {business.level}</Text>
                </View>
                <Pressable onPress={onClose} style={businessManagementModalStyles.closeButton}><CloseIcon width={32} height={32} color="#94a3b8" /></Pressable>
            </View>

            <ScrollView style={businessManagementModalStyles.slotsContainer}>
                <Text style={businessManagementModalStyles.sectionTitle}>{localization.t('family_members_label', lang)}</Text>
                {business.slots.map((slot, index) => {
                        const assignedCharacter = slot.assignedCharacterId && slot.assignedCharacterId !== 'robot' ? gameState.familyMembers[slot.assignedCharacterId] : null;
                        const isRobot = slot.assignedCharacterId === 'robot';
                        const salary = assignedCharacter ? calculateEmployeeSalary(assignedCharacter) : 0;

                        return (
                            <View key={index} style={businessManagementModalStyles.slotItem}>
                                <View style={businessManagementModalStyles.avatarPlaceholder}>
                                    {assignedCharacter ? (
                                        <AgeAwareAvatarPreview manifest={manifest} character={assignedCharacter} images={images} size={{width: 64, height: 64}} />
                                    ) : isRobot ? (
                                        <RobotAvatarIcon style={businessManagementModalStyles.robotIcon} />
                                    ) : (
                                        <View style={businessManagementModalStyles.emptyAvatar} />
                                    )}
                                </View>
                                <View style={businessManagementModalStyles.slotDetails}>
                                    <Text style={businessManagementModalStyles.slotRole}>{localization.t(slot.role, lang)}</Text>
                                    <Text style={businessManagementModalStyles.slotRequirement}>{localization.t('req_major_label', lang)}: {slot.requiredMajor === 'Unskilled' ? localization.t('unskilled_major', lang) : localization.t(slot.requiredMajor, lang)}</Text>
                                    {assignedCharacter && (
                                        <Text style={businessManagementModalStyles.slotSalary}>
                                            {localization.t('salary_label', lang)}: ${salary.toLocaleString()}/mo
                                        </Text>
                                    )}
                                </View>
                                <Picker
                                    selectedValue={slot.assignedCharacterId || 'unassigned'}
                                    onValueChange={(itemValue) => handleAssignmentChange(index, itemValue as string)}
                                    style={businessManagementModalStyles.picker}
                                    itemStyle={businessManagementModalStyles.pickerItem}
                                >
                                    <Picker.Item label={localization.t('unassigned_option', lang)} value="unassigned" />
                                    <Picker.Item label={`${localization.t('hire_robot_option', lang)} (-${ROBOT_HIRE_COST}/mo)`} value="robot" />
                                    {/* Optgroup is not directly supported in React Native Picker, so we'll just list items */}
                                    {availableMembers.map(char => {
                                        const isMajorMatch = slot.requiredMajor !== 'Unskilled' && char.major === slot.requiredMajor;
                                        return (
                                            <Picker.Item key={char.id} label={`${isMajorMatch ? '⭐ ' : ''}${getCharacterDisplayName(char, lang)} (Skill: ${Math.round(char.stats.skill)})`} value={char.id} />
                                        )
                                    })}
                                </Picker>
                            </View>
                        )
                })}
            </ScrollView>

            <View style={businessManagementModalStyles.footer}>
                    {business.level < 2 && businessDef.upgradeSlots.length > 0 && (
                        <TouchableOpacity
                            onPress={() => onUpgradeBusiness(business.id)}
                            disabled={!canUpgrade}
                            style={[businessManagementModalStyles.upgradeButton, !canUpgrade && businessManagementModalStyles.upgradeButtonDisabled]}
                        >
                            <UpgradeIcon style={businessManagementModalStyles.upgradeIcon} />
                            <Text style={businessManagementModalStyles.upgradeButtonText}>
                                {localization.t('upgrade_button', lang)} (-${upgradeCost.toLocaleString()})
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => {
                            onSellBusiness(business.id);
                            onClose();
                        }}
                        style={businessManagementModalStyles.sellButton}
                    >
                        <Text style={businessManagementModalStyles.sellButtonText}>
                            {`Sell (+${(businessDef.cost * 0.5).toLocaleString()})`}
                        </Text>
                    </TouchableOpacity>
            </View>
        </ComicPanelModal>)
};

const businessManagementModalStyles = StyleSheet.create({
    avatarPlaceholder: {
        height: 64,
        marginRight: 12,
        width: 64,
    },
    closeButton: {
        // No direct equivalent for absolute positioning within a flex item without more structure
    },
    emptyAvatar: {
        backgroundColor: '#e2e8f0', // slate-200
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    footer: {
        borderColor: '#e2e8f0',
        borderTopWidth: 1,
        marginTop: 16,
        paddingTop: 16, // slate-200
    },
    header: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        height: 30,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    levelText: {
        color: '#64748b',
        fontSize: 14, // slate-500
    },
    picker: {
        width: 200,
        // RN Picker styling is limited. This is a basic width.
    },
    pickerItem: {
        // itemStyle is iOS only.
    },
    robotIcon: {
        height: '100%',
        width: '100%',
    },
    sectionTitle: {
        color: '#334155', // slate-700
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sellButton: {
        alignItems: 'center',
        backgroundColor: '#ef4444', // red-500
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 12,
        marginTop: 8,
    },
    sellButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    slotDetails: {
        flex: 1,
    },
    slotItem: {
        alignItems: 'center',
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: 8,
        flexDirection: 'row',
        height: 100,
        marginBottom: 8,
        padding: 12,
    },
    slotRequirement: {
        color: '#64748b',
        fontSize: 12, // slate-500
    },
    slotRole: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    slotSalary: {
        color: '#16a34a',
        fontSize: 12, // green-600
    },
    slotsContainer: {
        // flex: 1, // Make the scroll view take up available space
    },
    title: {
        color: '#1e293b',
        fontSize: 24,
        fontWeight: 'bold', // slate-800
    },
    upgradeButton: {
        alignItems: 'center',
        backgroundColor: '#60a5fa', // blue-400
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 12,
    },
    upgradeButtonDisabled: {
        opacity: 0.5,
    },
    upgradeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    upgradeIcon: {
        color: 'white',
        height: 20,
        marginRight: 8,
        width: 20,
    },
});

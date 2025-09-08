import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageSourcePropType } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Picker } from '@react-native-picker/picker';
import type { Business, GameState, Manifest, Language, Character } from '../core/types';
import { BUSINESS_DEFINITIONS, ROBOT_HIRE_COST } from '../core/constants';
import { t } from '../core/localization';
import { getCharacterDisplayName, calculateEmployeeSalary } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { UpgradeIcon, RobotAvatarIcon } from './icons';
import { LifePhase, CharacterStatus } from '../core/types';

interface BusinessManagementModalProps {
    lang: Language;
    business: Business;
    gameState: GameState;
    onAssignToBusiness: (businessId: string, slotIndex: number, characterId: string | null) => void;
    onUpgradeBusiness: (businessId: string) => void;
    onClose: () => void;
    images: Record<string, ImageSourcePropType>;
    manifest: Manifest;
}

export const BusinessManagementModal: React.FC<BusinessManagementModalProps> = ({
    business,
    gameState,
    onAssignToBusiness,
    onUpgradeBusiness,
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
        <View style={businessManagementModalStyles.overlay}>
            <BlurView
                style={businessManagementModalStyles.absolute}
                blurType="dark"
                blurAmount={10}
            />
            <View style={businessManagementModalStyles.comicPanelWrapper}>
                <View style={businessManagementModalStyles.comicPanel}>
                    <View style={businessManagementModalStyles.header}>
                        <View>
                            <Text style={businessManagementModalStyles.title}>{t(businessDef.nameKey, lang)}</Text>
                            <Text style={businessManagementModalStyles.levelText}>{t('level_label', lang)}: {business.level}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={businessManagementModalStyles.closeButton}><Text style={businessManagementModalStyles.closeButtonText}>&times;</Text></TouchableOpacity>
                    </View>

                    <ScrollView style={businessManagementModalStyles.slotsContainer}>
                        <Text style={businessManagementModalStyles.sectionTitle}>{t('family_members_label', lang)}</Text>
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
                                        <Text style={businessManagementModalStyles.slotRole}>{t(slot.role, lang)}</Text>
                                        <Text style={businessManagementModalStyles.slotRequirement}>{t('req_major_label', lang)}: {slot.requiredMajor === 'Unskilled' ? t('unskilled_major', lang) : t(slot.requiredMajor, lang)}</Text>
                                        {assignedCharacter && (
                                            <Text style={businessManagementModalStyles.slotSalary}>
                                                {t('salary_label', lang)}: ${salary.toLocaleString()}/mo
                                            </Text>
                                        )}
                                    </View>
                                    <Picker
                                        selectedValue={slot.assignedCharacterId || 'unassigned'}
                                        onValueChange={(itemValue) => handleAssignmentChange(index, itemValue as string)}
                                        style={businessManagementModalStyles.picker}
                                        itemStyle={businessManagementModalStyles.pickerItem}
                                    >
                                        <Picker.Item label={t('unassigned_option', lang)} value="unassigned" />
                                        <Picker.Item label={`${t('hire_robot_option', lang)} (-$${ROBOT_HIRE_COST}/mo)`} value="robot" />
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
                                    {t('upgrade_button', lang)} (-${upgradeCost.toLocaleString()})
                                </Text>
                            </TouchableOpacity>
                         )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const businessManagementModalStyles = StyleSheet.create({
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
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    comicPanelWrapper: {
        transform: [{ rotate: '-2deg' }],
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24,
        maxWidth: 640, // max-w-2xl
        width: '100%',
        maxHeight: '90%',
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    levelText: {
        fontSize: 14,
        color: '#64748b', // slate-500
    },
    closeButton: {
        // No direct equivalent for absolute positioning within a flex item without more structure
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    slotsContainer: {
        // maxHeight: 400, // Example max height
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155', // slate-700
        marginBottom: 8,
    },
    slotItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9', // slate-100
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        marginRight: 12,
    },
    robotIcon: {
        width: '100%',
        height: '100%',
    },
    emptyAvatar: {
        width: 64,
        height: 64,
        backgroundColor: '#e2e8f0', // slate-200
        borderRadius: 32,
    },
    slotDetails: {
        flex: 1,
    },
    slotRole: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    slotRequirement: {
        fontSize: 12,
        color: '#64748b', // slate-500
    },
    slotSalary: {
        fontSize: 12,
        color: '#16a34a', // green-600
    },
    picker: {
        width: 200,
        // RN Picker styling is limited. This is a basic width.
    },
    pickerItem: {
        // itemStyle is iOS only.
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: '#e2e8f0', // slate-200
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#60a5fa', // blue-400
        padding: 12,
        borderRadius: 8,
    },
    upgradeButtonDisabled: {
        opacity: 0.5,
    },
    upgradeIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        color: 'white',
    },
    upgradeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
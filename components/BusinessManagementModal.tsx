import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, ImageSourcePropType, FlatList, Modal } from 'react-native';
// Picker đã được xóa
import type { Business, GameState, Manifest, Language, Character } from '../core/types';
import { BUSINESS_DEFINITIONS, ROBOT_HIRE_COST } from '../core/constants';
import * as localization from '../core/localization';
import { getCharacterDisplayName, calculateEmployeeSalary } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { UpgradeIcon, RobotAvatarIcon, CloseIcon } from './icons';
import { LifePhase, CharacterStatus } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';

// =================================================================
// BƯỚC 2: TẠO COMPONENT CON `AssignmentModal`
// =================================================================
const AssignmentModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    availableMembers: Character[];
    onSelect: (characterId: string | null) => void;
    lang: Language;
    slot: Business['slots'][0];
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
}> = ({ isVisible, onClose, availableMembers, onSelect, lang, slot, manifest, images }) => {
    
    const renderCharacterItem = ({ item }: { item: Character | 'unassigned' | 'robot' }) => {
        if (item === 'unassigned') {
            return (
                <TouchableOpacity style={assignmentModalStyles.itemContainer} onPress={() => onSelect(null)}>
                    <View style={assignmentModalStyles.avatarPlaceholder} />
                    <Text style={assignmentModalStyles.itemText}>{localization.t('unassigned_option', lang)}</Text>
                </TouchableOpacity>
            );
        }
        if (item === 'robot') {
            return (
                <TouchableOpacity style={assignmentModalStyles.itemContainer} onPress={() => onSelect('robot')}>
                    <RobotAvatarIcon style={assignmentModalStyles.avatar} />
                    <Text style={assignmentModalStyles.itemText}>{`${localization.t('hire_robot_option', lang)} (-${ROBOT_HIRE_COST}/mo)`}</Text>
                </TouchableOpacity>
            );
        }

        const character = item;
        const displayName = getCharacterDisplayName(character, lang);
        const isMajorMatch = slot.requiredMajor !== 'Unskilled' && character.major === slot.requiredMajor;
        
        return (
            <TouchableOpacity style={assignmentModalStyles.itemContainer} onPress={() => onSelect(character.id)}>
                <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{width: 48, height: 48}} />
                <View style={assignmentModalStyles.characterInfo}>
                    <Text style={assignmentModalStyles.itemText}>{`${isMajorMatch ? '⭐ ' : ''}${displayName}`}</Text>
                    <Text style={assignmentModalStyles.subText}>{`Skill: ${Math.round(character.stats.skill)}, Salary: $${calculateEmployeeSalary(character).toLocaleString()}`}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const data: (Character | 'unassigned' | 'robot')[] = ['unassigned', 'robot', ...availableMembers];

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Pressable style={assignmentModalStyles.overlay} onPress={onClose}>
                <View style={assignmentModalStyles.modalContent}>
                    <Text style={assignmentModalStyles.modalTitle}>{localization.t('assign_employee_title', lang)}</Text>
                    <FlatList
                        data={data}
                        renderItem={renderCharacterItem}
                        keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
                        style={{ width: '100%' }}
                    />
                </View>
            </Pressable>
        </Modal>
    );
};
// =================================================================

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
    // BƯỚC 1: Thêm State mới
    const [isAssigningForSlot, setIsAssigningForSlot] = useState<number | null>(null);

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

    const handleAssignmentChange = (slotIndex: number, newCharacterId: string | null) => {
        onAssignToBusiness(business.id, slotIndex, newCharacterId);
        setIsAssigningForSlot(null); // Đóng modal sau khi chọn
    };

    return (
        <>
            <ComicPanelModal visible={true} onClose={onClose} rotate="0deg">
                <View style={businessManagementModalStyles.header}>
                    <View>
                        <Text style={businessManagementModalStyles.title}>{localization.t(businessDef.nameKey, lang)}</Text>
                        <Text style={businessManagementModalStyles.levelText}>{localization.t('level_label', lang)}: {business.level}</Text>
                    </View>
                    <Pressable onPress={onClose} style={businessManagementModalStyles.closeButton}><CloseIcon width={32} height={32} color="#94a3b8" /></Pressable>
                </View>

                <ScrollView style={businessManagementModalStyles.slotsContainer}>
                    <Text style={businessManagementModalStyles.sectionTitle}>{localization.t('employee_slots_label', lang)}</Text>
                    {business.slots.map((slot, index) => {
                            const assignedCharacter = slot.assignedCharacterId && slot.assignedCharacterId !== 'robot' ? gameState.familyMembers[slot.assignedCharacterId] : null;
                            const isRobot = slot.assignedCharacterId === 'robot';
                            const salary = assignedCharacter ? calculateEmployeeSalary(assignedCharacter) : 0;

                            return (
                                // BƯỚC 3: Thay thế Picker bằng TouchableOpacity
                                <TouchableOpacity 
                                    key={index} 
                                    style={businessManagementModalStyles.slotItem} 
                                    onPress={() => setIsAssigningForSlot(index)}
                                >
                                    <View style={businessManagementModalStyles.avatarContainer}>
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
                                        <Text style={businessManagementModalStyles.slotRequirement}>
                                            {localization.t('req_major_label', lang)}: {slot.requiredMajor === 'Unskilled' ? localization.t('unskilled_major', lang) : localization.t(slot.requiredMajor, lang)}
                                        </Text>
                                        {assignedCharacter ? (
                                            <Text style={businessManagementModalStyles.slotSalary}>
                                                Salary: ${salary.toLocaleString()}/mo
                                            </Text>
                                        ) : isRobot ? (
                                            <Text style={businessManagementModalStyles.slotSalary}>
                                                Cost: ${ROBOT_HIRE_COST.toLocaleString()}/mo
                                            </Text>
                                        ) : (
                                            <Text style={businessManagementModalStyles.unassignedText}>
                                                {localization.t('unassigned_option', lang)}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
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
                                {`${localization.t('sell_button', lang)} (+${(businessDef.cost * 0.5).toLocaleString()})`}
                            </Text>
                        </TouchableOpacity>
                </View>
            </ComicPanelModal>

            {/* BƯỚC 4: Render AssignmentModal có điều kiện */}
            {isAssigningForSlot !== null && (
                <AssignmentModal
                    isVisible={true}
                    onClose={() => setIsAssigningForSlot(null)}
                    availableMembers={availableMembers}
                    onSelect={(characterId) => handleAssignmentChange(isAssigningForSlot, characterId)}
                    lang={lang}
                    slot={business.slots[isAssigningForSlot]}
                    manifest={manifest}
                    images={images}
                />
            )}
        </>
    )
};

const businessManagementModalStyles = StyleSheet.create({
    avatarContainer: {
        height: 64,
        width: 64,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {},
    emptyAvatar: {
        backgroundColor: '#e2e8f0',
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    footer: {
        borderColor: '#e2e8f0',
        borderTopWidth: 1,
        marginTop: 16,
        paddingTop: 16,
    },
    header: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    levelText: {
        color: '#64748b',
        fontSize: 14,
    },
    robotIcon: {
        height: '100%',
        width: '100%',
    },
    sectionTitle: {
        color: '#334155',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sellButton: {
        alignItems: 'center',
        backgroundColor: '#ef4444',
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
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        flexDirection: 'row',
        marginBottom: 10,
        padding: 12,
    },
    slotRequirement: {
        color: '#64748b',
        fontSize: 12,
    },
    slotRole: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    slotSalary: {
        color: '#16a34a',
        fontSize: 12,
        marginTop: 4,
    },
    slotsContainer: {
        maxHeight: 350, // Giới hạn chiều cao cho ScrollView
    },
    title: {
        color: '#1e293b',
        fontSize: 24,
        fontWeight: 'bold',
    },
    unassignedText: {
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 4,
    },
    upgradeButton: {
        alignItems: 'center',
        backgroundColor: '#60a5fa',
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

// Styles cho AssignmentModal mới
const assignmentModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatar: {
        width: 48,
        height: 48,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e2e8f0',
    },
    characterInfo: {
        marginLeft: 12,
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    subText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    }
});
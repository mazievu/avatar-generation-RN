import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageSourcePropType } from 'react-native';
import type { Character, GameState, Manifest, Language } from '../core/types';
import { BlurView } from '@react-native-community/blur';
import { CAREER_LADDER, PET_DATA } from '../core/constants';
import { CLUBS } from '../core/clubsAndEventsData';
import { getAllEvents } from '../core/gameData';
import { t, displayPhase, displayStatus, displayRelationshipStatus } from '../core/localization';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { GameLog } from './GameLog';
import { StatBar } from './StatBar';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon, getPetIcon } from './icons';

interface CharacterDetailModalProps {
    lang: Language;
    character: Character;
    gameState: GameState;
    onClose: () => void;
    onCustomize: (characterId: string) => void;
    images: Record<string, ImageSourcePropType>;
    manifest: Manifest;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, gameState, onClose, onCustomize, images, manifest, lang }) => {
    const [activeDetailTab, setActiveDetailTab] = React.useState('details');
    const displayName = getCharacterDisplayName(character, lang);
    const partner = character.partnerId ? gameState.familyMembers[character.partnerId] : null;
    const partnerDisplayName = partner ? getCharacterDisplayName(partner, lang) : '';

    const educationText = character.universityDegree ? t(character.universityDegree, lang) : (character.schoolHistory && character.schoolHistory.length > 0 ? t('education_some_school', lang) : t('education_none', lang));
    const career = character.careerTrack && character.careerLevel !== undefined ? CAREER_LADDER[character.careerTrack]?.levels[character.careerLevel] : null;
    const businessRole = character.businessId && character.businessSlotIndex !== undefined ? gameState.familyBusinesses[character.businessId]?.slots[character.businessSlotIndex] : null;
    const pet = character.petId ? gameState.familyPets[character.petId] : null;

    return (
        <View style={characterDetailModalStyles.overlay}>
            <BlurView
                style={characterDetailModalStyles.absolute}
                blurType="dark"
                blurAmount={10}
            />
            <View style={characterDetailModalStyles.modalContainer}>
                <View style={characterDetailModalStyles.header}>
                    <View>
                        <Text style={characterDetailModalStyles.title}>
                            {displayName} (G{character.generation})
                        </Text>
                        <TouchableOpacity onPress={onClose} style={characterDetailModalStyles.closeButton}><Text style={characterDetailModalStyles.closeButtonText}>&times;</Text></TouchableOpacity>
                    </View>

                    <View style={characterDetailModalStyles.tabContainer}>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('details')}
                            style={[characterDetailModalStyles.tabButton, activeDetailTab === 'details' && characterDetailModalStyles.tabButtonActive]}
                        >
                            <Text style={[characterDetailModalStyles.tabButtonText, activeDetailTab === 'details' && characterDetailModalStyles.tabButtonTextActive]}>
                                {t('tab_details', lang)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('events')}
                            style={[characterDetailModalStyles.tabButton, activeDetailTab === 'events' && characterDetailModalStyles.tabButtonActive]}
                        >
                            <Text style={[characterDetailModalStyles.tabButtonText, activeDetailTab === 'events' && characterDetailModalStyles.tabButtonTextActive]}>
                                {t('tab_life_events', lang)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeDetailTab === 'details' && (
                    <ScrollView style={characterDetailModalStyles.detailsContent}>
                        <View style={characterDetailModalStyles.detailsSection}>
                            <View style={characterDetailModalStyles.avatarSection}>
                                {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
                                    <AgeAwareAvatarPreview
                                        manifest={manifest}
                                        character={character}
                                        images={images}
                                        size={{ width: 128, height: 128 }}
                                    />
                                ) : null}
                            </View>

                            <View style={characterDetailModalStyles.infoSection}>
                                <View>
                                    <Text style={characterDetailModalStyles.infoText}>{displayPhase(character.phase, lang)} | {displayStatus(character.status, lang)}</Text>
                                    <Text style={characterDetailModalStyles.infoText}>{character.isAlive ? `${character.age} ${t('age_short', lang)}` : `${t('deceased_at', lang)} ${character.age}`}</Text>
                                </View>

                                <Text style={characterDetailModalStyles.infoText}>{t('relationship_label', lang)}: {displayRelationshipStatus(character.relationshipStatus, lang)}{partner ? ` ${t('with_person', lang)} ${partnerDisplayName}`: ''}</Text>
                            </View>
                        </View>

                        {pet && (
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                {getPetIcon(pet.type)}
                                <Text style={[characterDetailModalStyles.infoText, {marginLeft: 4}]}>
                                    {t('pet_label', lang)}: {pet.name} {t('the_pet_type', lang)} {t(PET_DATA[pet.type].nameKey, lang)}
                                </Text>
                            </View>
                        )}

                        <Text style={characterDetailModalStyles.infoText}>{t('education_label', lang)}: {educationText}</Text>
                        {character.major && <Text style={characterDetailModalStyles.infoText}>{t('major_label', lang)}: {t(character.major, lang)}</Text>}
                        {career && <Text style={characterDetailModalStyles.infoText}>{t('career_label', lang)}: {t(career.titleKey, lang)} (${career.salary.toLocaleString()}/yr)</Text>}
                        {businessRole && <Text style={characterDetailModalStyles.infoText}>{t('working_at_label', lang)}: {businessRole.businessName} ({businessRole.role})</Text>}

                        {character.currentClubs && character.currentClubs.length > 0 && (
                            <View style={characterDetailModalStyles.section}>
                                <Text style={characterDetailModalStyles.sectionTitle}>{t('clubs_label', lang)}:</Text>
                                <View style={characterDetailModalStyles.sectionContent}>
                                    {character.currentClubs.map(clubId => {
                                        const club = CLUBS.find(c => c.id === clubId);
                                        return club ? <Text key={clubId} style={characterDetailModalStyles.sectionItem}>{t(club.nameKey, lang)}</Text> : null;
                                    }) }
                                </View>
                            </View>
                        )}

                        {character.completedOneTimeEvents && character.completedOneTimeEvents.length > 0 && (
                            <View style={characterDetailModalStyles.section}>
                                <Text style={characterDetailModalStyles.sectionTitle}>{t('life_events_label', lang)}:</Text>
                                <View style={characterDetailModalStyles.sectionContent}>
                                    {character.completedOneTimeEvents.map((eventId, index) => {
                                        const event = getAllEvents().find(e => e.id === eventId);
                                        return event ? <Text key={`${eventId}-${index}`} style={characterDetailModalStyles.sectionItem}>{t(event.titleKey, lang)}</Text> : null;
                                    }) }
                                </View>
                            </View>
                        )}

                        {character.isAlive && (
                            <View style={characterDetailModalStyles.statsSection}>
                                <StatBar Icon={IqIcon} value={character.stats.iq} max={200} label="IQ" color="#60a5fa" /> {/* blue-400 */}
                                <StatBar Icon={HappinessIcon} value={character.stats.happiness} max={100} label={t('stat_happiness', lang)} color="#facc15" /> {/* yellow-400 */}
                                <StatBar Icon={EqIcon} value={character.stats.eq} max={100} label={t('stat_eq', lang)} color="#a78bfa" /> {/* purple-400 */}
                                <StatBar Icon={HealthIcon} value={character.stats.health} max={100} label={t('stat_health', lang)} color="#f87171" /> {/* red-400 */}
                                {character.age >= 18 && <StatBar Icon={SkillIcon} value={character.stats.skill} max={100} label={t('stat_skill', lang)} color="#4ade80" />} {/* green-400 */}
                            </View>
                        )}
                        {!character.staticAvatarUrl && (
                            <View style={characterDetailModalStyles.customizeButtonContainer}>
                                <TouchableOpacity onPress={() => onCustomize(character.id)} style={characterDetailModalStyles.customizeButton}>
                                    <Text style={characterDetailModalStyles.customizeButtonText}>
                                        Customize
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                )}

                {activeDetailTab === 'events' && (
                    <View style={characterDetailModalStyles.eventsContent}>
                        <GameLog
                            log={gameState.gameLog.filter(entry => entry.characterId === character.id)}
                            lang={lang}
                            familyMembers={gameState.familyMembers}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const characterDetailModalStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 50,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90%',
        overflow: 'hidden',
        transform: [{ rotate: '3deg' }],
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 4,
    },
    tabButtonActive: {
        backgroundColor: '#eff6ff', // blue-50
    },
    tabButtonText: {
        fontSize: 16,
        color: '#475569', // slate-600
    },
    tabButtonTextActive: {
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
    },
    detailsContent: {
        padding: 16,
    },
    eventsContent: {
        flex: 1,
        padding: 16,
    },
    detailsSection: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatarSection: {
        marginRight: 16,
    },
    infoSection: {
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    sectionContent: {
        marginLeft: 8,
    },
    sectionItem: {
        fontSize: 14,
        color: '#555',
    },
    statsSection: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // slate-200
        paddingTop: 16,
    },
    customizeButtonContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    customizeButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    customizeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
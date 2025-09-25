import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Dimensions, ImageSourcePropType } from 'react-native';

import { ComicPanelModal } from './ComicPanelModal';
import type { Character, GameState, Language, Manifest, Club } from '../core/types'; 
import { LogEntry } from './GameLog';
import { t } from '../core/localization';
import { getEducationDisplay } from '../core/utils';

import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { CloseIcon, IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons';
import { CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT } from '../core/constants';

// --- Thêm các hàm responsive và lấy chiều cao màn hình ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const baseWidth = 375; // Chiều rộng cơ sở để scale
const scale = screenWidth / baseWidth;
const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);
// --------------------------------
 const contentMaxHeight = screenHeight * 0.85 - responsiveSize(150);

interface CharacterDetailModalProps {
  character: Character | null;
  gameState: GameState;
  onClose: () => void;
  onCustomize: (characterId: string) => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  clubs: Club[];
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, gameState, onClose, onCustomize, lang, manifest, images }) => {
  const [activeTab, setActiveTab] = useState('details');
  if (!character) { return null; }

  const isCustomizationUnlocked = gameState.totalChildrenBorn >= CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT;

  const renderDetailTab = () => {
    return (
    <>
        <View style={styles.infoSection}>
            <View style={styles.avatarContainer}>
                <AgeAwareAvatarPreview character={character} size={{ width: responsiveSize(120), height: responsiveSize(120) }} manifest={manifest} images={images} />
            </View>
            <View style={styles.basicInfo}>
                <Text style={styles.infoText} numberOfLines={2}>{`${character.phase} | ${character.status}`}</Text>
                <Text style={styles.infoText}>{t('character_age', lang, { age: character.age })}</Text>
                <Text style={styles.infoText} numberOfLines={2}>{t('relationship_status_label', lang, { status: t(character.relationshipStatus, lang) })}</Text>
            </View>
        </View>

        <View style={styles.detailList}>
            <Text style={styles.detailText}><Text style={styles.bold}>{t('education_label', lang)}</Text> {getEducationDisplay(character, lang)}</Text>
            <Text style={[styles.detailText, styles.careerText]}>
                <Text style={styles.bold}>{t('career_label', lang)}</Text> 
                {character.careerTrack ? t(character.careerTrack, lang) : t('none', lang)}
            </Text>
        </View>
        
        {character.isAlive && (
            <View style={styles.statsContainer}>
                <View style={styles.statRow}><IqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#3b82f6" /><Text style={styles.statLabel}>{t('stat_iq', lang)}</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.iqStatBar, { width: `${(character.stats.iq / 200) * 100}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.iq)}</Text></View>
                <View style={styles.statRow}><HappinessIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#f59e0b" /><Text style={styles.statLabel}>{t('stat_happiness', lang)}</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.happinessStatBar, { width: `${character.stats.happiness}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.happiness)}</Text></View>
                <View style={styles.statRow}><EqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#8b5cf6" /><Text style={styles.statLabel}>{t('stat_eq', lang)}</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.eqStatBar, { width: `${(character.stats.eq / 100) * 100}%` }]} /></View><Text style={styles.statValue}>{isNaN(character.stats.eq) ? 'NaN' : Math.round(character.stats.eq)}</Text></View>
                <View style={styles.statRow}><HealthIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#ef4444" /><Text style={styles.statLabel}>{t('stat_health', lang)}</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.healthStatBar, { width: `${character.stats.health}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.health)}</Text></View>
                {character.age >= 18 && (<View style={styles.statRow}><SkillIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#22c55e" /><Text style={styles.statLabel}>{t('stat_skill', lang)}</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.skillStatBar, { width: `${character.stats.skill}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.skill)}</Text></View>)}
            </View>
        )}
        {!character.staticAvatarUrl && (
            <View>
                <TouchableOpacity 
                    style={[styles.customizeButton, !isCustomizationUnlocked && styles.disabledButton]} 
                    onPress={() => onCustomize(character.id)}
                    disabled={!isCustomizationUnlocked}
                >
                    <Text style={[styles.customizeButtonText, !isCustomizationUnlocked && styles.disabledButtonText]}>{t('customize_button', lang)}</Text>
                </TouchableOpacity>
                {!isCustomizationUnlocked && (
                    <Text style={styles.lockMessage}>{t('avatar_customization_locked', lang, { requiredChildren: CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT })}</Text>
                )}
            </View>
        )}
    </>
    );
  };

  const renderEventsTab = () => {
    const logEntries = [...gameState.gameLog].filter(entry => entry.characterId === character.id).reverse();
    return ( <View style={styles.eventsTabContainer}>{logEntries.length > 0 ? (logEntries.map((entry, index) => (<LogEntry key={entry.id || `${entry.year}-${index}`} entry={entry} lang={gameState.lang} familyMembers={gameState.familyMembers} />))) : (<Text style={styles.emptyListText}>{t('no_events_for_character', lang)}</Text>)}</View>);
  };
  
  return (
    <ComicPanelModal
      visible={!!character}
      onClose={onClose}
      containerStyle={{ maxHeight: screenHeight * 0.85 }} // <-- GIẢI PHÁP CHÍNH
      closeButtonComponent={
        <Pressable onPress={onClose} style={styles.closeButton}>
          <CloseIcon width={responsiveSize(28)} height={responsiveSize(20)} color="#EF4444" />
        </Pressable>
      }
    >
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.characterName} numberOfLines={1} adjustsFontSizeToFit>{character.name} (G{character.generation})</Text>
            </View>
            <View style={styles.tabContainer}>
                <Pressable style={[styles.tab, activeTab === 'details' ? styles.activeTab : {}]} onPress={() => setActiveTab('details')}>
                    <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>{t('tab_details', lang)}</Text>
                </Pressable>
                <Pressable style={[styles.tab, activeTab === 'events' ? styles.activeTab : {}]} onPress={() => setActiveTab('events')}>
                    <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>{t('tab_life_events', lang)}</Text>
                </Pressable>
            </View>
            
            <ScrollView style={[{ maxHeight: contentMaxHeight }, styles.scrollView]} showsVerticalScrollIndicator={false}>
                {activeTab === 'details' ? renderDetailTab() : renderEventsTab()}
            </ScrollView>
        </View>
    </ComicPanelModal>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container này đóng vai trò là một khối layout thống nhất bên trong modal
    // Nó cho phép ScrollView hoạt động chính xác trong không gian bị giới hạn bởi maxHeight
  },
  scrollView: {
    // Đảm bảo ScrollView không cố gắng chiếm không gian một cách không cần thiết
  },
  // TABS
  tabContainer: { 
    flexDirection: 'row',
    backgroundColor: '#e2e8f0', 
    borderRadius: responsiveSize(8), 
    padding: responsiveSize(4),
    marginBottom: responsiveSize(16),
  },
  tab: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: responsiveSize(8), 
    borderRadius: responsiveSize(6),
  },
  tabText: { 
    fontSize: responsiveFontSize(16), 
    fontWeight: 'bold',
    color: '#64748b', 
  },
  activeTab: { 
    backgroundColor: '#ffffff', 
  },
  activeTabText: { 
    color: '#334155', 
  },

  // HEADER
  header: { 
    marginBottom: responsiveSize(12),
  },
  characterName: { 
    color: '#1e293b', 
    fontSize: responsiveFontSize(28), 
    fontWeight: '900', 
    textAlign: 'center',
  },
  closeButton: { 
    padding: responsiveSize(4), 
  },

  // TOP INFO SECTION
  infoSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: responsiveSize(16), 
  },
  avatarContainer: { 
    width: responsiveSize(120),
    height: responsiveSize(120),
    backgroundColor: '#e0f2fe', 
    borderColor: '#f59e0b', 
    borderRadius: responsiveSize(16), 
    borderWidth: responsiveSize(4), 
    overflow: 'hidden',
    marginRight: responsiveSize(16),
  },
  basicInfo: {
    flex: 1,
    flexShrink: 1,
  },
  infoText: { 
    color: '#475569', 
    fontSize: responsiveFontSize(15), 
    marginBottom: responsiveSize(4),
  },

  // DETAILS LIST (Học vấn, Sự nghiệp)
  detailList: { 
    gap: responsiveSize(6),
    marginBottom: responsiveSize(16), 
  },
  detailText: { 
    color: '#334155', 
    fontSize: responsiveFontSize(16), 
  },
  bold: { 
    color: '#1e293b', 
    fontWeight: 'bold', 
  },
  careerText: { 
    color: '#22c55e' 
  },

  // STATS CONTAINER
  statsContainer: { 
    backgroundColor: '#f8fafc', 
    borderColor: '#e2e8f0', 
    borderRadius: responsiveSize(12), 
    borderWidth: 1, 
    marginTop: responsiveSize(8), 
    paddingHorizontal: responsiveSize(12),
    paddingVertical: responsiveSize(8),
  },
  statRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginVertical: responsiveSize(6),
  },
  statIcon: { 
    height: responsiveSize(20), 
    width: responsiveSize(20),
  },
  statLabel: { 
    color: '#475569', 
    fontSize: responsiveFontSize(15), 
    marginHorizontal: responsiveSize(8), 
    width: responsiveSize(75),
  },
  statBarContainer: { 
    flex: 1,
    height: responsiveSize(12),
    backgroundColor: '#e2e8f0', 
    borderRadius: responsiveSize(6), 
    overflow: 'hidden', 
  },
  statBar: { 
    borderRadius: responsiveSize(6), 
    height: '100%', 
  },
  statValue: { 
    color: '#334155', 
    fontSize: responsiveFontSize(15), 
    fontWeight: '600', 
    marginLeft: responsiveSize(8), 
    textAlign: 'right', 
    width: responsiveSize(35),
  },
  iqStatBar: { backgroundColor: "#3b82f6" },
  happinessStatBar: { backgroundColor: "#f59e0b" },
  eqStatBar: { backgroundColor: "#8b5cf6" },
  healthStatBar: { backgroundColor: "#ef4444" },
  skillStatBar: { backgroundColor: "#22c55e" },

  // CUSTOMIZE BUTTON
  customizeButton: { 
    alignItems: 'center', 
    backgroundColor: '#fecaca', 
    borderBottomColor: '#f87171', 
    borderBottomWidth: responsiveSize(4), 
    borderRadius: responsiveSize(12), 
    marginTop: responsiveSize(20), 
    paddingVertical: responsiveSize(14), 
  },
  customizeButtonText: { 
    color: '#b91c1c', 
    fontSize: responsiveFontSize(18), 
    fontWeight: 'bold', 
  },
  disabledButton: { 
    backgroundColor: '#d1d5db', 
    borderBottomColor: '#9ca3af', 
  },
  disabledButtonText: { 
    color: '#6b7280', 
  },
  lockMessage: { 
    color: '#6b7280', 
    fontSize: responsiveFontSize(14), 
    fontStyle: 'italic', 
    marginTop: responsiveSize(4), 
    textAlign: 'center',
    marginBottom: responsiveSize(10),
  },

  // EVENTS TAB
  eventsTabContainer: { 
    paddingTop: responsiveSize(8)
  },
  emptyListText: { 
    color: '#64748b', 
    fontSize: responsiveFontSize(16), 
    fontStyle: 'italic',
    textAlign: 'center',
    padding: responsiveSize(20),
  },
});
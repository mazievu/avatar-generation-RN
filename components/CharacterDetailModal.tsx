// src/components/CharacterDetailModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity } from 'react-native';


import { ComicPanelModal } from './ComicPanelModal';
import type { Character, GameState, Language, Manifest } from '../core/types'; 
import { LogEntry } from './GameLog';
import { ImageSourcePropType } from 'react-native';
import { t } from '../core/localization';
import { getEducationDisplay } from '../core/utils';

import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { CloseIcon, IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons';
import { CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT } from '../core/constants';

interface CharacterDetailModalProps {
  character: Character | null;
  gameState: GameState;
  onClose: () => void;
  onCustomize: (characterId: string) => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, gameState, onClose, onCustomize, lang, manifest, images }) => {
  const [activeTab, setActiveTab] = useState('details');
  if (!character) { return null; }

  const isCustomizationUnlocked = gameState.totalChildrenBorn >= CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT;

  const renderDetailTab = () => {
    const flatAvatarStyle = StyleSheet.flatten(styles.avatarContainer);
    return (
    <>
        <View style={styles.infoSection}><View style={styles.avatarContainer}><AgeAwareAvatarPreview character={character} size={{ width: flatAvatarStyle.width, height: flatAvatarStyle.height }} manifest={manifest} images={images} /></View><View style={styles.basicInfo}><Text style={styles.infoText}>{`${character.phase} | ${character.status}  ${character.age} tuổi`}</Text><Text style={styles.infoText}>{`Tình trạng: ${character.relationshipStatus}`}</Text></View></View>
        <View style={styles.detailList}><Text style={styles.detailText}><Text style={styles.bold}>Học vấn:</Text> {getEducationDisplay(character, lang)}</Text><Text style={[styles.detailText, styles.careerText]}><Text style={styles.bold}>Sự nghiệp:</Text> {character.careerTrack ? t(character.careerTrack, lang) : 'Chưa có'}</Text></View>
        
        {character.isAlive && (<View style={styles.statsContainer}><View style={styles.statRow}><IqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#3b82f6" /><Text style={styles.statLabel}>IQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.iqStatBar, { width: `${(character.stats.iq / 200) * 100}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.iq)}</Text></View><View style={styles.statRow}><HappinessIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#f59e0b" /><Text style={styles.statLabel}>Hạnh phúc</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.happinessStatBar, { width: `${character.stats.happiness}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.happiness)}</Text></View><View style={styles.statRow}><EqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#8b5cf6" /><Text style={styles.statLabel}>EQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.eqStatBar, { width: `${character.stats.eq}%` }]} /></View><Text style={styles.statValue}>{isNaN(character.stats.eq) ? 'NaN' : Math.round(character.stats.eq)}</Text></View><View style={styles.statRow}><HealthIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#ef4444" /><Text style={styles.statLabel}>Sức khỏe</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.healthStatBar, { width: `${character.stats.health}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.health)}</Text></View>{character.age >= 18 && (<View style={styles.statRow}><SkillIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#22c55e" /><Text style={styles.statLabel}>Kỹ năng</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.skillStatBar, { width: `${character.stats.skill}%` }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.skill)}</Text></View>)}</View>)}
        {!character.staticAvatarUrl && (
            <View>
                <TouchableOpacity 
                    style={[styles.customizeButton, !isCustomizationUnlocked && styles.disabledButton]} 
                    onPress={() => onCustomize(character.id)}
                    disabled={!isCustomizationUnlocked}
                >
                    <Text style={[styles.customizeButtonText, !isCustomizationUnlocked && styles.disabledButtonText]}>Customize</Text>
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
    return ( <View style={styles.eventsTabContainer}>{logEntries.length > 0 ? (logEntries.map((entry, index) => (<LogEntry key={entry.id || `${entry.year}-${index}`} entry={entry} lang={gameState.lang} familyMembers={gameState.familyMembers} />))) : (<Text style={styles.emptyListText}>Chưa có sự kiện nào cho nhân vật này.</Text>)}</View>);
  };
  
  return (
    <ComicPanelModal
      visible={!!character}
      onClose={onClose}
      flexContent={false}
      closeButtonComponent={
        <Pressable onPress={onClose} style={styles.closeButton}>
          <CloseIcon width={28} height={20} color="#EF4444" />
        </Pressable>
      }
    >
      <View style={styles.container}>
        <View style={styles.header}><Text style={styles.characterName}>{character.name} (G{character.generation})</Text></View>
        <View style={styles.tabContainer}><Pressable style={[styles.tab, activeTab === 'details' ? styles.activeTab : {}]} onPress={() => setActiveTab('details')}><Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Chi tiết</Text></Pressable><Pressable style={[styles.tab, activeTab === 'events' ? styles.activeTab : {}]} onPress={() => setActiveTab('events')}><Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Sự kiện cuộc đời</Text></Pressable></View>
        
        {/* Sửa lỗi layout ở đây */}
        <View style={styles.contentContainer}>
            <ScrollView 
              contentContainerStyle={styles.scrollContentContainer} 
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'details' ? renderDetailTab() : renderEventsTab()}
            </ScrollView>
        </View>
      </View>
    </ComicPanelModal>
  );
};

const styles = StyleSheet.create({
  activeTab: { backgroundColor: '#ffffff', },
  activeTabText: { color: '#334155', },
  avatarContainer: { backgroundColor: '#e0f2fe', borderColor: '#f59e0b', borderRadius: 16, borderWidth: 4, height: 170, overflow: 'hidden', width: 170, },
  // ĐÃ BỎ `flex: 1`
  basicInfo: {},
  bold: { color: '#1e293b', fontWeight: 'bold', },
  careerText: { color: '#22c55e' },
  characterName: { color: '#1e293b', fontSize: 30, fontWeight: '900', },
  closeButton: { padding: 4, },
  // ĐÃ BỎ `flex: 1`
  container: { flexDirection: 'column', minHeight: 1, },
  // ĐÃ BỎ `flex: 1`
  contentContainer: {},
  customizeButton: { alignItems: 'center', backgroundColor: '#fecaca', borderBottomColor: '#f87171', borderBottomWidth: 4, borderRadius: 12, marginBottom: 10, marginTop: 20, paddingVertical: 14, },
  customizeButtonText: { color: '#b91c1c', fontSize: 20, fontWeight: 'bold', },
  disabledButton: { backgroundColor: '#d1d5db', borderBottomColor: '#9ca3af', },
  disabledButtonText: { color: '#6b7280', },
  lockMessage: { color: '#6b7280', fontSize: 20, fontStyle: 'italic', marginTop: 4, textAlign: 'center', },
  detailList: { gap: 6, marginBottom: 16, },
  detailText: { color: '#334155', fontSize: 20, },
  emptyListText: { color: '#64748b', fontSize: 20, fontStyle: 'italic', },
  eqStatBar: { backgroundColor: "#8b5cf6" },
  eventsTabContainer: { paddingTop: 8 },
  happinessStatBar: { backgroundColor: "#f59e0b" },
  header: { alignItems: 'center', flexDirection: 'row', height: 40, justifyContent: 'space-between', marginBottom: 16, },
  healthStatBar: { backgroundColor: "#ef4444" },
  infoSection: { alignItems: 'center', flexDirection: 'row', gap: 16, marginBottom: 16, },
  infoText: { color: '#475569', fontSize: 20, marginBottom: 4, },
  iqStatBar: { backgroundColor: "#3b82f6" },
  // ĐÃ BỎ `flexGrow: 1`
  scrollContentContainer: {flexGrow: 1,},
  skillStatBar: { backgroundColor: "#22c55e" },
  statBar: { borderRadius: 6, height: '100%', },
  // ĐÃ BỎ `flex: 1` và THÊM `width` CỐ ĐỊNH
  statBarContainer: { backgroundColor: '#e2e8f0', borderRadius: 6, height: 12, overflow: 'hidden', width: 200, },
  statIcon: { height: 20, width: 20 },
  statLabel: { color: '#475569', fontSize: 15, marginLeft: 8, width: 75, },
  statRow: { alignItems: 'center', flexDirection: 'row', },
  statValue: { color: '#334155', fontSize: 15, fontWeight: '600', marginLeft: 8, textAlign: 'right', width: 35, },
  statsContainer: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 12, borderWidth: 1, gap: 12, marginTop: 8, padding: 12, },
  // ĐÃ BỎ `flex: 1` và THÊM `width` CỐ ĐỊNH
  tab: { alignItems: 'center', borderRadius: 6, justifyContent: 'center', paddingVertical: 8, width: 200, },
  tabContainer: { backgroundColor: '#e2e8f0', borderRadius: 8, flexDirection: 'row', marginBottom: 16, padding: 4, justifyContent: 'center', },
  tabText: { color: '#64748b', fontSize: 20, fontWeight: 'bold', },
});
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

  const renderDetailTab = () => {
    return (
    <>
        <View style={styles.infoSection}><View style={styles.avatarContainer}><AgeAwareAvatarPreview character={character} size={{ width: styles.avatarContainer.width, height: styles.avatarContainer.height }} manifest={manifest} images={images} /></View><View style={styles.basicInfo}><Text style={styles.infoText}>{`${character.phase} | ${character.status}  ${character.age} tuổi`}</Text><Text style={styles.infoText}>{`Tình trạng: ${character.relationshipStatus}`}</Text></View></View>
        <View style={styles.detailList}><Text style={styles.detailText}><Text style={styles.bold}>Học vấn:</Text> {getEducationDisplay(character, lang)}</Text><Text style={[styles.detailText, styles.careerText]}><Text style={styles.bold}>Sự nghiệp:</Text> {character.careerTrack ? t(character.careerTrack, lang) : 'Chưa có'}</Text></View>
        
        {character.isAlive && (<View style={styles.statsContainer}><View style={styles.statRow}><IqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#3b82f6" /><Text style={styles.statLabel}>IQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.iqStatBar]} /></View><Text style={styles.statValue}>{Math.round(character.stats.iq)}</Text></View><View style={styles.statRow}><HappinessIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#f59e0b" /><Text style={styles.statLabel}>Hạnh phúc</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.happinessStatBar]} /></View><Text style={styles.statValue}>{Math.round(character.stats.happiness)}</Text></View><View style={styles.statRow}><EqIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#8b5cf6" /><Text style={styles.statLabel}>EQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.eqStatBar]} /></View><Text style={styles.statValue}>{isNaN(character.stats.eq) ? 'NaN' : Math.round(character.stats.eq)}</Text></View><View style={styles.statRow}><HealthIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#ef4444" /><Text style={styles.statLabel}>Sức khỏe</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.healthStatBar]} /></View><Text style={styles.statValue}>{Math.round(character.stats.health)}</Text></View>{character.age >= 18 && (<View style={styles.statRow}><SkillIcon width={styles.statIcon.width} height={styles.statIcon.height} color="#22c55e" /><Text style={styles.statLabel}>Kỹ năng</Text><View style={styles.statBarContainer}><View style={[styles.statBar, styles.skillStatBar]} /></View><Text style={styles.statValue}>{Math.round(character.stats.skill)}</Text></View>)}</View>)}
        {!character.staticAvatarUrl && (<TouchableOpacity style={styles.customizeButton} onPress={() => onCustomize(character.id)}><Text style={styles.customizeButtonText}>Customize</Text></TouchableOpacity>)}
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
      flexContent={true}
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
  avatarContainer: { backgroundColor: '#e0f2fe', borderColor: '#f59e0b', borderRadius: 16, borderWidth: 4, height: 90, overflow: 'hidden', width: 90, },
  basicInfo: { flex: 1, },
  bold: { color: '#1e293b', fontWeight: 'bold', },
  careerText: { color: '#22c55e' },
  characterName: { color: '#1e293b', fontSize: 20, fontWeight: '900', },
  closeButton: { padding: 4, },
  container: { flex: 1, flexDirection: 'column', minHeight: 1, },
  contentContainer: { flex: 1, },
  customizeButton: { alignItems: 'center', backgroundColor: '#fecaca', borderBottomColor: '#f87171', borderBottomWidth: 4, borderRadius: 12, marginBottom: 10, marginTop: 20, paddingVertical: 14, },
  customizeButtonText: { color: '#b91c1c', fontSize: 16, fontWeight: 'bold', },
  detailList: { gap: 6, marginBottom: 16, },
  detailText: { color: '#334155', fontSize: 15, },
  emptyListText: { color: '#64748b', fontSize: 14, fontStyle: 'italic', },
  eqStatBar: { backgroundColor: "#8b5cf6", width: '${character.stats.eq}%' },
  eventsTabContainer: { paddingTop: 8 },
  happinessStatBar: { backgroundColor: "#f59e0b", width: '${character.stats.happiness}%' },
  header: { alignItems: 'center', flexDirection: 'row', height: 30, justifyContent: 'space-between', marginBottom: 16, },
  healthStatBar: { backgroundColor: "#ef4444", width: '${character.stats.health}%' },
  infoSection: { alignItems: 'center', flexDirection: 'row', gap: 16, marginBottom: 16, },
  infoText: { color: '#475569', fontSize: 14, marginBottom: 4, },
  iqStatBar: { backgroundColor: "#3b82f6", width: '${(character.stats.iq / 200) * 100}%' },
  scrollContentContainer: { flexGrow: 1, },
  skillStatBar: { backgroundColor: "#22c55e", width: '${character.stats.skill}%' },
  statBar: { borderRadius: 6, height: '100%', },
  statBarContainer: { backgroundColor: '#e2e8f0', borderRadius: 6, flex: 1, height: 12, overflow: 'hidden', },
  statIcon: { height: 20, width: 20 },
  statLabel: { color: '#475569', fontSize: 13, marginLeft: 8, width: 75, },
  statRow: { alignItems: 'center', flexDirection: 'row', },
  statValue: { color: '#334155', fontSize: 14, fontWeight: '600', marginLeft: 8, textAlign: 'right', width: 35, },
  statsContainer: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 12, borderWidth: 1, gap: 12, marginTop: 8, padding: 12, },
  tab: { alignItems: 'center', borderRadius: 6, flex: 1, justifyContent: 'center', paddingVertical: 8, },
  tabContainer: { backgroundColor: '#e2e8f0', borderRadius: 8, flexDirection: 'row', marginBottom: 16, padding: 4, },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: 'bold', },
});
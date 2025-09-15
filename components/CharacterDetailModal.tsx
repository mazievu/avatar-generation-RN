// src/components/CharacterDetailModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

import { ComicPanelModal } from './ComicPanelModal';
import type { Character, GameState, Language, Manifest, Club, GameLogEntry } from '../core/types'; 
import { LogEntry } from './GameLog';
import { ImageSourcePropType } from 'react-native';
import { t } from '../core/localization';

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
  clubs: Club[];
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, gameState, onClose, onCustomize, lang, manifest, images, clubs }) => {
  const [activeTab, setActiveTab] = useState('details');
  if (!character) { return null; }

  const renderDetailTab = () => {
    const recentLogEntries = gameState.gameLog.filter(entry => entry.characterId === character.id).slice(-3).reverse();
    return (
    <>
        <View style={styles.infoSection}><View style={styles.avatarContainer}><AgeAwareAvatarPreview character={character} size={{ width: responsiveSize(90), height: responsiveSize(90) }} manifest={manifest} images={images} /></View><View style={styles.basicInfo}><Text style={styles.infoText}>{`${character.phase} | ${character.status}  ${character.age} tuổi`}</Text><Text style={styles.infoText}>{`Tình trạng: ${character.relationshipStatus}`}</Text></View></View>
        <View style={styles.detailList}><Text style={styles.detailText}><Text style={styles.bold}>Học vấn:</Text> {t(character.education, lang)}</Text><Text style={[styles.detailText, { color: '#22c55e' }]}><Text style={styles.bold}>Sự nghiệp:</Text> {character.careerTrack ? t(character.careerTrack, lang) : 'Chưa có'}</Text></View>
        <View style={styles.eventsPreviewSection}><Text style={styles.sectionTitle}>Sự kiện cuộc đời:</Text>{recentLogEntries.length > 0 ? ( recentLogEntries.map((entry: GameLogEntry, index) => (<Text key={`${entry.id || index}`} style={styles.eventItem}>• {t(entry.messageKey, lang, entry.replacements)}</Text>)) ) : (<Text style={styles.emptyListText}>Chưa có sự kiện nào.</Text>)}</View>
        {character.isAlive && (<View style={styles.statsContainer}><View style={styles.statRow}><IqIcon width={responsiveSize(20)} height={responsiveSize(20)} color="#3b82f6" /><Text style={styles.statLabel}>IQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, { width: `${(character.stats.iq / 200) * 100}%`, backgroundColor: "#3b82f6" }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.iq)}</Text></View><View style={styles.statRow}><HappinessIcon width={responsiveSize(20)} height={responsiveSize(20)} color="#f59e0b" /><Text style={styles.statLabel}>Hạnh phúc</Text><View style={styles.statBarContainer}><View style={[styles.statBar, { width: `${character.stats.happiness}%`, backgroundColor: "#f59e0b" }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.happiness)}</Text></View><View style={styles.statRow}><EqIcon width={responsiveSize(20)} height={responsiveSize(20)} color="#8b5cf6" /><Text style={styles.statLabel}>EQ</Text><View style={styles.statBarContainer}><View style={[styles.statBar, { width: `${character.stats.eq}%`, backgroundColor: "#8b5cf6" }]} /></View><Text style={styles.statValue}>{isNaN(character.stats.eq) ? 'NaN' : Math.round(character.stats.eq)}</Text></View><View style={styles.statRow}><HealthIcon width={responsiveSize(20)} height={responsiveSize(20)} color="#ef4444" /><Text style={styles.statLabel}>Sức khỏe</Text><View style={styles.statBarContainer}><View style={[styles.statBar, { width: `${character.stats.health}%`, backgroundColor: "#ef4444" }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.health)}</Text></View>{character.age >= 18 && (<View style={styles.statRow}><SkillIcon width={responsiveSize(20)} height={responsiveSize(20)} color="#22c55e" /><Text style={styles.statLabel}>Kỹ năng</Text><View style={styles.statBarContainer}><View style={[styles.statBar, { width: `${character.stats.skill}%`, backgroundColor: "#22c55e" }]} /></View><Text style={styles.statValue}>{Math.round(character.stats.skill)}</Text></View>)}</View>)}
        {!character.staticAvatarUrl && (<TouchableOpacity style={styles.customizeButton} onPress={() => onCustomize(character.id)}><Text style={styles.customizeButtonText}>Customize</Text></TouchableOpacity>)}
    </>
    );
  };

  const renderEventsTab = () => {
    const logEntries = [...gameState.gameLog].filter(entry => entry.characterId === character.id).reverse();
    return ( <View style={{paddingTop: 8}}>{logEntries.length > 0 ? (logEntries.map((entry, index) => (<LogEntry key={entry.id || `${entry.year}-${index}`} entry={entry} lang={gameState.lang} familyMembers={gameState.familyMembers} />))) : (<Text style={styles.emptyListText}>Chưa có sự kiện nào cho nhân vật này.</Text>)}</View>);
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
  avatarContainer: { backgroundColor: '#e0f2fe', borderColor: '#f59e0b', borderRadius: 16, borderWidth: 4, height: responsiveSize(90), overflow: 'hidden', width: responsiveSize(90), },
  basicInfo: { flex: 1, },
  bold: { color: '#1e293b', fontWeight: 'bold', },
  characterName: { color: '#1e293b', fontSize: responsiveFontSize(20), fontWeight: '900', },
  closeButton: { padding: responsiveSize(4), },
  container: { flex: 1, flexDirection: 'column', minHeight: 1, },
  contentContainer: { flex: 1, },
  customizeButton: { alignItems: 'center', backgroundColor: '#fecaca', borderBottomColor: '#f87171', borderBottomWidth: 4, borderRadius: 12, marginBottom: responsiveSize(10), marginTop: responsiveSize(20), paddingVertical: responsiveSize(14), },
  customizeButtonText: { color: '#b91c1c', fontSize: responsiveFontSize(16), fontWeight: 'bold', },
  detailList: { gap: responsiveSize(6), marginBottom: responsiveSize(16), },
  detailText: { color: '#334155', fontSize: responsiveFontSize(15), },
  emptyListText: { color: '#64748b', fontSize: responsiveFontSize(14), fontStyle: 'italic', },
  eventItem: { color: '#475569', fontSize: responsiveFontSize(14), marginBottom: responsiveSize(2), marginLeft: responsiveSize(8), },
  eventsPreviewSection: { marginBottom: responsiveSize(16), },
  header: { alignItems: 'center', flexDirection: 'row', height: responsiveSize(30), justifyContent: 'space-between', marginBottom: responsiveSize(16), },
  infoSection: { alignItems: 'center', flexDirection: 'row', gap: responsiveSize(16), marginBottom: responsiveSize(16), },
  infoText: { color: '#475569', fontSize: responsiveFontSize(14), marginBottom: responsiveSize(4), },
  scrollContentContainer: { flexGrow: 1, },
  sectionTitle: { color: '#1e293b', fontSize: responsiveFontSize(15), fontWeight: 'bold', marginBottom: responsiveSize(6), },
  statBar: { borderRadius: 6, height: '100%', },
  statBarContainer: { backgroundColor: '#e2e8f0', borderRadius: 6, flex: 1, height: responsiveSize(12), overflow: 'hidden', },
  statLabel: { color: '#475569', fontSize: responsiveFontSize(13), marginLeft: responsiveSize(8), width: responsiveSize(75), },
  statRow: { alignItems: 'center', flexDirection: 'row', },
  statValue: { color: '#334155', fontSize: responsiveFontSize(14), fontWeight: '600', marginLeft: responsiveSize(8), textAlign: 'right', width: responsiveSize(35), },
  statsContainer: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 12, borderWidth: 1, gap: responsiveSize(12), marginTop: responsiveSize(8), padding: responsiveSize(12), },
  tab: { alignItems: 'center', borderRadius: 6, flex: 1, justifyContent: 'center', paddingVertical: responsiveSize(8), },
  tabContainer: { backgroundColor: '#e2e8f0', borderRadius: 8, flexDirection: 'row', marginBottom: responsiveSize(16), padding: responsiveSize(4), },
  tabText: { color: '#64748b', fontSize: responsiveFontSize(14), fontWeight: 'bold', },
});
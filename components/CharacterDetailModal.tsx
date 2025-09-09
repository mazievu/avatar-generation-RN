// src/components/CharacterDetailModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, TouchableOpacity, Dimensions } from 'react-native';


import { ComicPanelModal } from './ComicPanelModal';
import type { Character, GameState, Language, Manifest, Club } from '../core/types';
import { ImageSourcePropType } from 'react-native';
import { t } from '../core/localization';

// Import các component con và icons
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { StatBar } from './StatBar'; 
import { GameLog } from './GameLog'; 
import { CloseIcon, IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons'; // Import tất cả icon cần thiết

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

  if (!character) {
    return null;
  }

  // ---- RENDER FUNCTIONS CHO TỪNG TAB ----
  const renderDetailTab = () => (
    <>
      {/* Phần thông tin cơ bản */}
      <View style={styles.infoSection}>
        <View style={styles.avatarContainer}>
          <AgeAwareAvatarPreview character={character} size={{ width: responsiveSize(128), height: responsiveSize(128) }} manifest={manifest} images={images} />
        </View>
        <View style={styles.basicInfo}>
          <Text style={styles.infoText}>{`Giai đoạn: ${character.phase} | Trạng thái: ${character.status}`}</Text>
          <Text style={styles.infoText}>{character.isAlive ? `Tuổi: ${character.age}` : `Mất lúc: ${character.age} tuổi`}</Text>
          <Text style={styles.infoText}>{`Quan hệ: ${character.relationshipStatus}`}</Text>
        </View>
      </View>

      {/* Các thông tin chi tiết */}
      <View style={styles.detailList}>
        <Text style={styles.detailText}><Text style={styles.bold}>Học vấn:</Text> {character.education}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Sự nghiệp:</Text> {character.careerTrack ? t(character.careerTrack, lang) : 'N/A'}</Text>
      </View>

      {/* Danh sách Câu lạc bộ */}
      <Text style={styles.sectionTitle}>Câu Lạc Bộ</Text>
      <FlatList
        data={character.currentClubs}
        keyExtractor={(item) => item} // item is the club ID string
        renderItem={({ item: clubId }) => {
          const club = clubs.find(c => c.id === clubId);
          return club ? <Text style={styles.listItem}>• {t(club.nameKey, lang)}</Text> : null;
        }}
        ListEmptyComponent={<Text style={styles.emptyListText}>Chưa tham gia câu lạc bộ nào.</Text>}
      />

      {/* Các thanh chỉ số */}
      {character.isAlive && (
        <View style={styles.statsContainer}>
          <StatBar Icon={IqIcon} label="IQ" value={character.stats.iq} max={200} color="#3b82f6" />
          <StatBar Icon={HappinessIcon} label="Hạnh phúc" value={character.stats.happiness} max={100} color="#f59e0b" />
          <StatBar Icon={EqIcon} label="EQ" value={character.stats.eq} max={100} color="#8b5cf6" />
          <StatBar Icon={HealthIcon} label="Sức khỏe" value={character.stats.health} max={100} color="#ef4444" />
          {character.age >= 18 && (
            <StatBar Icon={SkillIcon} label="Kỹ năng" value={character.stats.skill} max={100} color="#22c55e" />
          )}
        </View>
      )}

      {/* Nút Tùy chỉnh */}
      {!character.staticAvatarUrl && (
        <TouchableOpacity style={styles.customizeButton} onPress={() => onCustomize(character.id)}>
          <Text style={styles.customizeButtonText}>Tùy Chỉnh</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderEventsTab = () => (
    <GameLog 
        log={gameState.gameLog.filter(entry => entry.characterId === character.id)}
        familyMembers={gameState.familyMembers}
        lang={gameState.lang}
    />
  );
  
  // ---- RENDER CHÍNH CỦA MODAL ----
  return (
    <ComicPanelModal visible={!!character} onClose={onClose} rotate="3deg">
      <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.characterName}>{character.name} (G{character.generation})</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <CloseIcon width={32} height={32} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.tabContainer}>
            <Pressable 
              style={[styles.tab, activeTab === 'details' && styles.activeTab]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Chi Tiết</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'events' && styles.activeTab]}
              onPress={() => setActiveTab('events')}
            >
              <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Sự Kiện</Text>
            </Pressable>
          </View>
          
          {activeTab === 'details' ? renderDetailTab() : renderEventsTab()}
      </ScrollView>
    </ComicPanelModal>
  );
};

// ---- STYLESHEET ----
const styles = StyleSheet.create({
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSize(8),
  },
  characterName: {
    fontSize: responsiveFontSize(28),
    fontWeight: '900',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: responsiveSize(4), // Tăng vùng có thể nhấn
  },
  
  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    paddingVertical: responsiveSize(12),
    paddingHorizontal: responsiveSize(4),
    marginRight: responsiveSize(20),
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  
  // --- Content ---
  infoSection: {
    flexDirection: 'row',
    gap: responsiveSize(16),
    alignItems: 'center',
    marginBottom: responsiveSize(16),
  },
  avatarContainer: {
    width: responsiveSize(128),
    height: responsiveSize(128),
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#f59e0b',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  basicInfo: {
    flex: 1,
    gap: responsiveSize(6),
  },
  infoText: {
    fontSize: responsiveFontSize(14),
    color: '#475569',
  },
  detailList: {
    gap: responsiveSize(8),
    marginBottom: responsiveSize(16),
  },
  detailText: {
    fontSize: responsiveFontSize(14),
    color: '#334155',
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: responsiveSize(12),
    marginBottom: responsiveSize(8),
  },
  listItem: {
    fontSize: responsiveFontSize(14),
    color: '#334155',
    marginLeft: responsiveSize(8),
    marginBottom: responsiveSize(4),
  },
  emptyListText: {
    fontSize: responsiveFontSize(14),
    color: '#64748b',
    fontStyle: 'italic',
    marginLeft: responsiveSize(8),
  },
  statsContainer: {
    marginTop: responsiveSize(16),
    padding: responsiveSize(16),
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bold: {
    fontWeight: 'bold',
  },

  // --- Button ---
  customizeButton: {
    marginTop: responsiveSize(24),
    marginBottom: responsiveSize(16),
    backgroundColor: '#fda4af',
    borderRadius: 12,
    paddingVertical: responsiveSize(14),
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#f472b6',
  },
  customizeButtonText: {
    fontWeight: '800',
    color: '#334155',
    fontSize: responsiveFontSize(16),
  },
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { ComicPanelModal } from './ComicPanelModal';
import { GameState, Language } from '../core/types';
import { UNLOCKABLE_FEATURES, UnlockableFeature } from '../core/constants';
import { t } from '../core/localization';
import { colors } from './designSystem';
import { CloseIcon } from './icons';

interface UnlockProgressItemProps {
  feature: UnlockableFeature;
  gameState: GameState;
  lang: Language;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
  </View>
);

const UnlockProgressItem: React.FC<UnlockProgressItemProps> = ({ feature, gameState, lang }) => {
  const isUnlocked = gameState.unlockedFeatures.includes(feature.id);
  const progress = Math.min(1, gameState.totalChildrenBorn / feature.childrenRequired);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.featureName}>{t(feature.nameKey, lang)}</Text>
        {isUnlocked ? (
          <Text style={styles.unlockedText}>✓ {t('unlocked', lang)}</Text>
        ) : (
          <Text style={styles.progressText}>{`${gameState.totalChildrenBorn} / ${feature.childrenRequired}`}</Text>
        )}
      </View>
      <Text style={styles.featureDescription}>{t(feature.descriptionKey, lang)}</Text>
      {!isUnlocked && <ProgressBar progress={progress} />}
    </View>
  );
};

interface UnlocksModalProps {
  isVisible: boolean;
  onClose: () => void;
  gameState: GameState;
  lang: Language;
}

export const UnlocksModal: React.FC<UnlocksModalProps> = ({ isVisible, onClose, gameState, lang }) => {
  return (
    <ComicPanelModal
      visible={isVisible}
      onClose={onClose}
      closeButtonComponent={
        <Pressable onPress={onClose} style={styles.closeButton}>
          <CloseIcon width={28} height={20} color="#EF4444" />
        </Pressable>
      }
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t('unlocks_modal_title', lang)}</Text>
        <FlatList
          data={UNLOCKABLE_FEATURES}
          renderItem={({ item }) => <UnlockProgressItem feature={item} gameState={gameState} lang={lang} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ComicPanelModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    // Removed flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  itemContainer: {
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    height: 120,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  unlockedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.neutral200,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
});

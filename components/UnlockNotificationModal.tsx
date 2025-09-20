import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';
import { UNLOCKABLE_FEATURES } from '../core/constants';
import { colors } from './designSystem';
import { CloseIcon } from './icons';

interface UnlockNotificationModalProps {
  newlyUnlockedFeatureId: string | null;
  onAcknowledge: () => void;
  lang: string;
}

export const UnlockNotificationModal: React.FC<UnlockNotificationModalProps> = ({
  newlyUnlockedFeatureId,
  onAcknowledge,
  lang,
}) => {
  if (!newlyUnlockedFeatureId) {
    return null;
  }

  const feature = UNLOCKABLE_FEATURES.find(f => f.id === newlyUnlockedFeatureId);

  if (!feature) {
    return null;
  }

  return (
    <ComicPanelModal
      visible={true} // Always visible when newlyUnlockedFeatureId is set
      onClose={onAcknowledge}
      closeButtonComponent={
        <Pressable onPress={onAcknowledge} style={styles.closeButton}>
          <CloseIcon width={28} height={20} color="#EF4444" />
        </Pressable>
      }
    >
      <View style={styles.container}>
        <Text style={styles.title}>🎉 {t('unlock_notification_title', lang)} 🏆</Text>
        <Text style={styles.bodyText}>
          {t('unlock_notification_body', lang, { featureName: t(feature.nameKey, lang) })}
        </Text>
        <Pressable style={styles.button} onPress={onAcknowledge}>
          <Text style={styles.buttonText}>{t('unlock_notification_button', lang)}</Text>
        </Pressable>
      </View>
    </ComicPanelModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';

import type { Club, Language, Character, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { soundManager } from '../services';

interface ClubChoiceModalProps {
  character: Character;
  clubs: Club[];
  onSelect: (clubId: string) => void;
  onSkip: () => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  onOpenCharacterDetails: (character: Character) => void;
}

export const ClubChoiceModal: React.FC<ClubChoiceModalProps> = ({ character, clubs, onSelect, onSkip, lang, manifest, images, onOpenCharacterDetails }) => {
  return (
    <ComicPanelModal 
      visible={true}
      onClose={() => {}} // onClose should be passed from parent
      rotate="-1deg"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { soundManager.play('click'); onOpenCharacterDetails(character); }} style={styles.avatarContainer}>
          <AgeAwareAvatarPreview
            character={character}
            manifest={manifest}
            images={images}
            size={{ width: 80, height: 80 }}
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{t('modal_club_choice_title', lang)}</Text>
          <Text style={styles.description}>{t('modal_club_choice_desc', lang, { name: character.name })}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.choicesContainer} showsVerticalScrollIndicator={false}>
        {clubs.map((club) => (
          <TouchableOpacity 
            key={club.id} 
            onPress={() => { soundManager.play('click'); onSelect(club.id); }} 
            style={styles.choiceButton}
          >
            <Text style={styles.choiceButtonText}>
              {t(club.nameKey, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => { soundManager.play('click'); onSkip(); }} style={[styles.button, styles.buttonSlate]}>
        <Text style={styles.buttonText}>
          {t('skip_clubs', lang)}
        </Text>
      </TouchableOpacity>
    </ComicPanelModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  description: {
    color: '#475569',
    fontSize: 16,
  },
  choicesContainer: {
    maxHeight: 300, 
    marginBottom: 16,
  },
  choiceButton: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 4,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  choiceButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  buttonSlate: {
    backgroundColor: '#64748b',
    borderBottomWidth: 4,
    borderColor: '#475569',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

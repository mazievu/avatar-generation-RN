import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';

import type { SchoolOption, Language, Stats, Character, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { t } from '../core/localization';
import { colors } from './designSystem';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { soundManager } from '../services';

interface SchoolChoiceModalProps {
    character: Character;
    schoolOptions: SchoolOption[];
    onSelect: (option: SchoolOption) => void;
    currentFunds: number;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
    onOpenCharacterDetails: (character: Character) => void;
}

export const SchoolChoiceModal: React.FC<SchoolChoiceModalProps> = ({ schoolOptions, onSelect, currentFunds, lang, character, manifest, images, onOpenCharacterDetails }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="2deg">
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
            <Text style={styles.title}>{t('modal_school_title', lang)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{t('modal_school_desc', lang, { name: character.name })}</Text>
      
      {schoolOptions.map((option, index) => (
          <ChoiceButton key={index} onClick={() => onSelect(option)} disabled={currentFunds < option.cost}>
              <View style={styles.choiceContent}>
                  <Text style={styles.choiceName}>{t(option.nameKey, lang)}</Text>
                  <Text style={[styles.choiceCost, currentFunds >= option.cost ? styles.costAffordable : styles.costUnaffordable]}>(-${option.cost.toLocaleString()})</Text>
              </View>
              <Text style={styles.choiceEffects}>
                  {Object.entries(option.effects).map(([stat, val]) => `${t(`stat_${stat}` as keyof Stats, lang)} ${val > 0 ? `+${val}` : val}`).join(', ')}
              </Text>
          </ChoiceButton>
      ))}
    </ComicPanelModal>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        color: '#1e2b3b',
        fontSize: 24,
        fontWeight: '900',
    },
    description: {
        color: '#475569',
        fontSize: 16,
        marginBottom: 24,
    },
    choiceContent: {
        alignItems: 'baseline',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    choiceCost: {
        fontSize: 14,
    },
    choiceEffects: {
        color: '#475569', // slate-600
        fontSize: 12,
        marginTop: 4,
    },
    choiceName: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    costAffordable: {
        color: '#64748b', // slate-500
    },
    costUnaffordable: {
        color: '#ef4444', // red-500
    },
});

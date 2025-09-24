import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


import type { SchoolOption, Language, Stats, Character } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { t } from '../core/localization';
import { colors } from './designSystem';




interface LocalizedProps {
    lang: Language;
}

interface SchoolChoiceModalProps extends LocalizedProps {
    character: Character;
    schoolOptions: SchoolOption[];
    onSelect: (option: SchoolOption) => void;
    currentFunds: number;
}
export const SchoolChoiceModal: React.FC<SchoolChoiceModalProps> = ({ schoolOptions, onSelect, currentFunds, lang, character }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="2deg">
      <Text style={schoolChoiceModalStyles.title}>{t('modal_school_title', lang)}</Text>
      <Text style={schoolChoiceModalStyles.description}>{t('modal_school_desc', lang, { name: character.name })}</Text>
        {schoolOptions.map((option, index) => (
            <ChoiceButton key={index} onClick={() => onSelect(option)} disabled={currentFunds < option.cost}>
                <View style={schoolChoiceModalStyles.choiceContent}>
                    <Text style={schoolChoiceModalStyles.choiceName}>{t(option.nameKey, lang)}</Text>
                    <Text style={[schoolChoiceModalStyles.choiceCost, currentFunds >= option.cost ? schoolChoiceModalStyles.costAffordable : schoolChoiceModalStyles.costUnaffordable]}>(-${option.cost.toLocaleString()})</Text>
                </View>
                <Text style={schoolChoiceModalStyles.choiceEffects}>
                    {Object.entries(option.effects).map(([stat, val]) => `${t(`stat_${stat}` as keyof Stats, lang)} ${val > 0 ? `+${val}` : val}`).join(', ')}
                </Text>
            </ChoiceButton>
        ))}
    </ComicPanelModal>
);

const schoolChoiceModalStyles = StyleSheet.create({
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
    description: {
    color: '#475569',
    fontSize: 16,
    marginBottom: 24,
  },
    title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
});
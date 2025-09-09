import * as React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';


import type { Character, SchoolOption, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
    lang: Language;
}

interface SchoolChoiceModalProps extends LocalizedProps {
    character: Character;
    schoolOptions: SchoolOption[];
    onSelect: (option: SchoolOption) => void;
    currentFunds: number;
}
export const SchoolChoiceModal: React.FC<SchoolChoiceModalProps> = ({ character, schoolOptions, onSelect, currentFunds, lang }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="2deg">
      <Text style={schoolChoiceModalStyles.title}>{t('modal_school_title', lang)}</Text>
      <Text style={schoolChoiceModalStyles.description}>{t('modal_school_desc', lang)}</Text>
        {schoolOptions.map((option, index) => (
            <ChoiceButton key={index} onClick={() => onSelect(option)} disabled={currentFunds < option.cost}>
                <View style={schoolChoiceModalStyles.choiceContent}>
                    <Text style={schoolChoiceModalStyles.choiceName}>{t(option.nameKey, lang)}</Text>
                    <Text style={[schoolChoiceModalStyles.choiceCost, currentFunds >= option.cost ? schoolChoiceModalStyles.costAffordable : schoolChoiceModalStyles.costUnaffordable]}>(-${option.cost.toLocaleString()})</Text>
                </View>
                <Text style={schoolChoiceModalStyles.choiceEffects}>
                    {Object.entries(option.effects).map(([stat, val]) => `${t(`stat_${stat}` as any, lang)} ${val > 0 ? `+${val}` : val}`).join(', ')}
                </Text>
            </ChoiceButton>
        ))}
    </ComicPanelModal>
);

const schoolChoiceModalStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  choicesContainer: {
    gap: 12,
  },
    choiceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    choiceName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    choiceCost: {
        fontSize: 14,
    },
    costAffordable: {
        color: '#64748b', // slate-500
    },
    costUnaffordable: {
        color: '#ef4444', // red-500
    },
    choiceEffects: {
        fontSize: 12,
        color: '#475569', // slate-600
        marginTop: 4,
    },
});

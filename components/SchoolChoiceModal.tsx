import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Character, SchoolOption, Language } from '../core/types';
import { ModalBase } from './ModalBase';
import { ChoiceButton } from './ChoiceButton';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';

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
    <ModalBase titleKey="modal_school_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_school_desc" lang={lang}>
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
    </ModalBase>
);

const schoolChoiceModalStyles = StyleSheet.create({
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

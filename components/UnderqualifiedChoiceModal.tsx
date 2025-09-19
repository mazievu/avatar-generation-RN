import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


import type { Character, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER } from '../core/constants';
import { t } from '../core/localization';




interface LocalizedProps {
    lang: Language;
}

interface UnderqualifiedChoiceModalProps extends LocalizedProps {
    character: Character;
    careerTrackKey: string;
    onSelect: (isTrainee: boolean) => void;
}
export const UnderqualifiedChoiceModal: React.FC<UnderqualifiedChoiceModalProps> = ({ character, careerTrackKey, onSelect, lang }) => {
    const track = CAREER_LADDER[careerTrackKey];
    if (!track) return null;
    
    return (
        <ComicPanelModal 
            visible={true}
            onClose={() => {}} // No explicit close button, so provide a dummy
            rotate="0deg"
        >
            <Text style={underqualifiedChoiceModalStyles.title}>{t('modal_underqualified_title', lang)}</Text>
            <Text style={underqualifiedChoiceModalStyles.description}>{t('modal_underqualified_desc', lang, { name: character.name, careerName: t(track.nameKey, lang) })}</Text>
            <ChoiceButton onClick={() => onSelect(true)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_trainee', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_trainee_desc', lang)}</Text>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_penalized', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_penalized_desc', lang)}</Text>
            </ChoiceButton>
        </ComicPanelModal>
    );
}

const underqualifiedChoiceModalStyles = StyleSheet.create({
    choiceDescription: {
        color: '#475569', // slate-600
        fontSize: 12,
        marginTop: 4,
    },
    choiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
});
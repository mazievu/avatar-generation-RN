import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { Character, Language } from '../core/types';
import { ModalBase } from './ModalBase';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER } from '../core/constants';
import { getCharacterDisplayName } from '../core/utils';
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
        <ModalBase 
            titleKey="modal_underqualified_title" 
            characterName={getCharacterDisplayName(character, lang)} 
            descriptionKey="modal_underqualified_desc"
            descriptionReplacements={{ careerName: t(track.nameKey, lang) }}
            lang={lang}
        >
            <ChoiceButton onClick={() => onSelect(true)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_trainee', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_trainee_desc', lang)}</Text>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_penalized', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_penalized_desc', lang)}</Text>
            </ChoiceButton>
        </ModalBase>
    );
}

const underqualifiedChoiceModalStyles = StyleSheet.create({
    choiceTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    choiceDescription: {
        fontSize: 12,
        color: '#475569', // slate-600
        marginTop: 4,
    },
});

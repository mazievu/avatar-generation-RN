import * as React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';


import type { Character, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER } from '../core/constants';
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
            <Text style={underqualifiedChoiceModalStyles.description}>{t('modal_underqualified_desc', lang, { careerName: t(track.nameKey, lang) })}</Text>
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
        fontSize: 12,
        color: '#475569', // slate-600
        marginTop: 4,
    },
    choiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: '#475569', // slate-600
        marginBottom: 24,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
});

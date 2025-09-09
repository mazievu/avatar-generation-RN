import * as React from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


import type { Character, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
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

interface UniversityChoiceModalProps extends LocalizedProps {
    character: Character;
    onSelect: (goToUniversity: boolean) => void;
}
export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ character, onSelect, lang }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="0deg">
        <Text style={universityChoiceModalStyles.title}>{t('modal_university_title', lang)}</Text>
        <Text style={universityChoiceModalStyles.description}>{t('modal_university_desc', lang)}</Text>
        <TouchableOpacity onPress={() => onSelect(true)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonBlue]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_yes', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelect(false)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonSlate]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_no', lang)}</Text>
        </TouchableOpacity>
    </ComicPanelModal>
);

const universityChoiceModalStyles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#475569', // slate-600
        marginBottom: 24,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 4,
    },
    buttonBlue: {
        backgroundColor: '#60a5fa', // blue-400
        borderColor: '#3b82f6', // blue-500
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

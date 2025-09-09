import * as React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Character, Language } from '../core/types';
import { ModalBase } from './ModalBase';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';

interface LocalizedProps {
    lang: Language;
}

interface UniversityChoiceModalProps extends LocalizedProps {
    character: Character;
    onSelect: (goToUniversity: boolean) => void;
}
export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ character, onSelect, lang }) => (
    <ModalBase titleKey="modal_university_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_university_desc" lang={lang}>
        <TouchableOpacity onPress={() => onSelect(true)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonBlue]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_yes', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelect(false)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonSlate]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_no', lang)}</Text>
        </TouchableOpacity>
    </ModalBase>
);

const universityChoiceModalStyles = StyleSheet.create({
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

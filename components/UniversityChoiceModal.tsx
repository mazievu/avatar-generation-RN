import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


import type { Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';




interface LocalizedProps {
    lang: Language;
}

interface UniversityChoiceModalProps extends LocalizedProps {
    onSelect: (goToUniversity: boolean) => void;
}
export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ onSelect, lang }) => (
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
    button: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
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
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';



import type { Character, UniversityMajor, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';
import { ModalBase } from './ModalBase';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
    lang: Language;
}

interface UniversityMajorChoiceModalProps extends LocalizedProps {
    character: Character;
    majors: UniversityMajor[];
    onSelect: (major: UniversityMajor) => void;
    currentFunds: number;
    onAbandon: () => void;
}
export const UniversityMajorChoiceModal: React.FC<UniversityMajorChoiceModalProps> = ({ character, majors, onSelect, currentFunds, lang, onAbandon }) => {
    const allUnaffordable = majors.every(major => currentFunds < major.cost);

    return (
        <ModalBase titleKey="modal_major_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_major_desc" lang={lang}>
            {majors.map((major, index) => (
                <ChoiceButton key={index} onClick={() => onSelect(major)} disabled={currentFunds < major.cost}>
                    <View style={universityMajorChoiceModalStyles.choiceContent}>
                        <Text style={universityMajorChoiceModalStyles.choiceName}>{t(major.nameKey, lang)}</Text>
                        <Text style={[universityMajorChoiceModalStyles.choiceCost, currentFunds >= major.cost ? universityMajorChoiceModalStyles.costAffordable : universityMajorChoiceModalStyles.costUnaffordable]}>(-${major.cost.toLocaleString()})</Text>
                    </View>
                    <Text style={universityMajorChoiceModalStyles.choiceDescription}>{t(major.descriptionKey, lang)}</Text>
                </ChoiceButton>
            ))}
            {allUnaffordable && (
                <View style={universityMajorChoiceModalStyles.unaffordableSection}>
                    <Text style={universityMajorChoiceModalStyles.unaffordableText}>{t('modal_major_no_money', lang)}</Text>
                    <TouchableOpacity onPress={onAbandon} style={[universityMajorChoiceModalStyles.button, universityMajorChoiceModalStyles.buttonSlate]}>
                        <Text style={universityMajorChoiceModalStyles.buttonText}>
                            {t('university_choice_no', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ModalBase>
    );
};

const universityMajorChoiceModalStyles = StyleSheet.create({
    choiceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    choiceName: {
        fontWeight: 'bold',
        fontSize: responsiveFontSize(16),
    },
    choiceCost: {
        fontSize: responsiveFontSize(14),
    },
    costAffordable: {
        color: '#64748b', // slate-500
    },
    costUnaffordable: {
        color: '#ef4444', // red-500
    },
    choiceDescription: {
        fontSize: responsiveFontSize(12),
        color: '#475569', // slate-600
        marginTop: responsiveSize(4),
    },
    unaffordableSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        alignItems: 'center',
    },
    unaffordableText: {
        color: '#ef4444', // red-500
        marginBottom: responsiveSize(8),
    },
    button: {
        paddingVertical: responsiveSize(12),
        paddingHorizontal: responsiveSize(24),
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: responsiveSize(12),
        borderBottomWidth: 4,
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: responsiveFontSize(16),
    },
});
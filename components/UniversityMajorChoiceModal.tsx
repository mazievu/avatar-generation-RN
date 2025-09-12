import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

import type { Character, UniversityMajor, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';
import { typography, colors, spacing } from './designSystem';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

// Hàm này nên được chuyển ra một tệp tiện ích chung
const responsiveFontSize = (size: number, userScale: number = 1) => Math.round(size * scale * userScale);

interface LocalizedProps {
    lang: Language;
    userFontScale?: number; // Prop để nhận tỷ lệ phông chữ của người dùng
}

interface UniversityMajorChoiceModalProps extends LocalizedProps {
    character: Character;
    majors: UniversityMajor[];
    onSelect: (major: UniversityMajor) => void;
    currentFunds: number;
    onAbandon: () => void;
}
export const UniversityMajorChoiceModal: React.FC<UniversityMajorChoiceModalProps> = ({ character, majors, onSelect, currentFunds, lang, onAbandon, userFontScale = 1 }) => {
    const allUnaffordable = majors.every(major => currentFunds < major.cost);

    // Sử dụng onAbandon khi người dùng nhấn ra ngoài modal để hủy
    return (
        <ComicPanelModal visible={true} onClose={onAbandon} rotate="-1.5deg">
            <Text style={[universityMajorChoiceModalStyles.title, { fontSize: responsiveFontSize(typography.h2.fontSize, userFontScale) }]}>{t('modal_major_title', lang)}</Text>
            <Text style={[universityMajorChoiceModalStyles.characterNameLabel, { fontSize: responsiveFontSize(14, userFontScale) }]}>
                {t('for_char_label', lang)}: <Text style={universityMajorChoiceModalStyles.characterName}>{getCharacterDisplayName(character, lang)}</Text>
            </Text>
            <Text style={[universityMajorChoiceModalStyles.description, { fontSize: responsiveFontSize(typography.body.fontSize, userFontScale) }]}>{t('modal_major_desc', lang, { name: getCharacterDisplayName(character, lang) })}</Text>
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
                    <Text style={[universityMajorChoiceModalStyles.unaffordableText, { fontSize: responsiveFontSize(14, userFontScale) }]}>{t('modal_major_no_money', lang)}</Text>
                    <TouchableOpacity onPress={onAbandon} style={[universityMajorChoiceModalStyles.button, universityMajorChoiceModalStyles.buttonSlate]}>
                        <Text style={[universityMajorChoiceModalStyles.buttonText, { fontSize: responsiveFontSize(typography.bodyBold.fontSize, userFontScale) }]}>
                            {t('university_choice_no', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ComicPanelModal>
    );
};

const universityMajorChoiceModalStyles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: spacing.sm,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    buttonSlate: {
        backgroundColor: colors.neutral600,
        borderColor: colors.neutral700,
    },
    buttonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    characterName: {
        fontWeight: 'bold',
    },
    characterNameLabel: {
        ...typography.body,
        fontSize: 14, // Giữ kích thước nhỏ hơn
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    choiceContent: {
        alignItems: 'baseline',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    choiceCost: {
        ...typography.body,
        fontSize: 14,
    },
    choiceDescription: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    choiceName: {
        ...typography.bodyBold,
    },
    costAffordable: {
        color: colors.neutral600,
    },
    costUnaffordable: {
        color: colors.error,
    },
    description: {
        ...typography.body,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    unaffordableSection: {
        alignItems: 'center',
        borderColor: colors.neutral200,
        borderTopWidth: 1,
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
    },
    unaffordableText: {
        color: colors.error,
        marginBottom: spacing.sm,
    },
});
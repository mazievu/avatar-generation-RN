import * as React from 'react';
// *** THAY ĐỔI 1: Thêm ImageSourcePropType ***
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageSourcePropType } from 'react-native';

// *** THAY ĐỔI 2: Thêm các type và component cần thiết ***
import type { Character, UniversityMajor, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';
import { typography, colors, spacing } from './designSystem';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number, userScale: number = 1) => Math.round(size * scale * userScale);

// *** THAY ĐỔI 3: Cập nhật interface để nhận props mới ***
interface UniversityMajorChoiceModalProps {
    character: Character;
    majors: UniversityMajor[];
    onSelect: (major: UniversityMajor) => void;
    currentFunds: number;
    onAbandon: () => void;
    lang: Language;
    userFontScale?: number;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
}

// *** THAY ĐỔI 4: Lấy props mới ***
export const UniversityMajorChoiceModal: React.FC<UniversityMajorChoiceModalProps> = ({ character, majors, onSelect, currentFunds, lang, onAbandon, userFontScale = 1, manifest, images }) => {
    const allUnaffordable = majors.every(major => currentFunds < major.cost);

    return (
        <ComicPanelModal visible={true} onClose={onAbandon} rotate="0deg">
            {/* *** THAY ĐỔI 5: Tạo bố cục header với avatar *** */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <AgeAwareAvatarPreview
                        character={character}
                        manifest={manifest}
                        images={images}
                        size={{ width: 80, height: 80 }}
                    />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={[styles.title, { fontSize: responsiveFontSize(typography.h2.fontSize, userFontScale) }]}>{t('modal_major_title', lang)}</Text>
                </View>
            </View>
            
            {/* Bỏ dòng text "For character" cũ, di chuyển mô tả ra ngoài header */}
            <Text style={[styles.description, { fontSize: responsiveFontSize(typography.body.fontSize, userFontScale) }]}>{t('modal_major_desc', lang, { name: getCharacterDisplayName(character, lang) })}</Text>
            
            {/* Phần còn lại không thay đổi */}
            {majors.map((major, index) => (
                <ChoiceButton key={index} onClick={() => onSelect(major)} disabled={currentFunds < major.cost}>
                    <View style={styles.choiceContent}>
                        <Text style={styles.choiceName}>{t(major.nameKey, lang)}</Text>
                        <Text style={[styles.choiceCost, currentFunds >= major.cost ? styles.costAffordable : styles.costUnaffordable]}>(-${major.cost.toLocaleString()})</Text>
                    </View>
                    <Text style={styles.choiceDescription}>{t(major.descriptionKey, lang)}</Text>
                </ChoiceButton>
            ))}
            {allUnaffordable && (
                <View style={styles.unaffordableSection}>
                    <Text style={[styles.unaffordableText, { fontSize: responsiveFontSize(14, userFontScale) }]}>{t('modal_major_no_money', lang)}</Text>
                    <TouchableOpacity onPress={onAbandon} style={[styles.button, styles.buttonSlate]}>
                        <Text style={[styles.buttonText, { fontSize: responsiveFontSize(typography.bodyBold.fontSize, userFontScale) }]}>
                            {t('university_choice_no', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ComicPanelModal>
    );
};

// *** THAY ĐỔI 6: Bổ sung và điều chỉnh styles ***
const styles = StyleSheet.create({
    // Styles mới
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    // Styles cũ được điều chỉnh hoặc bỏ đi
    title: {
        ...typography.h2,
        // Bỏ margin và textAlign
    },
    description: {
        ...typography.body,
        marginBottom: spacing.lg,
    },
    // Bỏ các style không còn dùng đến
    // characterName: { ... },
    // characterNameLabel: { ... },
    
    // Các style còn lại
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
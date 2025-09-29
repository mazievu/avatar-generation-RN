import React from 'react';
// *** THAY ĐỔI 1: Thêm View và ImageSourcePropType ***
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';

// *** THAY ĐỔI 2: Thêm các type và component cần thiết ***
import type { Character, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// *** THAY ĐỔI 3: Cập nhật interface để nhận props mới ***
interface UniversityChoiceModalProps {
    character: Character;
    onSelect: (goToUniversity: boolean) => void;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
}

// *** THAY ĐỔI 4: Lấy props mới và sử dụng chúng ***
export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ character, onSelect, lang, manifest, images }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="0deg">
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
                <Text style={styles.title}>{t('modal_university_title', lang)}</Text>
            </View>
        </View>

        {/* Cá nhân hóa mô tả */}
        <Text style={styles.description}>{t('modal_university_desc', lang, { name: character.name })}</Text>

        {/* Các nút lựa chọn không thay đổi */}
        <TouchableOpacity onPress={() => onSelect(true)} style={[styles.button, styles.buttonBlue]}>
            <Text style={styles.buttonText}>{t('university_choice_yes', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelect(false)} style={[styles.button, styles.buttonSlate]}>
            <Text style={styles.buttonText}>{t('university_choice_no', lang)}</Text>
        </TouchableOpacity>
    </ComicPanelModal>
);

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
    // Styles cũ được điều chỉnh
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 24,
    },
    // Styles nút không thay đổi
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
});
import React from 'react';
// *** THAY ĐỔI 1: Thêm các import cần thiết ***
import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native';

// *** THAY ĐỔI 2: Thêm các type và component cần thiết ***
import type { Character, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER } from '../core/constants';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// *** THAY ĐỔI 3: Cập nhật interface để nhận manifest và images ***
interface UnderqualifiedChoiceModalProps {
    character: Character;
    careerTrackKey: string;
    onSelect: (isTrainee: boolean) => void;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
}

// *** THAY ĐỔI 4: Lấy manifest và images từ props ***
export const UnderqualifiedChoiceModal: React.FC<UnderqualifiedChoiceModalProps> = ({ character, careerTrackKey, onSelect, lang, manifest, images }) => {
    const track = CAREER_LADDER[careerTrackKey];
    if (!track) return null;
    
    return (
        <ComicPanelModal 
            visible={true}
            onClose={() => {}} // No explicit close button, so provide a dummy
            rotate="0deg"
        >
            {/* *** THAY ĐỔI 5: Tạo bố cục header mới với avatar *** */}
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
                    <Text style={styles.title}>{t('modal_underqualified_title', lang)}</Text>
                </View>
            </View>

            <Text style={styles.description}>{t('modal_underqualified_desc', lang, { name: character.name, careerName: t(track.nameKey, lang) })}</Text>
            
            {/* Phần lựa chọn không thay đổi */}
            <ChoiceButton onClick={() => onSelect(true)}>
                <Text style={styles.choiceTitle}>{t('underqualified_choice_trainee', lang)}</Text>
                <Text style={styles.choiceDescription}>{t('underqualified_choice_trainee_desc', lang)}</Text>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <Text style={styles.choiceTitle}>{t('underqualified_choice_penalized', lang)}</Text>
                <Text style={styles.choiceDescription}>{t('underqualified_choice_penalized_desc', lang)}</Text>
            </ChoiceButton>
        </ComicPanelModal>
    );
}

// *** THAY ĐỔI 6: Bổ sung và điều chỉnh styles ***
const styles = StyleSheet.create({
    // Style mới
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
    // Style cũ được điều chỉnh
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
        // Bỏ textAlign: 'center' và margin
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 24,
        // Bỏ textAlign: 'center'
    },
    choiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    choiceDescription: {
        color: '#475569', // slate-600
        fontSize: 12,
        marginTop: 4,
    },
});
import React from 'react';
// *** THAY ĐỔI 1: Thêm ImageSourcePropType để sử dụng trong props ***
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';

// *** THAY ĐỔI 2: Thêm các type và component cần thiết ***
import type { Club, Language, Character, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// *** THAY ĐỔI 3: Cập nhật interface để nhận manifest và images ***
interface ClubChoiceModalProps {
  character: Character;
  clubs: Club[];
  onSelect: (clubId: string) => void;
  onSkip: () => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
}

// *** THAY ĐỔI 4: Lấy manifest và images từ props ***
export const ClubChoiceModal: React.FC<ClubChoiceModalProps> = ({ character, clubs, onSelect, onSkip, lang, manifest, images }) => {
  return (
    <ComicPanelModal 
      visible={true}
      onClose={() => {}} // onClose should be passed from parent
      rotate="-1deg"
    >
      {/* *** THAY ĐỔI 5: Tạo bố cục header mới giống EventModal *** */}
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
          <Text style={styles.title}>{t('modal_club_choice_title', lang)}</Text>
          <Text style={styles.description}>{t('modal_club_choice_desc', lang, { name: character.name })}</Text>
        </View>
      </View>
      
      {/* Phần còn lại của modal không thay đổi */}
      <ScrollView style={styles.choicesContainer} showsVerticalScrollIndicator={false}>
        {clubs.map((club) => (
          <TouchableOpacity 
            key={club.id} 
            onPress={() => onSelect(club.id)} 
            style={styles.choiceButton}
          >
            <Text style={styles.choiceButtonText}>
              {t(club.nameKey, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={onSkip} style={[styles.button, styles.buttonSlate]}>
        <Text style={styles.buttonText}>
          {t('skip_clubs', lang)}
        </Text>
      </TouchableOpacity>
    </ComicPanelModal>
  );
};

// *** THAY ĐỔI 6: Bổ sung các style cần thiết cho header mới ***
const styles = StyleSheet.create({
  // Style mới cho header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  // Style cũ đã được điều chỉnh
  title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4, // Giảm margin bottom một chút
  },
  description: {
    color: '#475569',
    fontSize: 16,
    // Bỏ margin bottom ở đây vì đã có ở header
  },
  choicesContainer: {
    maxHeight: 300, 
    marginBottom: 16,
  },
  choiceButton: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 4,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  choiceButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  buttonSlate: {
    backgroundColor: '#64748b',
    borderBottomWidth: 4,
    borderColor: '#475569',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
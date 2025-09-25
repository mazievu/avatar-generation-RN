import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import type { Club, Language, Character } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';

interface ClubChoiceModalProps {
  character: Character;
  clubs: Club[];
  onSelect: (clubId: string) => void;
  onSkip: () => void;
  lang: Language;
}

export const ClubChoiceModal: React.FC<ClubChoiceModalProps> = ({ clubs, onSelect, onSkip, lang }) => {
  return (
    <ComicPanelModal 
      visible={true}
      onClose={() => {}} // onClose should be passed from parent
      rotate="-1deg"
    >
      <Text style={styles.title}>{t('modal_club_choice_title', lang)}</Text>
      <Text style={styles.description}>{t('modal_club_choice_desc', lang)}</Text>
      
      {/* Sử dụng ScrollView để chứa danh sách lựa chọn */}
      <ScrollView style={styles.choicesContainer} showsVerticalScrollIndicator={false}>
        {clubs.map((club) => (
          // ✨ THAY ĐỔI LỚN: Mỗi item giờ là một nút bấm duy nhất
          <TouchableOpacity 
            key={club.id} 
            onPress={() => onSelect(club.id)} 
            style={styles.choiceButton}
          >
            {/* Chỉ hiển thị tên câu lạc bộ */}
            <Text style={styles.choiceButtonText}>
              {t(club.nameKey, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nút Bỏ qua vẫn giữ nguyên */}
      <TouchableOpacity onPress={onSkip} style={[styles.button, styles.buttonSlate]}>
        <Text style={styles.buttonText}>
          {t('skip_clubs', lang)}
        </Text>
      </TouchableOpacity>
    </ComicPanelModal>
  );
};

// ✨ StyleSheet đã được thiết kế lại hoàn toàn cho layout mới
const styles = StyleSheet.create({
  title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  description: {
    color: '#475569',
    fontSize: 16,
    marginBottom: 16, // Giảm margin một chút
  },
  choicesContainer: {
    // Đặt chiều cao tối đa để ScrollView hoạt động khi có nhiều CLB
    // Con số này có thể được điều chỉnh cho phù hợp
    maxHeight: 300, 
    marginBottom: 16,
  },
  choiceButton: {
    backgroundColor: '#f1f5f9', // slate-100
    borderBottomWidth: 4,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12, // Khoảng cách giữa các nút
    alignItems: 'center',
  },
  choiceButtonText: {
    color: '#1e293b', // slate-800
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style chung cho nút Bỏ qua
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  buttonSlate: {
    backgroundColor: '#64748b', // slate-500
    borderBottomWidth: 4,
    borderColor: '#475569', // slate-600
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
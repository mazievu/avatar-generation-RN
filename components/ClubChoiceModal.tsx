import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';


import type { Character, Club, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface ClubChoiceModalProps {
  character: Character;
  clubs: Club[];
  onSelect: (clubId: string) => void;
  onSkip: () => void;
  lang: Language;
}

export const ClubChoiceModal: React.FC<ClubChoiceModalProps> = ({ character, clubs, onSelect, onSkip, lang }) => {
  return (
    <ComicPanelModal 
      visible={true}
      onClose={() => {}} // onClose should be passed from parent
      rotate="-1deg"
    >
      <Text style={clubChoiceModalStyles.title}>{t('modal_club_choice_title', lang)}</Text>
      <Text style={clubChoiceModalStyles.description}>{t('modal_club_choice_desc', lang)}</Text>
      <View style={clubChoiceModalStyles.gridContainer}>
        {clubs.map((club) => (
          <View key={club.id} style={clubChoiceModalStyles.clubItem}>
            <Text style={clubChoiceModalStyles.clubName}>{t(club.nameKey, lang)}</Text>
            <Text style={clubChoiceModalStyles.clubDescription}>{t(club.descriptionKey, lang)}</Text>
            <TouchableOpacity 
              onPress={() => onSelect(club.id)} 
              style={[clubChoiceModalStyles.button, clubChoiceModalStyles.buttonGreen]}
            >
              <Text style={clubChoiceModalStyles.buttonText}>
                {t('join_club', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onSkip} style={[clubChoiceModalStyles.button, clubChoiceModalStyles.buttonSlate]}>
        <Text style={clubChoiceModalStyles.buttonText}>
          {t('skip_clubs', lang)}
        </Text>
      </TouchableOpacity>
    </ComicPanelModal>
  );
};

const clubChoiceModalStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 16, // my-4
        gap: 16, // gap-4
    },
    clubItem: {
        borderWidth: 1,
        borderColor: '#e2e8f0', // Example border color
        padding: 16, // p-4
        borderRadius: 8, // rounded-lg
        backgroundColor: 'rgba(71, 85, 105, 0.5)', // bg-slate-700/50
        width: '48%', // Approximate for md:grid-cols-2 gap-4
        marginBottom: 16, // For gap between rows
    },
    clubName: {
        fontSize: 18, // text-lg
        fontWeight: 'bold',
        color: '#fcd34d', // text-yellow-300
    },
    clubDescription: {
        fontSize: 14, // text-sm
        color: '#cbd5e1', // text-slate-300
        fontStyle: 'italic',
        marginVertical: 4, // my-1
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8, // mt-2
        width: '100%',
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

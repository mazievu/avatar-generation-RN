import React, { useState } from 'react';
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
  button: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 8, // mt-2
        paddingHorizontal: 16,
        paddingVertical: 8,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    clubDescription: {
        color: '#cbd5e1', // text-slate-300
        fontSize: 14, // text-sm
        fontStyle: 'italic',
        marginVertical: 4, // my-1
    },
    clubItem: {
        backgroundColor: 'rgba(71, 85, 105, 0.5)', // bg-slate-700/50
        borderColor: '#e2e8f0', // Example border color
        borderRadius: 8, // rounded-lg
        borderWidth: 1,
        marginBottom: 16, // For gap between rows
        padding: 16, // p-4
        width: '48%', // Approximate for md:grid-cols-2 gap-4
    },
    clubName: {
        color: '#fcd34d', // text-yellow-300
        fontSize: 18, // text-lg
        fontWeight: 'bold',
    },
    description: {
    color: '#475569',
    fontSize: 16,
    marginBottom: 24,
  },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16, // gap-4
        justifyContent: 'space-between',
        marginVertical: 16, // my-4
    },
    title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
});
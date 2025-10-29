import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


import type { GameState, Character, Language, PurchasedAsset } from '../core/types';
import { ASSET_DEFINITIONS } from '../core/constants';
import { t } from '../core/localization';




interface LocalizedProps {
  lang: Language;
}

interface SummaryScreenProps extends LocalizedProps {
  familyMembers: Record<string, Character>;
  gameOverReason: string | null;
  totalMembers: number;
  highestEducation: string;
  highestCareer: string;
  familyFund: number;
  purchasedAssets: Record<string, PurchasedAsset>;
  currentDate: { day: number; year: number };
  onRestart: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = React.memo(({
  familyMembers,
  gameOverReason,
  totalMembers,
  highestEducation,
  highestCareer,
  familyFund,
  purchasedAssets,
  currentDate,
  onRestart,
  lang,
}) => {
  const livingMembers = Object.values(familyMembers).filter((m: Character) => m.isAlive).length;
  const deceasedMembers = Object.values(familyMembers).filter((m: Character) => !m.isAlive).length;
  const isVictory = gameOverReason === 'victory';
  
  let descriptionKey = 'summary_gameover_desc';
  if (isVictory) {
      descriptionKey = 'summary_victory_desc';
  } else if (gameOverReason === 'debt') {
      descriptionKey = 'summary_gameover_desc_debt';
  }

  return (
    <View style={summaryScreenStyles.container}>
      <View style={summaryScreenStyles.contentWrapper}>
        <View style={summaryScreenStyles.content}>
            <Text style={summaryScreenStyles.title}>{isVictory ? t('summary_victory_title', lang) : t('summary_gameover_title', lang)}</Text>
            <Text style={summaryScreenStyles.description}>
                {t(descriptionKey, lang)}
            </Text>
            
            <View style={summaryScreenStyles.statsContainer}>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_generations', lang)}:</Text> {isVictory ? '6' : Object.values(familyMembers).reduce((max, m: Character) => Math.max(max, m.generation), 0)}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_members', lang)}:</Text> {totalMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_living_members', lang)}:</Text> {livingMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_deceased_members', lang)}:</Text> {deceasedMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_education', lang)}:</Text> {highestEducation}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_career', lang)}:</Text> {highestCareer}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_final_funds', lang)}:</Text> ${familyFund.toLocaleString()}</Text>
               <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_asset_value', lang)}:</Text> ${Object.values(purchasedAssets).reduce((sum, a) => sum + (ASSET_DEFINITIONS[a.id]?.cost || 0), 0).toLocaleString()}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_ending_year', lang)}:</Text> {currentDate.year}</Text>
            </View>

            <TouchableOpacity onPress={onRestart} style={summaryScreenStyles.restartButton}>
              <Text style={summaryScreenStyles.restartButtonText}>
                {t('play_again_button', lang)}
              </Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const summaryScreenStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    content: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 3,
        maxWidth: 500,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    contentWrapper: {
        // This was a comic-panel-wrapper, might need specific styling if it had visual effects
        // For now, just a container
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    restartButton: {
        backgroundColor: '#60a5fa', // blue-400
        borderRadius: 8,
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    restartButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statItem: {
        color: '#333',
        fontSize: 16,
        marginBottom: 4,
    },
    statLabel: {
        color: '#1e293b',
        fontWeight: 'bold', // slate-800
    },
    statsContainer: {
        marginBottom: 24,
        width: '100%',
        // space-y-2
    },
    title: {
        color: '#2563eb', // blue-700
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
});
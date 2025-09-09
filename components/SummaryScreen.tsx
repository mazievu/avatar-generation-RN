import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


import type { GameState, Character, Language } from '../core/types';
import { ASSET_DEFINITIONS } from '../core/constants';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
  lang: Language;
}

interface SummaryScreenProps extends LocalizedProps {
  gameState: GameState;
  onRestart: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ gameState, onRestart, lang }) => {
  const livingMembers = Object.values(gameState.familyMembers).filter((m: Character) => m.isAlive).length;
  const deceasedMembers = Object.values(gameState.familyMembers).filter((m: Character) => !m.isAlive).length;
  const isVictory = gameState.gameOverReason === 'victory';
  
  let descriptionKey = 'summary_gameover_desc';
  if (isVictory) {
      descriptionKey = 'summary_victory_desc';
  } else if (gameState.gameOverReason === 'debt') {
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
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_generations', lang)}:</Text> {isVictory ? '6' : Object.values(gameState.familyMembers).reduce((max, m: Character) => Math.max(max, m.generation), 0)}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_members', lang)}:</Text> {gameState.totalMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_living_members', lang)}:</Text> {livingMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_deceased_members', lang)}:</Text> {deceasedMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_education', lang)}:</Text> {gameState.highestEducation}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_career', lang)}:</Text> {gameState.highestCareer}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_final_funds', lang)}:</Text> ${gameState.familyFund.toLocaleString()}</Text>
               <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_asset_value', lang)}:</Text> ${Object.values(gameState.purchasedAssets).reduce((sum, a) => sum + (ASSET_DEFINITIONS[a.id]?.cost || 0), 0).toLocaleString()}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_ending_year', lang)}:</Text> {gameState.currentDate.year}</Text>
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
};

const summaryScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        padding: 16,
    },
    contentWrapper: {
        // This was a comic-panel-wrapper, might need specific styling if it had visual effects
        // For now, just a container
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        maxWidth: 500,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#475569', // slate-600
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        marginBottom: 24,
        // space-y-2
    },
    statItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    restartButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    restartButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

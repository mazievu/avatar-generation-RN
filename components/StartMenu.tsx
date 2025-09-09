import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


import type { Language } from '../core/types';
import { SCENARIOS } from '../core/scenarios';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
  lang: Language;
}

interface StartMenuProps extends LocalizedProps {
  onStart: (mode: string) => void;
  onShowInstructions: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, lang }) => (
    <View style={startMenuStyles.startMenuContainer}>
        <Text style={startMenuStyles.gameTitle}>{t('game_title', lang)}</Text>
        <Text style={startMenuStyles.gameSubtitle}>{t('game_subtitle', lang)}</Text>
        <View style={startMenuStyles.scenarioList}>
            {SCENARIOS.map((scenario, i) => (
                <TouchableOpacity
                    key={scenario.id}
                    onPress={() => onStart(scenario.id)}
                    style={startMenuStyles.scenarioButton}
                >
                    <View>
                        <Text style={startMenuStyles.scenarioName}>{t(scenario.nameKey, lang)}</Text>
                        <Text style={startMenuStyles.scenarioDescription}>{t(scenario.descriptionKey, lang)}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
        <TouchableOpacity
            onPress={onShowInstructions}
            style={startMenuStyles.howToPlayButton}
        >
            <Text style={startMenuStyles.howToPlayButtonText}>
                {t('how_to_play_button', lang)}
            </Text>
        </TouchableOpacity>
    </View>
);

const startMenuStyles = StyleSheet.create({
    startMenuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    gameTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
        marginBottom: 8,
    },
    gameSubtitle: {
        fontSize: 18,
        color: '#4b5563', // slate-600
        marginBottom: 32,
    },
    scenarioList: {
        width: '100%',
        marginBottom: 24,
    },
    scenarioButton: {
        backgroundColor: '#f1f5f9', // slate-100
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderBottomWidth: 4,
        borderColor: '#e2e8f0', // slate-200
    },
    scenarioName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    scenarioDescription: {
        fontSize: 14,
        color: '#64748b', // slate-500
        marginTop: 4,
    },
    howToPlayButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    howToPlayButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

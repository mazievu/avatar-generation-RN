import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


import type { Language } from '../core/types';
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
  onStart: () => void;
  onShowInstructions: () => void;
  onSetLang: (lang: Language) => void; // New prop
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, lang, onSetLang }) => (
    <View style={startMenuStyles.startMenuContainer}>
        
        <Text style={startMenuStyles.gameSubtitle}>{t('game_subtitle', lang)}</Text>
        <TouchableOpacity
            onPress={onStart}
            style={startMenuStyles.startButton}
        >
            <Text style={startMenuStyles.startButtonText}>
                {t('start_game_button', lang)}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={onShowInstructions}
            style={startMenuStyles.howToPlayButton}
        >
            <Text style={startMenuStyles.howToPlayButtonText}>
                {t('how_to_play_button', lang)}
            </Text>
        </TouchableOpacity>

        
    {/* Language Selection */}
        <View style={startMenuStyles.languageButtonsContainer}>
            <TouchableOpacity
                onPress={() => onSetLang('en')}
                style={[startMenuStyles.languageButton, lang === 'en' && startMenuStyles.languageButtonActive]}
            >
                <Text style={[startMenuStyles.languageButtonText, lang === 'en' ? startMenuStyles.languageButtonTextActive : startMenuStyles.languageButtonTextInactive]}>
                    EN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => onSetLang('vi')}
                style={[startMenuStyles.languageButton, lang === 'vi' && startMenuStyles.languageButtonActive]}
            >
                <Text style={[startMenuStyles.languageButtonText, lang === 'vi' ? startMenuStyles.languageButtonTextActive : startMenuStyles.languageButtonTextInactive]}>
                    VI
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

const startMenuStyles = StyleSheet.create({
    gameSubtitle: {
        fontSize: 18,
        color: '#4b5563', // slate-600
        marginBottom: 32,
    },
    gameTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
        marginBottom: 8,
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
    languageButton: {
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    languageButtonActive: {
        backgroundColor: '#2563eb', // blue-700
    },
    languageButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    languageButtonTextActive: {
        color: 'white',
    },
    languageButtonTextInactive: {
        color: '#4b5563', // slate-600
    },
    languageButtonsContainer: {
        flexDirection: 'row',
        marginTop: 24,
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: 8,
        padding: 4,
    },
    scenarioDescription: {
        fontSize: 14,
        color: '#64748b', // slate-500
        marginTop: 4,
    },
    scenarioList: {
        marginBottom: 24,
        width: '100%',
    },
    scenarioName: {
        color: '#1e293b',
        fontSize: 18,
        fontWeight: 'bold', // slate-800
    },
    startButton: {
        backgroundColor: '#2563eb', // blue-700
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginBottom: 24,
    },
    startButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    startMenuContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
});

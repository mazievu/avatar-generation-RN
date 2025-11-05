import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, Image } from 'react-native';

import type { Language } from '../core/types';
import { t } from '../core/localization';

const bgImage = require('../assets/start_scence.png');
const playButtonImage = require('../assets/play_button.png');
// Using play_button for continue as well, can be changed later.
const continueButtonImage = require('../assets/play_button.png'); 
const instructionsButtonImage = require('../assets/instructionsButtonImage.png');
const youtubeButtonImage = require('../assets/youtubeButtonImage.png');

interface LocalizedProps {
  lang: Language;
}

interface StartMenuProps extends LocalizedProps {
  hasSavedGame: boolean;
  onStartNew: () => void;
  onContinue: () => void;
  onShowInstructions: () => void;
  onSetLang: (lang: Language) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  hasSavedGame,
  onStartNew,
  onContinue,
  onShowInstructions,
  lang,
  onSetLang,
}) => {
  const isReturningPlayer = hasSavedGame;
  const playAction = isReturningPlayer ? onContinue : onStartNew;
  const buttonImage = isReturningPlayer ? continueButtonImage : playButtonImage;
  // We can also add text over the button if needed, e.g., "Continue"
  // For now, just the action and potentially the image will change.

  return (
    <ImageBackground source={bgImage} style={startMenuStyles.startMenuContainer} resizeMode="cover">
      <TouchableOpacity
        onPress={() => {
          console.log("Play button clicked");
          playAction();
        }}
        style={startMenuStyles.playButton}
      >
        <Image source={buttonImage} style={startMenuStyles.buttonImage} resizeMode="contain" />
        {isReturningPlayer && (
            <Text style={startMenuStyles.continueText}>{t('continue_game_button', lang)}</Text>
        )}
      </TouchableOpacity>

      <View style={startMenuStyles.bottomButtonsContainer}>
        <TouchableOpacity
          onPress={onShowInstructions}
          style={startMenuStyles.bottomButton}
        >
          <Image source={instructionsButtonImage} style={startMenuStyles.buttonImage} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.youtube.com/@Milamioavatar')}
          style={startMenuStyles.bottomButton}
        >
          <Image source={youtubeButtonImage} style={startMenuStyles.buttonImage} resizeMode="contain" />
        </TouchableOpacity>
      </View>

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
    </ImageBackground>
  );
};

const startMenuStyles = StyleSheet.create({
    continueText: {
        position: 'absolute',
        bottom: -30, // Adjust as needed
        alignSelf: 'center',
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    playButton: {
        position: 'absolute',
        top: '60%',
        alignSelf: 'center',
        width: 150,
        height: 150,
    },
    bottomButtonsContainer: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
    },
    bottomButton: {
        width: 80,
        height: 80,
    },
    buttonImage: {
        width: '100%',
        height: '100%',
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
        position: 'absolute',
        bottom: 150,
        alignSelf: 'center',
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: 8,
        flexDirection: 'row',
        padding: 4,
    },
    startMenuContainer: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
});

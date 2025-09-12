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

interface WelcomeBackMenuProps extends LocalizedProps {
  onContinue: () => void;
  onStartNew: () => void;
}

export const WelcomeBackMenu: React.FC<WelcomeBackMenuProps> = ({ onContinue, onStartNew, lang }) => (
    <View style={welcomeBackMenuStyles.container}>
        <Text style={welcomeBackMenuStyles.title}>{t('welcome_back_title', lang)}</Text>
        <Text style={welcomeBackMenuStyles.subtitle}>{t('welcome_back_subtitle', lang)}</Text>
        <View style={welcomeBackMenuStyles.buttonGroup}>
            <TouchableOpacity
                onPress={onContinue}
                style={[welcomeBackMenuStyles.button, welcomeBackMenuStyles.buttonGreen]}
            >
                <Text style={welcomeBackMenuStyles.buttonText}>
                    {t('continue_game_button', lang)}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onStartNew}
                style={[welcomeBackMenuStyles.button, welcomeBackMenuStyles.buttonSlate]}
            >
                <Text style={welcomeBackMenuStyles.buttonText}>
                    {t('start_new_game_button', lang)}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

const welcomeBackMenuStyles = StyleSheet.create({
    button: {
        paddingVertical: 16, // py-4
        paddingHorizontal: 48, // px-12
        borderRadius: 8,
        // chunky-button styles need to be defined
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    buttonGroup: {
        flexDirection: 'row',
        // sm:flex-row gap-6
        // For small screens, it might stack vertically, but for now, row.
        // Gap can be simulated with margin.
        gap: 24, // gap-6
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 24, // text-2xl
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center', // Not directly applicable to View, but for Text children
        padding: 16,
    },
    subtitle: {
        fontSize: 24, // text-2xl
        color: '#475569', // slate-600
        marginBottom: 48, // mb-12
        fontWeight: 'bold',
    },
    title: {
        fontSize: 64, // text-8xl, adjusted for RN
        fontWeight: '900', // font-black
        color: '#60a5fa', // blue-400
        marginBottom: 8,
        textShadowColor: '#fde047', // yellow-200
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 0,
        // Second shadow for rgba(0,0,0,0.1) might need a separate Text component or a custom solution
    },
});

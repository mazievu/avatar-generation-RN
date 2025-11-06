import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import ModalBase from './ModalBase';
import { Language } from '../core/types';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size: number) => Math.round(size * scale);

interface SettingsModalProps {
    isVisible: boolean;
    onClose: () => void;
    lang: Language;
    gameSpeed: number;
    onSetGameSpeed: (speed: number) => void;
    onQuitGame: () => void;
    isPaused: boolean;
    onSetIsPaused: (paused: boolean) => void;
    isMusicMuted: boolean;
    onToggleMusic: () => void;
    isSfxMuted: boolean;
    onToggleSfx: () => void;
}

const speedOptions = [
    { labelKey: 'game_speed_slow', value: 100 },
    { labelKey: 'game_speed_normal', value: 50 },
    { labelKey: 'game_speed_fast', value: 25 },
    { labelKey: 'game_speed_very_fast', value: 13 },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
    isVisible,
    onClose,
    lang,
    gameSpeed,
    onSetGameSpeed,
    onQuitGame,
    isPaused,
    onSetIsPaused,
    isMusicMuted,
    onToggleMusic,
    isSfxMuted,
    onToggleSfx,
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <ModalBase isVisible={isVisible} onClose={onClose} title={t('settings_modal_title', lang)}>
            <View style={styles.container}>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t('game_speed_label', lang) || 'Game Speed'}:</Text>
                    <View style={styles.speedControlContainer}>
                        {speedOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.speedButton,
                                    gameSpeed === option.value && styles.speedButtonActive,
                                ]}
                                onPress={() => onSetGameSpeed(option.value)}
                            >
                                <Text
                                    style={[
                                        styles.speedButtonText,
                                        gameSpeed === option.value && styles.speedButtonTextActive,
                                    ]}
                                >
                                    {t(option.labelKey, lang)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t('music_label', lang) || 'Music'}:</Text>
                    <Switch value={!isMusicMuted} onValueChange={onToggleMusic} />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t('sfx_label', lang) || 'SFX'}:</Text>
                    <Switch value={!isSfxMuted} onValueChange={onToggleSfx} />
                </View>

                <TouchableOpacity onPress={() => onSetIsPaused(!isPaused)} style={styles.pauseResumeButton}>
                    <Text style={styles.pauseResumeButtonText}>{isPaused ? t('resume_button', lang) : t('pause_button', lang)}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onQuitGame} style={styles.quitButton}>
                    <Text style={styles.quitButtonText}>{t('quit_game_button', lang)}</Text>
                </TouchableOpacity>
            </View>
        </ModalBase>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: '100%',
    },
    pauseResumeButton: {
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    pauseResumeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quitButton: {
        backgroundColor: '#ef4444', // red-500
        borderRadius: 8,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    quitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingLabel: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    settingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    speedControlContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb', // gray-200
        borderRadius: 8,
        marginTop: 10,
        overflow: 'hidden',
        width: '100%',
    },
    speedButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedButtonActive: {
        backgroundColor: '#4f46e5', // indigo-600
        borderRadius: 8,
    },
    speedButtonText: {
        color: '#4b5563', // gray-600
        fontWeight: '600',
    },
    speedButtonTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default SettingsModal;
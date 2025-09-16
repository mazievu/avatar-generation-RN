import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ModalBase from './ModalBase';
import { Language } from '../core/types';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;
const responsiveSize = (size: number) => Math.round(size * scale);

interface SettingsModalProps {
    isVisible: boolean;
    onClose: () => void;
    lang: Language;
    onSetLang: (lang: Language) => void;
    gameSpeed: number;
    onSetGameSpeed: (speed: number) => void;
    onQuitGame: () => void;
    isPaused: boolean; // NEW
    onSetIsPaused: (paused: boolean) => void; // NEW
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isVisible,
    onClose,
    lang,
    onSetLang,
    gameSpeed,
    onSetGameSpeed,
    onQuitGame,
    isPaused, // NEW
    onSetIsPaused, // NEW
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <ModalBase isVisible={isVisible} onClose={onClose} title={t('settings_modal_title', lang)}>
            <View style={settingsModalStyles.container}>
                {/* Language Selection */}
                <View style={settingsModalStyles.settingRow}>
                    <Text style={settingsModalStyles.settingLabel}>{t('language_label', lang) || 'Language'}:</Text>
                    <View style={settingsModalStyles.languageButtonsContainer}>
                        <TouchableOpacity onPress={() => onSetLang('en')} style={[settingsModalStyles.languageButton, lang === 'en' && settingsModalStyles.languageButtonActive]}>
                            <Text style={[settingsModalStyles.languageButtonText, lang === 'en' ? settingsModalStyles.languageButtonTextActive : settingsModalStyles.languageButtonTextInactive]}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onSetLang('vi')} style={[settingsModalStyles.languageButton, lang === 'vi' && settingsModalStyles.languageButtonActive]}>
                            <Text style={[settingsModalStyles.languageButtonText, lang === 'vi' ? settingsModalStyles.languageButtonTextActive : settingsModalStyles.languageButtonTextInactive]}>VI</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Game Speed */}
                <View style={settingsModalStyles.settingRow}>
                    <Text style={settingsModalStyles.settingLabel}>{t('game_speed_label', lang) || 'Game Speed'}:</Text>
                    <Picker
                        selectedValue={gameSpeed}
                        onValueChange={(itemValue) => onSetGameSpeed(Number(itemValue))}
                        style={settingsModalStyles.speedPicker}
                        itemStyle={settingsModalStyles.speedPickerItem}
                    >
                        <Picker.Item label={t('speed_slow', lang)} value={200} />
                        <Picker.Item label={t('speed_normal', lang)} value={100} />
                        <Picker.Item label={t('speed_fast', lang)} value={50} />
                        <Picker.Item label={t('speed_very_fast', lang)} value={10} />
                    </Picker>
                </View>

                {/* Pause/Resume Game */}
                <TouchableOpacity onPress={() => onSetIsPaused(!isPaused)} style={settingsModalStyles.pauseResumeButton}>
                    <Text style={settingsModalStyles.pauseResumeButtonText}>{isPaused ? t('resume_button', lang) : t('pause_button', lang)}</Text>
                </TouchableOpacity>

                {/* Quit Game */}
                <TouchableOpacity onPress={onQuitGame} style={settingsModalStyles.quitButton}>
                    <Text style={settingsModalStyles.quitButtonText}>{t('quit_game_button', lang)}</Text>
                </TouchableOpacity>
            </View>
        </ModalBase>
    );
};

const settingsModalStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    languageButton: {
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    languageButtonActive: {
        backgroundColor: '#6366f1', // indigo-500
    },
    languageButtonText: {
        fontWeight: 'bold',
    },
    languageButtonTextActive: {
        color: 'white',
    },
    languageButtonTextInactive: {
        color: '#475569', // slate-600
    },
    languageButtonsContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'row',
        padding: 4,
    },
    pauseResumeButton: { // NEW STYLE
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    pauseResumeButtonText: { // NEW STYLE
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    quitButton: {
        backgroundColor: '#ef4444', // red-500
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 20,
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
    },
    settingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    speedPicker: {
        height: 44,
        width: responsiveSize(150), // Adjusted width for better fit
    },
    speedPickerItem: {
        height: 44,
    },
});

export default SettingsModal;

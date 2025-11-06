import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import ModalBase from './ModalBase';
import { Language } from '../core/types';
// import { t } from '../core/localization'; // Tạm thời không dùng
import { soundManager } from '../services';

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
    { labelKey: 'game_speed_slow', value: 100, fallback: 'Slow' },
    { labelKey: 'game_speed_normal', value: 50, fallback: 'Normal' },
    { labelKey: 'game_speed_fast', value: 25, fallback: 'Fast' },
    { labelKey: 'game_speed_very_fast', value: 13, fallback: 'Very Fast' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, lang, gameSpeed, onSetGameSpeed, onQuitGame, isPaused, onSetIsPaused, isMusicMuted, onToggleMusic, isSfxMuted, onToggleSfx }) => {
    if (!isVisible) {
        return null;
    }
    // Dòng return phải bắt đầu ngay lập tức với JSX, không có dòng trống
    return (<ModalBase isVisible={isVisible} onClose={onClose} title={"Settings"}>
            <View style={styles.container}>
                <View style={styles.gameSpeedSettingRow}>
                    <Text style={styles.settingLabel}>{"Game Speed:"}</Text>
                    <View style={styles.speedControlContainer}>
                        {speedOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.speedButton, gameSpeed === option.value && styles.speedButtonActive]}
                                onPress={() => { soundManager.play('click'); onSetGameSpeed(option.value); }}>
                                <Text style={[styles.speedButtonText, gameSpeed === option.value && styles.speedButtonTextActive]}>
                                    {option.fallback}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{"Music:"}</Text>
                    <Switch value={!isMusicMuted} onValueChange={onToggleMusic} />
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{"SFX:"}</Text>
                    <Switch value={!isSfxMuted} onValueChange={onToggleSfx} />
                </View>
                <TouchableOpacity onPress={() => { soundManager.play('click'); onSetIsPaused(!isPaused); }} style={styles.pauseResumeButton}>
                    <Text style={styles.pauseResumeButtonText}>{isPaused ? "Resume" : "Pause"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { soundManager.play('click'); onQuitGame(); }} style={styles.quitButton}>
                    <Text style={styles.quitButtonText}>{"Quit Game"}</Text>
                </TouchableOpacity>
            </View>
        </ModalBase>);
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, width: '100%' },
    pauseResumeButton: { backgroundColor: '#3b82f6', borderRadius: 8, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, width: '100%', alignItems: 'center' },
    pauseResumeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    quitButton: { backgroundColor: '#ef4444', borderRadius: 8, marginTop: 12, paddingHorizontal: 20, paddingVertical: 12, width: '100%', alignItems: 'center' },
    quitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    settingLabel: { color: '#333', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, width: '100%' },
    gameSpeedSettingRow: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20, width: '100%' },
    speedControlContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', backgroundColor: '#e5e7eb', borderRadius: 8, marginTop: 10, overflow: 'hidden', width: '100%' },
    speedButton: { width: '48%', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    speedButtonActive: { backgroundColor: '#4f46e5', borderRadius: 8 },
    speedButtonText: { color: '#4b5563', fontWeight: '600' },
    speedButtonTextActive: { color: 'white', fontWeight: 'bold' },
});

export default SettingsModal;
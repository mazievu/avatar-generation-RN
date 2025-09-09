import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import type { Language } from '../core/types';
import { t } from '../core/localization';

interface LocalizedProps {
  lang: Language;
}

interface InstructionsModalProps extends LocalizedProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose, lang }) => (
    <View style={instructionsModalStyles.modalOverlay}>
        <BlurView
            style={instructionsModalStyles.absolute}
            blurType="dark"
            blurAmount={10} />
        <View style={instructionsModalStyles.comicPanelWrapper}>
            <View style={instructionsModalStyles.comicPanel}>
                <TouchableOpacity onPress={onClose} style={instructionsModalStyles.closeButton}>
                    <Text style={instructionsModalStyles.closeButtonText}>&times;</Text>
                </TouchableOpacity>
                <Text style={instructionsModalStyles.instructionsTitle}>{t('instructions_title', lang)}</Text>
                <View style={instructionsModalStyles.instructionsContent}>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_objective_title', lang)}:</Text> {t('instructions_objective_desc', lang)}</Text>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_gameplay_title', lang)}:</Text> {t('instructions_gameplay_desc', lang)}</Text>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_events_title', lang)}:</Text> {t('instructions_events_desc', lang)}</Text>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_stats_title', lang)}:</Text> {t('instructions_stats_desc', lang)}</Text>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_phases_title', lang)}:</Text> {t('instructions_phases_desc', lang)}</Text>
                    <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_finance_title', lang)}:</Text> {t('instructions_finance_desc', lang)}</Text>
                </View>
            </View>
        </View>
    </View>
);

const instructionsModalStyles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 50,
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    comicPanelWrapper: {
        // transform: [{ rotate: '1deg' }],
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24,
        maxWidth: 768, // max-w-2xl (32rem * 16px/rem = 512px, but 2xl is 42rem = 672px, let's use 768 for a bit more space)
        width: '100%',
        position: 'relative',
        borderRadius: 8, // Example, adjust as needed
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    closeButtonText: {
        fontSize: 32, // text-4xl
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    instructionsTitle: {
        fontSize: 28, // text-3xl
        fontWeight: 'bold',
        color: '#60a5fa', // blue-400
        marginBottom: 16,
    },
    instructionsContent: {
        // space-y-3
    },
    instructionsParagraph: {
        fontSize: 14, // text-base
        color: '#475569', // slate-600
        marginBottom: 12, // space-y-3 equivalent
    },
    instructionsStrong: {
        fontWeight: 'bold',
    },
});

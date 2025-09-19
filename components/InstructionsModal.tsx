import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


import type { Language } from '../core/types';
import { t } from '../core/localization';
import { ComicPanelModal } from './ComicPanelModal';
import { CloseIcon } from './icons';




interface LocalizedProps {
  lang: Language;
}

interface InstructionsModalProps extends LocalizedProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose, lang }) => (
    <ComicPanelModal visible={true} onClose={onClose} rotate="1deg">
        <Pressable onPress={onClose} style={instructionsModalStyles.closeButton}>
            <CloseIcon width={32} height={32} color="#94a3b8" />
        </Pressable>
        <Text style={instructionsModalStyles.instructionsTitle}>{t('instructions_title', lang)}</Text>
        <View style={instructionsModalStyles.instructionsContent}>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_objective_title', lang)}:</Text> {t('instructions_objective_desc', lang)}</Text>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_gameplay_title', lang)}:</Text> {t('instructions_gameplay_desc', lang)}</Text>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_events_title', lang)}:</Text> {t('instructions_events_desc', lang)}</Text>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_stats_title', lang)}:</Text> {t('instructions_stats_desc', lang)}</Text>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_phases_title', lang)}:</Text> {t('instructions_phases_desc', lang)}</Text>
            <Text style={instructionsModalStyles.instructionsParagraph}><Text style={instructionsModalStyles.instructionsStrong}>{t('instructions_finance_title', lang)}:</Text> {t('instructions_finance_desc', lang)}</Text>
        </View>
    </ComicPanelModal>
);

const instructionsModalStyles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    instructionsContent: {
        // space-y-3
    },
    instructionsParagraph: {
        color: '#475569', // slate-600
        fontSize: 14, // text-base
        marginBottom: 12, // space-y-3 equivalent
    },
    instructionsStrong: {
        fontWeight: 'bold',
    },
    instructionsTitle: {
        color: '#60a5fa', // blue-400
        fontSize: 28, // text-3xl
        fontWeight: 'bold',
        marginBottom: 16,
    },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


import type { Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';




interface LocalizedProps {
    lang: Language;
}

interface PromotionModalProps extends LocalizedProps {
    characterName: string;
    newTitle: string;
    onAccept: () => void;
}
export const PromotionModal: React.FC<PromotionModalProps> = ({ characterName, newTitle, onAccept, lang }) => (
    <ComicPanelModal
        visible={true}
        onClose={() => {}} // No explicit close button, so provide a dummy
        rotate="0deg"
    >
        <Text style={promotionModalStyles.title}>{t('modal_promotion_title', lang)}</Text>
        <Text style={promotionModalStyles.description}>{t('modal_promotion_desc', lang, { name: characterName, title: newTitle })}</Text>
        <TouchableOpacity onPress={onAccept} style={[promotionModalStyles.button, promotionModalStyles.buttonGreen]}>
            <Text style={promotionModalStyles.buttonText}>
                {t('accept_promotion_button', lang)}
            </Text>
        </TouchableOpacity>
    </ComicPanelModal>
);

const promotionModalStyles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
});
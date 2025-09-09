import * as React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Language } from '../core/types';
import { ModalBase } from './ModalBase';
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
    <ModalBase
        titleKey="modal_promotion_title"
        characterName={characterName}
        descriptionKey="modal_promotion_desc"
        descriptionReplacements={{ name: characterName, title: newTitle }}
        lang={lang}
    >
        <TouchableOpacity onPress={onAccept} style={[promotionModalStyles.button, promotionModalStyles.buttonGreen]}>
            <Text style={promotionModalStyles.buttonText}>
                {t('accept_promotion_button', lang)}
            </Text>
        </TouchableOpacity>
    </ModalBase>
);

const promotionModalStyles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        borderBottomWidth: 4,
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

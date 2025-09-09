import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
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

interface ModalBaseProps extends LocalizedProps {
    titleKey: string;
    characterName?: string;
    descriptionKey: string;
    descriptionReplacements?: Record<string, string | number>;
    children: React.ReactNode;
}

export const ModalBase: React.FC<ModalBaseProps> = ({titleKey, characterName, descriptionKey, descriptionReplacements, children, lang}) => (
    <View style={modalBaseStyles.overlay}>
        <BlurView
            style={modalBaseStyles.absolute}
            blurType="dark"
            blurAmount={10}
        />
        <View style={modalBaseStyles.comicPanelWrapper}>
            <View style={modalBaseStyles.comicPanel}>
                <Text style={modalBaseStyles.title}>{t(titleKey, lang)}</Text>
                {characterName && <Text style={modalBaseStyles.characterNameLabel}>{t('for_char_label', lang)}: <Text style={modalBaseStyles.characterName}>{characterName}</Text></Text>}
                <Text style={modalBaseStyles.description}>{t(descriptionKey, lang, { name: characterName ?? '', ...descriptionReplacements })}</Text>
                <View style={modalBaseStyles.childrenContainer}>
                   {children}
                </View>
            </View>
        </View>
    </View>
);

const modalBaseStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: 16,
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    comicPanelWrapper: {
        // For React Native, if a rotation is desired, it would be applied directly to the style prop.
        transform: [{ rotate: '-1deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24, // p-6
        maxWidth: 400, // max-w-lg
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
    characterNameLabel: {
        fontSize: 14,
        color: '#475569', // slate-600
        marginBottom: 4,
        textAlign: 'center',
    },
    characterName: {
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    childrenContainer: {
        marginTop: 16,
        // space-y-3
    },
});
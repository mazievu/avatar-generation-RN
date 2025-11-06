import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';

import type { Character, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { soundManager } from '../services';

interface UniversityChoiceModalProps {
    character: Character;
    onSelect: (goToUniversity: boolean) => void;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
    onOpenCharacterDetails: (character: Character) => void;
}

export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ character, onSelect, lang, manifest, images, onOpenCharacterDetails }) => (
    <ComicPanelModal visible={true} onClose={() => {}} rotate="0deg">
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { soundManager.play('click'); onOpenCharacterDetails(character); }} style={styles.avatarContainer}>
                <AgeAwareAvatarPreview
                    character={character}
                    manifest={manifest}
                    images={images}
                    size={{ width: 80, height: 80 }}
                />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
                <Text style={styles.title}>{t('modal_university_title', lang)}</Text>
            </View>
        </View>

        <Text style={styles.description}>{t('modal_university_desc', lang, { name: character.name })}</Text>

        <TouchableOpacity onPress={() => { soundManager.play('click'); onSelect(true); }} style={[styles.button, styles.buttonBlue]}>
            <Text style={styles.buttonText}>{t('university_choice_yes', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { soundManager.play('click'); onSelect(false); }} style={[styles.button, styles.buttonSlate]}>
            <Text style={styles.buttonText}>{t('university_choice_no', lang)}</Text>
        </TouchableOpacity>
    </ComicPanelModal>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        color: '#1e293b', // slate-800
        fontSize: 24,
        fontWeight: 'bold',
    },
    description: {
        color: '#475569', // slate-600
        fontSize: 16,
        marginBottom: 24,
    },
    button: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    buttonBlue: {
        backgroundColor: '#60a5fa', // blue-400
        borderColor: '#3b82f6', // blue-500
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';

import type { Character, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER } from '../core/constants';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

interface UnderqualifiedChoiceModalProps {
    character: Character;
    careerTrackKey: string;
    onSelect: (isTrainee: boolean) => void;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
    onOpenCharacterDetails: (character: Character) => void;
}

export const UnderqualifiedChoiceModal: React.FC<UnderqualifiedChoiceModalProps> = ({ character, careerTrackKey, onSelect, lang, manifest, images, onOpenCharacterDetails }) => {
    const track = CAREER_LADDER[careerTrackKey];
    if (!track) return null;
    
    return (
        <ComicPanelModal 
            visible={true}
            onClose={() => {}} // No explicit close button, so provide a dummy
            rotate="0deg"
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onOpenCharacterDetails(character)} style={styles.avatarContainer}>
                    <AgeAwareAvatarPreview
                        character={character}
                        manifest={manifest}
                        images={images}
                        size={{ width: 80, height: 80 }}
                    />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>{t('modal_underqualified_title', lang)}</Text>
                </View>
            </View>

            <Text style={styles.description}>{t('modal_underqualified_desc', lang, { name: character.name, careerName: t(track.nameKey, lang) })}</Text>
            
            <ChoiceButton onClick={() => onSelect(true)}>
                <Text style={styles.choiceTitle}>{t('underqualified_choice_trainee', lang)}</Text>
                <Text style={styles.choiceDescription}>{t('underqualified_choice_trainee_desc', lang)}</Text>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <Text style={styles.choiceTitle}>{t('underqualified_choice_penalized', lang)}</Text>
                <Text style={styles.choiceDescription}>{t('underqualified_choice_penalized_desc', lang)}</Text>
            </ChoiceButton>
        </ComicPanelModal>
    );
}

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
    choiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    choiceDescription: {
        color: '#475569', // slate-600
        fontSize: 12,
        marginTop: 4,
    },
});

import * as React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';

import type { Character, Language, Manifest } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER, VOCATIONAL_TRAINING } from '../core/constants';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { soundManager } from '../services';

interface CareerChoiceModalProps {
    character: Character;
    options: string[];
    onSelect: (careerTrackKey: string) => void;
    currentFunds: number;
    lang: Language;
    manifest: Manifest;
    images: Record<string, ImageSourcePropType>;
    onOpenCharacterDetails: (character: Character) => void;
}

export const CareerChoiceModal: React.FC<CareerChoiceModalProps> = ({ character, options, onSelect, currentFunds, lang, manifest, images, onOpenCharacterDetails }) => (
     <ComicPanelModal visible={true} onClose={() => {}} rotate="1deg">
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
                <Text style={styles.title}>{t('modal_career_title', lang)}</Text>
            </View>
        </View>

        <Text style={styles.description}>{t('modal_career_desc', lang, { name: getCharacterDisplayName(character, lang) })}</Text>
        
        {options.map((optionKey, index) => {
             if (CAREER_LADDER[optionKey]) {
                const track = CAREER_LADDER[optionKey];
                const isMajorMatch = character.major && track.requiredMajor === character.major;
                const isUnderqualified = isMajorMatch && (character.stats.iq < track.iqRequired || character.stats.eq < track.eqRequired);
                
                let tooltipText = '';
                if(isUnderqualified) {
                    const iqShortfall = Math.max(0, track.iqRequired - character.stats.iq);
                    const confShortfall = Math.max(0, track.eqRequired - character.stats.eq);
                    const missing: string[] = [];
                    if(iqShortfall > 0) missing.push(t('underqualified_tooltip_iq', lang, {shortfall: iqShortfall}));
                    if(confShortfall > 0) missing.push(t('underqualified_tooltip_conf', lang, {shortfall: confShortfall}));
                    tooltipText = `${t('underqualified_tooltip', lang)} ${missing.join(', ')}`;
                }

                return (
                    <ChoiceButton key={index} onClick={() => onSelect(optionKey)}>
                        <View style={styles.choiceContent}>
                             <View style={styles.choiceNameContainer}>
                                <Text style={styles.choiceNameText}>{t(track.nameKey, lang)}</Text>
                                {isMajorMatch && !isUnderqualified && <Text style={styles.majorMatchIcon} accessibilityLabel={t('major_match_tooltip', lang)}>⭐</Text>}
                                {isUnderqualified && <Text style={styles.underqualifiedIcon} accessibilityLabel={tooltipText}>⚠️</Text>}
                            </View>
                        </View>
                        <Text style={styles.choiceDescription}>{t(track.descriptionKey, lang)}</Text>
                    </ChoiceButton>
                );
            } else if (optionKey === 'job' || optionKey === 'internship' || optionKey === 'vocational') {
                const keyBase = `career_option_${optionKey}`;
                const descKey = `${keyBase}_desc`;
                const cost = optionKey === 'vocational' ? VOCATIONAL_TRAINING.cost : 0;
                
                return (
                    <ChoiceButton key={index} onClick={() => onSelect(optionKey)} disabled={currentFunds < cost}>
                        <View style={styles.choiceContent}>
                            <Text style={styles.choiceNameText}>{t(keyBase, lang)}</Text>
                             {cost > 0 && (
                                <Text style={[styles.choiceCost, currentFunds >= cost ? styles.costAffordable : styles.costUnaffordable]}>
                                    (-${cost.toLocaleString()})
                                </Text>
                            )}
                        </View>
                        <Text style={styles.choiceDescription}>{t(descKey, lang)}</Text>
                    </ChoiceButton>
                );
            }
            return null;
        })}
    </ComicPanelModal>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        color: '#1e293b',
        fontSize: 24,
        fontWeight: '900',
    },
    description: {
        color: '#475569',
        fontSize: 16,
        marginBottom: 24,
    },
    choiceContent: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    choiceCost: {
        fontSize: 14,
    },
    choiceDescription: {
        color: '#475569', // slate-600
        fontSize: 14,
        marginTop: 4,
    },
    choiceNameContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    choiceNameText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    costAffordable: {
        color: '#64748b', // slate-500
    },
    costUnaffordable: {
        color: '#ef4444', // red-500
    },
    majorMatchIcon: {
        fontSize: 16,
        marginLeft: 8,
    },
    underqualifiedIcon: {
        fontSize: 16,
        marginLeft: 8,
    },
});

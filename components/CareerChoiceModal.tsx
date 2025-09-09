import * as React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';


import type { Character, Language } from '../core/types';
import { ComicPanelModal } from './ComicPanelModal';
import { ChoiceButton } from './ChoiceButton';
import { CAREER_LADDER, VOCATIONAL_TRAINING } from '../core/constants';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
    lang: Language;
}

interface CareerChoiceModalProps extends LocalizedProps {
    character: Character;
    options: string[];
    onSelect: (careerTrackKey: string) => void;
    currentFunds: number;
}
export const CareerChoiceModal: React.FC<CareerChoiceModalProps> = ({ character, options, onSelect, currentFunds, lang }) => (
     <ComicPanelModal visible={true} onClose={() => {}} rotate="1deg">
        <Text style={careerChoiceModalStyles.title}>{t('modal_career_title', lang)}</Text>
        <Text style={careerChoiceModalStyles.description}>{t('modal_career_desc', lang)}</Text>
        {options.map((optionKey, index) => {
             if (CAREER_LADDER[optionKey]) {
                const track = CAREER_LADDER[optionKey];
                const isMajorMatch = character.major && track.requiredMajor === character.major;
                const isUnderqualified = isMajorMatch && (character.stats.iq < track.iqRequired || character.stats.eq < track.eqRequired);
                
                let tooltipText = '';
                if(isUnderqualified) {
                    const iqShortfall = Math.max(0, track.iqRequired - character.stats.iq);
                    const confShortfall = Math.max(0, track.eqRequired - character.stats.eq);
                    let missing: string[] = [];
                    if(iqShortfall > 0) missing.push(t('underqualified_tooltip_iq', lang, {shortfall: iqShortfall}));
                    if(confShortfall > 0) missing.push(t('underqualified_tooltip_conf', lang, {shortfall: confShortfall}));
                    tooltipText = `${t('underqualified_tooltip', lang)} ${missing.join(', ')}`;
                }

                return (
                    <ChoiceButton key={index} onClick={() => onSelect(optionKey)}>
                        <View style={careerChoiceModalStyles.choiceContent}>
                             <View style={careerChoiceModalStyles.choiceNameContainer}>
                                <Text style={careerChoiceModalStyles.choiceNameText}>{t(track.nameKey, lang)}</Text>
                                {isMajorMatch && !isUnderqualified && <Text style={careerChoiceModalStyles.majorMatchIcon} accessibilityLabel={t('major_match_tooltip', lang)}>⭐</Text>}
                                {isUnderqualified && <Text style={careerChoiceModalStyles.underqualifiedIcon} accessibilityLabel={tooltipText}>⚠️</Text>}
                            </View>
                        </View>
                        <Text style={careerChoiceModalStyles.choiceDescription}>{t(track.descriptionKey, lang)}</Text>
                    </ChoiceButton>
                );
            } else if (optionKey === 'job' || optionKey === 'internship' || optionKey === 'vocational') {
                const keyBase = `career_option_${optionKey}`;
                const descKey = `${keyBase}_desc`;
                const cost = optionKey === 'vocational' ? VOCATIONAL_TRAINING.cost : 0;
                
                return (
                    <ChoiceButton key={index} onClick={() => onSelect(optionKey)} disabled={currentFunds < cost}>
                        <View style={careerChoiceModalStyles.choiceContent}>
                            <Text style={careerChoiceModalStyles.choiceNameText}>{t(keyBase, lang)}</Text>
                             {cost > 0 && (
                                <Text style={[careerChoiceModalStyles.choiceCost, currentFunds >= cost ? careerChoiceModalStyles.costAffordable : careerChoiceModalStyles.costUnaffordable]}>
                                    (-${cost.toLocaleString()})
                                </Text>
                            )}
                        </View>
                        <Text style={careerChoiceModalStyles.choiceDescription}>{t(descKey, lang)}</Text>
                    </ChoiceButton>
                );
            }
            return null;
        })}
    </ComicPanelModal>
);

const careerChoiceModalStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
    choiceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choiceNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    choiceNameText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    majorMatchIcon: {
        marginLeft: 8,
        fontSize: 16,
    },
    underqualifiedIcon: {
        marginLeft: 8,
        fontSize: 16,
    },
    choiceCost: {
        fontSize: 14,
    },
    costAffordable: {
        color: '#64748b', // slate-500
    },
    costUnaffordable: {
        color: '#ef4444', // red-500
    },
    choiceEffects: {
        fontSize: 12,
        color: '#475569', // slate-600
        marginTop: 4,
    },
});

import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType, Dimensions } from 'react-native';


import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { Character, GameEvent, EventChoice, EventEffect, Manifest, Language, Stats } from '../core/types';
import { getAllEvents } from '../core/gameData';
import { t } from '../core/localization';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { StatBar } from './StatBar';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon, MoneyIcon } from './icons';
import { ComicPanelModal } from './ComicPanelModal';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface EventModalProps {
  lang: Language;
  eventData: { characterId: string; event: GameEvent; replacements?: Record<string, string | number> };
  character: Character;
  onChoice: (choice: EventChoice) => void;
  onClose: () => void;
  images: Record<string, ImageSourcePropType>;
  manifest: Manifest;
  onAvatarClick: (character: Character) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ eventData, character, onChoice, onClose, lang, images, manifest, onAvatarClick }) => {
  const [initialCharacterState, setInitialCharacterState] = React.useState(character);
  const [displayEventData, setDisplayEventData] = React.useState(eventData);
  const [outcome, setOutcome] = React.useState<EventEffect | null>(null);

  const okButtonPressState = useSharedValue(0);

  const okButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
        transform: [{ translateY: withTiming(okButtonPressState.value * 2, { duration: 75 }) }],
        borderBottomWidth: withTiming(4 - okButtonPressState.value * 2, { duration: 75 }),
    };
  });

  const handleOkPressIn = () => {
    okButtonPressState.value = 1;
  };

  const handleOkPressOut = () => {
    okButtonPressState.value = 0;
  };



  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const characterDisplayName = getCharacterDisplayName(character, lang);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    if (eventData.event.id !== displayEventData.event.id || eventData.characterId !== displayEventData.characterId) {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setDisplayEventData(eventData);
        setInitialCharacterState(character);
        setOutcome(null);
      }, 2500);
    }
    return () => clearTimer();
  }, [eventData, displayEventData, character]);

  const handleSelectChoice = (choice: EventChoice) => {
    if (outcome) return;
    setOutcome(choice.effect);
    onChoice(choice);
  };
  
  React.useEffect(() => {
    if (outcome) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timerRef.current!);
    }
  }, [outcome, onClose]);

  const statIcons: Record<string, React.ElementType> = {
    iq: IqIcon,
    happiness: HappinessIcon,
    eq: EqIcon,
    health: HealthIcon,
    skill: SkillIcon,
  };

  const statLabels: Record<string, string> = {
    iq: 'IQ',
    happiness: t('stat_happiness', lang),
    eq: t('stat_eq', lang),
    health: t('stat_health', lang),
    skill: t('stat_skill', lang),
  }

  return (
    <ComicPanelModal visible={true} onClose={onClose} rotate="2deg">
        
      
        <View style={eventModalStyles.header}>
            <TouchableOpacity onPress={() => onAvatarClick(character)} style={eventModalStyles.avatarButton}>
                <AgeAwareAvatarPreview
                    manifest={manifest}
                    character={character}
                    images={images}
                    size={{ width: responsiveSize(80), height: responsiveSize(80) }}
                />
            </TouchableOpacity>
            <View style={eventModalStyles.headerTextContainer}>
                <Text style={eventModalStyles.title}>{t(displayEventData.event.titleKey, lang)}</Text>
                <Text style={eventModalStyles.subtitle}>{t('event_for', lang)}: <Text style={eventModalStyles.characterName}>{characterDisplayName}</Text></Text>
            </View>
        </View>
        
        <Text style={eventModalStyles.description}>{t(displayEventData.event.descriptionKey, lang, displayEventData.replacements)}</Text>
        
        {!outcome ? (
                <View style={eventModalStyles.choicesContainer}>
                  {displayEventData.event.choices.map((choice, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectChoice(choice)}
                      disabled={!!outcome}
                      style={eventModalStyles.choiceButton}
                    >
                      <View style={eventModalStyles.choiceButtonContent}>
                        <Text style={eventModalStyles.choiceButtonText}>
                          {t(choice.textKey, lang)}
                          {choice.effect.triggers && choice.effect.triggers.length > 0 && (
                            <Text style={eventModalStyles.choiceTriggerText}>
                              {`(${choice.effect.triggers.map((trigger, idx) => {
                                const triggeredEvent = getAllEvents().find(e => e.id === trigger.eventId);
                                if (!triggeredEvent) return null;
                                const triggerText = t(triggeredEvent.titleKey, lang);
                                return `${Math.round(trigger.chance * 100)}% ${triggerText}${idx < choice.effect.triggers!.length - 1 ? ', ' : ''}`;
                              }).filter(Boolean).join(', ')})`}
                            </Text>
                          )}
                        </Text>
                      </View>
                      {choice.effect.fundChange && choice.effect.fundChange !== 0 && (
                          <Text style={[eventModalStyles.fundChangeText, choice.effect.fundChange > 0 ? eventModalStyles.fundChangePositive : eventModalStyles.fundChangeNegative]}>
                              {choice.effect.fundChange > 0 ? '+' : ''}${Math.abs(choice.effect.fundChange).toLocaleString()}
                          </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
            ) : (
                <View style={eventModalStyles.outcomeContainer}>
                    <Text style={eventModalStyles.outcomeMessage}>"{t(outcome.logKey, lang, { name: characterDisplayName })}"</Text>
                    <View style={eventModalStyles.outcomeDetails}>
                        {outcome.fundChange && (
                            <View style={eventModalStyles.fundChangeDetail}>
                                <MoneyIcon />
                                <Text style={[eventModalStyles.fundChangeDetailText, outcome.fundChange > 0 ? eventModalStyles.fundChangePositive : eventModalStyles.fundChangeNegative]}>{t('family_fund_label', lang)}: {outcome.fundChange > 0 ? '+' : ''}${outcome.fundChange.toLocaleString()}</Text>
                            </View>
                        )}
                        {outcome.statChanges && Object.entries(outcome.statChanges).map(([stat, change]) => {
                            if (change === 0) return null;
                            const key = stat as keyof Stats;
                            const initialValue = initialCharacterState.stats[key];
                            const finalValue = initialValue + change;
                            return (
                                <StatBar
                                    key={stat}
                                    Icon={statIcons[stat] || IqIcon}
                                    label={statLabels[stat]}
                                    
                                    value={finalValue}
                                    max={stat === 'iq' ? 200 : 100}
                                    color={'#cbd5e1'}
                                 />
                            );
                        })}
                    </View>
                     <TouchableOpacity
                            onPress={() => {
                                clearTimer();
                                const isNewEventPending = eventData.event.id !== displayEventData.event.id || eventData.characterId !== displayEventData.characterId;
                                if (isNewEventPending) {
                                    setDisplayEventData(eventData);
                                    setInitialCharacterState(character);
                                    setOutcome(null);
                                } else {
                                    onClose();
                                }
                            }}
                            onPressIn={handleOkPressIn}
                            onPressOut={handleOkPressOut}
                            activeOpacity={1}
                        >
                            <Animated.View style={[eventModalStyles.okButton, okButtonAnimatedStyle]}>
                                <Text style={eventModalStyles.okButtonText}>OK</Text>
                            </Animated.View>
                        </TouchableOpacity>
                </View>
            )}
      </ComicPanelModal>)
};

const eventModalStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarButton: {
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: responsiveFontSize(22),
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    subtitle: {
        fontSize: responsiveFontSize(14),
        color: '#475569', // slate-600
    },
    characterName: {
        fontWeight: 'bold',
    },
    description: {
        fontSize: responsiveFontSize(16),
        color: '#333',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    choicesContainer: {
        // space-y-3
    },
    choiceButton: {
        backgroundColor: '#f1f5f9', // slate-100
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderBottomWidth: 4,
        borderColor: '#e2e8f0', // slate-200
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choiceButtonContent: {
        flex: 1,
    },
    choiceButtonText: {
        fontSize: responsiveFontSize(16),
        fontWeight: 'bold',
        color: '#333',
        flexWrap: 'wrap',
    },
    choiceTriggerText: {
        fontSize: responsiveFontSize(12),
        color: '#64748b', // slate-500
    },
    fundChangeText: {
        fontSize: responsiveFontSize(14),
        fontWeight: 'bold',
        marginLeft: 8,
    },
    fundChangePositive: {
        color: '#22c55e', // green-600
    },
    fundChangeNegative: {
        color: '#ef4444', // red-500
    },
    outcomeContainer: {
        // space-y-4
    },
    outcomeMessage: {
        fontSize: responsiveFontSize(16),
        fontStyle: 'italic',
        color: '#475569', // slate-600
        marginBottom: 16,
    },
    outcomeDetails: {
        marginBottom: 20,
    },
    fundChangeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fundChangeDetailText: {
        marginLeft: 8,
        fontSize: responsiveFontSize(14),
        fontWeight: 'bold',
    },
    okButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 12,
        borderRadius: 8,
        borderBottomWidth: 4,
        borderColor: '#3b82f6', // blue-500
        alignItems: 'center',
        marginTop: 16,
    },
    okButtonText: {
        color: 'white',
        fontSize: responsiveFontSize(16),
        fontWeight: 'bold',
    },
});
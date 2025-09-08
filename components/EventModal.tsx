import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import type { Character, GameEvent, EventChoice, EventEffect, Manifest, Language, Stats } from '../core/types';
import { getAllEvents } from '../core/gameData';
import { t } from '../core/localization';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { StatBar } from './ui'; // StatBar is in ui.tsx
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon, MoneyIcon } from './icons';

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
    <View style={eventModalStyles.overlay}>
        <BlurView
            style={eventModalStyles.absolute}
            blurType="dark"
            blurAmount={10}
        />
      <View style={eventModalStyles.modalContainer}>
        <View style={eventModalStyles.header}>
            <TouchableOpacity onPress={() => onAvatarClick(character)} style={eventModalStyles.avatarButton}>
                <AgeAwareAvatarPreview
                    manifest={manifest}
                    character={character}
                    images={images}
                    size={{ width: 80, height: 80 }}
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
                                    initialValue={initialValue}
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
        </View>
      </View>
  );
};

const eventModalStyles = StyleSheet.create({
    overlay: {
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
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90%',
        overflow: 'hidden',
        padding: 16,
        transform: [{ rotate: '2deg' }],
    },
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    subtitle: {
        fontSize: 14,
        color: '#475569', // slate-600
    },
    characterName: {
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    choiceTriggerText: {
        fontSize: 12,
        color: '#64748b', // slate-500
    },
    fundChangeText: {
        fontSize: 14,
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
        fontSize: 16,
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
        fontSize: 14,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
});
// NOTE: This file has been converted from web-based React to React Native.
// Styling (Tailwind CSS classes) has been removed and needs to be re-implemented using React Native's StyleSheet.
// Some web-specific features (like custom CSS properties in style objects) have been removed or simplified.

import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For select/option/optgroup replacement

import type { Character, GameState, GameEvent, EventChoice, SchoolOption, PurchasedAsset, UniversityMajor, EventEffect, Business, GameLogEntry, Manifest, Stats, AssetDefinition } from '../core/types';
import { IqIcon, HappinessIcon, eqIcon, HealthIcon, SkillIcon, MaleIcon, FemaleIcon, MoneyIcon, getPetIcon, RobotIcon, UpgradeIcon, RobotAvatarIcon } from './icons';
import { Gender, RelationshipStatus, CharacterStatus, LifePhase } from '../core/types';
import { CAREER_LADDER, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, PET_DATA, EVENTS, VOCATIONAL_TRAINING, ASSET_DEFINITIONS } from '../core/constants';
import { CLUBS } from '../core/clubsAndEventsData';
import { SCENARIOS } from '../core/scenarios';
import { Language, t, displayPhase, displayStatus, displayRelationshipStatus } from '../core/localization';
import { getCharacterDisplayName, calculateEmployeeSalary } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { BusinessMap } from './BusinessMap';
interface LocalizedProps {
    lang: Language;
}

interface StatBarProps {
  Icon: React.ElementType;
  value: number; // This will be the FINAL value
  max: number;
  label: string;
  color: string;
  // Optional for animation
  initialValue?: number;
}

// Particle type definition
type Particle = {
  id: number;
  type: 'sparkle' | 'smoke';
  style: object; // Changed from React.CSSProperties to object
};

const StatBar: React.FC<StatBarProps> = ({ Icon, value, max, label, color, initialValue }) => {
    const isAnimated = typeof initialValue === 'number';
    const [animatedWidth, setAnimatedWidth] = React.useState(isAnimated ? (initialValue / max) * 100 : (value / max) * 100);
    const [particles, setParticles] = React.useState<Particle[]>([]);

    React.useEffect(() => {
        if (isAnimated && typeof initialValue === 'number') {
            const timer = setTimeout(() => {
                setAnimatedWidth((value / max) * 100);

                // Particle generation
                const change = value - initialValue;
                if (change !== 0) {
                    const newParticles: Particle[] = [];
                    const particleType = change > 0 ? 'sparkle' : 'smoke';
                    const numParticles = Math.min(Math.abs(Math.round(change)), 10); // Max 10 particles
                    
                    for (let i = 0; i < numParticles; i++) {
                        const startXPercent = (initialValue / max) * 100;
                        const endXPercent = (value / max) * 100;
                        const particleStartX = Math.random() * Math.abs(endXPercent - startXPercent) + Math.min(startXPercent, endXPercent);
                        
                        newParticles.push({
                            id: Math.random(),
                            type: particleType,
                            style: {
                                left: `${particleStartX}%`,
                                // Removed web-specific CSS variables: '--x-end', '--y-end', 'animationDelay'
                            },
                        });
                    }
                    setParticles(newParticles);
                    // Cleanup particles after animation
                    const particleTimer = setTimeout(() => setParticles([]), 1000);
                    return () => clearTimeout(particleTimer);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isAnimated, value, initialValue, max]);

    // Regular, non-animated StatBar used in the Character Detail Modal
    if (!isAnimated) {
        const displayValue = Math.round(value);
        return (
            <View style={statBarStyles.container}>
                <Icon />
                <Text style={statBarStyles.label}>{label}</Text>
                <View style={statBarStyles.barBackground}>
                    <View style={[statBarStyles.barFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]}></View>
                </View>
                <Text style={statBarStyles.value}>{displayValue}</Text>
            </View>
        );
    }

    // Animated StatBar for the Event Outcome Modal
    const displayFinalValue = Math.round(value);
    const displayInitialValue = Math.round(initialValue);
    const displayChange = displayFinalValue - displayInitialValue;
    const changeColorStyle = displayChange >= 0 ? statBarStyles.changePositive : statBarStyles.changeNegative;
    const barColorStyle = displayChange >= 0 ? statBarStyles.barPositive : statBarStyles.barNegative;
    
    return (
        <View style={statBarStyles.container}>
            <Icon />
            <Text style={statBarStyles.label}>{label}</Text>
            <View style={statBarStyles.barBackground}>
                <View
                    style={[statBarStyles.barFill, { width: `${animatedWidth}%` }, barColorStyle]}
                />
                <View style={statBarStyles.particlesContainer}>
                    {particles.map(p => (
                        <View key={p.id} style={[statBarStyles.particle, p.style]} />
                    ))}
                </View>
            </View>
            <Text style={statBarStyles.value}>{displayFinalValue}</Text>
            <Text style={[statBarStyles.changeText, changeColorStyle]}>
                ({displayChange >= 0 ? `+${displayChange}` : displayChange})
            </Text>
        </View>
    );
};


interface CharacterNodeProps extends LocalizedProps {
    character: Character;
    onClick: () => void;
    images: Record<string, HTMLImageElement>;
    manifest: Manifest;
}

export const CharacterNode: React.FC<CharacterNodeProps> = ({ character, onClick, lang, images, manifest }) => {
  const isPlayerLineage = character.isPlayerCharacter;
  const { isAlive, gender, age, monthlyNetIncome } = character;
  const displayName = getCharacterDisplayName(character, lang);

  // Lặp mỗi 4s nếu còn sống
  const [showMoney, setShowMoney] = React.useState(false);
  const [effectKey, setEffectKey] = React.useState(0);

  React.useEffect(() => {
    if (!isAlive) return;
    const intervalId = setInterval(() => {
      setShowMoney(true);
      setEffectKey(k => k + 1);
      const hide = setTimeout(() => setShowMoney(false), 1200);
      // dọn dẹp timeout lần gần nhất khi unmount
      return () => clearTimeout(hide);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [isAlive]);

  const nodeBgColorStyle = !isAlive ? characterNodeStyles.nodeBgDeceased : characterNodeStyles.nodeBgAlive;
  const borderColorStyle = isPlayerLineage ? characterNodeStyles.borderPlayer : characterNodeStyles.borderNormal;
  const grayscaleStyle = !isAlive ? characterNodeStyles.grayscale : null;
  const netIncomeColorStyle = monthlyNetIncome >= 0 ? characterNodeStyles.netIncomePositive : characterNodeStyles.netIncomeNegative;
  const netIncomeSign = monthlyNetIncome > 0 ? '+' : '';

  return (
    <TouchableOpacity onPress={onClick} style={[characterNodeStyles.container, borderColorStyle, nodeBgColorStyle]}>
      <View style={characterNodeStyles.avatarWrapper}>
        {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
          <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{ width: 96, height: 96 }} style={grayscaleStyle} />
        ) : (
          gender === Gender.Male ? <MaleIcon /> : <FemaleIcon />
        )}
        {isAlive && (
          <Text style={characterNodeStyles.ageText}>
            {age}
          </Text>
        )}
      </View>

      <Text style={characterNodeStyles.displayNameText}>
        {displayName}
      </Text>

      {isAlive && (
        <View style={characterNodeStyles.netIncomeWrapper}>
          <Text style={[characterNodeStyles.netIncomeText, netIncomeColorStyle]}>
            {netIncomeSign}${Math.round(monthlyNetIncome).toLocaleString()}/mo
          </Text>

          {showMoney && (
            <View key={effectKey} style={characterNodeStyles.netIncomeEffect}>
              <Text style={[characterNodeStyles.netIncomeEffectText, netIncomeColorStyle]}>
                {netIncomeSign}{Math.round(monthlyNetIncome).toLocaleString()}$
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};



interface CharacterDetailModalProps extends LocalizedProps {
    character: Character;
    gameState: GameState;
    onClose: () => void;
    onCustomize: (characterId: string) => void;
    images: Record<string, HTMLImageElement>; // HTMLImageElement might need to be ImageSourcePropType
    manifest: Manifest;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, gameState, onClose, onCustomize, images, manifest, lang }) => {
    const [activeDetailTab, setActiveDetailTab] = React.useState('details');
    const displayName = getCharacterDisplayName(character, lang);
    const partner = character.partnerId ? gameState.familyMembers[character.partnerId] : null;
    const partnerDisplayName = partner ? getCharacterDisplayName(partner, lang) : '';

    const educationText = character.universityDegree ? t(character.universityDegree, lang) : (character.schoolHistory && character.schoolHistory.length > 0 ? t('education_some_school', lang) : t('education_none', lang));
    const career = character.careerTrack && character.careerLevel !== undefined ? CAREER_LADDER[character.careerTrack]?.levels[character.careerLevel] : null;
    const businessRole = character.businessId && character.businessSlotIndex !== undefined ? gameState.familyBusinesses[character.businessId]?.slots[character.businessSlotIndex] : null;
    const pet = character.petId ? PET_DATA[character.petId] : null;

    return (
        <View style={characterDetailModalStyles.overlay}>
            <View style={characterDetailModalStyles.modalContainer}>
                <View style={characterDetailModalStyles.header}>
                    <View>
                        <Text style={characterDetailModalStyles.title}>
                            {displayName} (G{character.generation})
                        </Text>
                        <TouchableOpacity onPress={onClose} style={characterDetailModalStyles.closeButton}><Text style={characterDetailModalStyles.closeButtonText}>&times;</Text></TouchableOpacity>
                    </View>

                    <View style={characterDetailModalStyles.tabContainer}>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('details')}
                            style={[characterDetailModalStyles.tabButton, activeDetailTab === 'details' && characterDetailModalStyles.tabButtonActive]}
                        >
                            <Text style={[characterDetailModalStyles.tabButtonText, activeDetailTab === 'details' && characterDetailModalStyles.tabButtonTextActive]}>
                                {t('tab_details', lang)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('events')}
                            style={[characterDetailModalStyles.tabButton, activeDetailTab === 'events' && characterDetailModalStyles.tabButtonActive]}
                        >
                            <Text style={[characterDetailModalStyles.tabButtonText, activeDetailTab === 'events' && characterDetailModalStyles.tabButtonTextActive]}>
                                {t('tab_life_events', lang)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeDetailTab === 'details' && (
                    <ScrollView style={characterDetailModalStyles.detailsContent}>
                        <View style={characterDetailModalStyles.detailsSection}>
                            <View style={characterDetailModalStyles.avatarSection}>
                                {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
                                    <AgeAwareAvatarPreview
                                        manifest={manifest}
                                        character={character}
                                        images={images}
                                        size={{ width: 128, height: 128 }}
                                    />
                                ) : null}
                            </View>

                            <View style={characterDetailModalStyles.infoSection}>
                                <View>
                                    <Text style={characterDetailModalStyles.infoText}>{displayPhase(character.phase, lang)} | {displayStatus(character.status, lang)}</Text>
                                    <Text style={characterDetailModalStyles.infoText}>{character.isAlive ? `${character.age} ${t('age_short', lang)}` : `${t('deceased_at', lang)} ${character.age}`}</Text>
                                </View>

                                <Text style={characterDetailModalStyles.infoText}>{t('relationship_label', lang)}: {displayRelationshipStatus(character.relationshipStatus, lang)}{partner ? ` ${t('with_person', lang)} ${partnerDisplayName}`: ''}</Text>
                            </View>
                        </View>

                        {pet && <Text style={characterDetailModalStyles.infoText}>{getPetIcon(pet.type)} {t('pet_label', lang)}: {pet.name} {t('the_pet_type', lang)} {t(PET_DATA[pet.type].nameKey, lang)}</Text>}

                        <Text style={characterDetailModalStyles.infoText}>{t('education_label', lang)}: {educationText}</Text>
                        {character.major && <Text style={characterDetailModalStyles.infoText}>{t('major_label', lang)}: {t(character.major, lang)}</Text>}
                        {career && <Text style={characterDetailModalStyles.infoText}>{t('career_label', lang)}: {t(career.titleKey, lang)} (${career.salary.toLocaleString()}/yr)</Text>}
                        {businessRole && <Text style={characterDetailModalStyles.infoText}>{t('working_at_label', lang)}: {businessRole.businessName} ({businessRole.role})</Text>}

                        {character.currentClubs && character.currentClubs.length > 0 && (
                            <View style={characterDetailModalStyles.section}>
                                <Text style={characterDetailModalStyles.sectionTitle}>{t('clubs_label', lang)}:</Text>
                                <View style={characterDetailModalStyles.sectionContent}>
                                    {character.currentClubs.map(clubId => {
                                        const club = CLUBS.find(c => c.id === clubId);
                                        return club ? <Text key={clubId} style={characterDetailModalStyles.sectionItem}>{t(club.nameKey, lang)}</Text> : null;
                                    }) }
                                </View>
                            </View>
                        )}

                        {character.completedOneTimeEvents && character.completedOneTimeEvents.length > 0 && (
                            <View style={characterDetailModalStyles.section}>
                                <Text style={characterDetailModalStyles.sectionTitle}>{t('life_events_label', lang)}:</Text>
                                <View style={characterDetailModalStyles.sectionContent}>
                                    {character.completedOneTimeEvents.map((eventId, index) => {
                                        const event = EVENTS.find(e => e.id === eventId);
                                        return event ? <Text key={`${eventId}-${index}`} style={characterDetailModalStyles.sectionItem}>{t(event.titleKey, lang)}</Text> : null;
                                    }) }
                                </View>
                            </View>
                        )}

                        {character.isAlive && (
                            <View style={characterDetailModalStyles.statsSection}>
                                <StatBar Icon={IqIcon} value={character.stats.iq} max={200} label="IQ" color="#60a5fa" /> {/* blue-400 */}
                                <StatBar Icon={HappinessIcon} value={character.stats.happiness} max={100} label={t('stat_happiness', lang)} color="#facc15" /> {/* yellow-400 */}
                                <StatBar Icon={eqIcon} value={character.stats.eq} max={100} label={t('stat_eq', lang)} color="#a78bfa" /> {/* purple-400 */}
                                <StatBar Icon={HealthIcon} value={character.stats.health} max={100} label={t('stat_health', lang)} color="#f87171" /> {/* red-400 */}
                                {character.age >= 18 && <StatBar Icon={SkillIcon} value={character.stats.skill} max={100} label={t('stat_skill', lang)} color="#4ade80" />} {/* green-400 */}
                            </View>
                        )}
                        {!character.staticAvatarUrl && (
                            <View style={characterDetailModalStyles.customizeButtonContainer}>
                                <TouchableOpacity onPress={() => onCustomize(character.id)} style={characterDetailModalStyles.customizeButton}>
                                    <Text style={characterDetailModalStyles.customizeButtonText}>
                                        Customize
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                )}

                {activeDetailTab === 'events' && (
                    <ScrollView style={characterDetailModalStyles.eventsContent}>
                        <GameLog
                            log={gameState.gameLog.filter(entry => entry.characterId === character.id)}
                            lang={lang}
                            familyMembers={gameState.familyMembers}
                        />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};




interface FamilyTreeProps extends LocalizedProps {
  characterId: string;
  allMembers: Record<string, Character>;
  onAvatarClick: (character: Character) => void;
  images: Record<string, HTMLImageElement>; // HTMLImageElement might need to be ImageSourcePropType
  manifest: Manifest;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ characterId, allMembers, onAvatarClick, lang, images, manifest }) => {
    const character = allMembers[characterId];
    if (!character) return null;

    const partner = character.partnerId ? allMembers[character.partnerId] : null;
    const children = character.childrenIds.map(id => allMembers[id]).filter(Boolean);

    return (
        <View style={familyTreeStyles.familyTreeContainer}>
            {/* Parents Node */}
            <View style={familyTreeStyles.parentsNode}>
                <CharacterNode character={character} onClick={() => onAvatarClick(character)} lang={lang} images={images} manifest={manifest} />
                {partner && character.relationshipStatus === RelationshipStatus.Married && (
                    <>
                        {/* Spouse Connector */}
                        <View style={familyTreeStyles.spouseConnector}>
                            <View style={familyTreeStyles.spouseConnectorVertical} />
                        </View>
                        <CharacterNode character={partner} onClick={() => onAvatarClick(partner)} lang={lang} images={images} manifest={manifest} />
                    </>
                )}
            </View>

            {/* Children Branch */}
            {children.length > 0 && (
                <View style={familyTreeStyles.childrenBranch}>
                    {/* Vertical line from parent(s) center */}
                    <View style={familyTreeStyles.childrenVerticalLine} />

                    {/* Children nodes container */}
                    <View style={familyTreeStyles.childrenNodesContainer}>
                        {children.map((child, index) => (
                            <View key={child.id} style={familyTreeStyles.childNodeWrapper}>
                                {/* Connector from child up to horizontal line */}
                                <View style={familyTreeStyles.childConnectorVertical} />
                                {/* Horizontal line segment - this might need more complex positioning */}
                                {/* For simplicity, I'll just add a small horizontal line for now */}
                                {children.length > 1 && (
                                    <View style={[familyTreeStyles.childConnectorHorizontal, { width: index === 0 || index === children.length - 1 ? '50%' : '100%', left: index === 0 ? '50%' : 0, right: index === children.length - 1 ? '50%' : 0 }]} />
                                )}
                                <FamilyTree characterId={child.id} allMembers={allMembers} onAvatarClick={onAvatarClick} lang={lang} images={images} manifest={manifest} />
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};


interface EventModalProps extends LocalizedProps {
  eventData: { characterId: string; event: GameEvent; replacements?: Record<string, string | number> };
  character: Character;
  onChoice: (choice: EventChoice) => void;
  onClose: () => void;
  images: Record<string, HTMLImageElement>; // HTMLImageElement might need to be ImageSourcePropType
  manifest: Manifest;
  onAvatarClick: (character: Character) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ eventData, character, onChoice, onClose, lang, images, manifest, onAvatarClick }) => {
  const [initialCharacterState, setInitialCharacterState] = React.useState(character);
  const [displayEventData, setDisplayEventData] = React.useState(eventData);
  const [outcome, setOutcome] = React.useState<EventEffect | null>(null);

  const timerRef = React.useRef<number | null>(null);
  const characterDisplayName = getCharacterDisplayName(character, lang);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    // This effect handles the transition to a triggered event
    if (eventData.event.id !== displayEventData.event.id || eventData.characterId !== displayEventData.characterId) {
      clearTimer(); // A new event is coming, cancel any pending close

      // Wait for the outcome of the previous choice to be visible
      timerRef.current = setTimeout(() => { // Changed window.setTimeout to setTimeout
        setDisplayEventData(eventData);
        setInitialCharacterState(character); // Capture new character state for next event
        setOutcome(null);
      }, 2500);
    }

    // Cleanup timer on unmount
    return () => clearTimer();
  }, [eventData, displayEventData, character]);

  const handleSelectChoice = (choice: EventChoice) => {
    if (outcome) return;
    setOutcome(choice.effect);
    onChoice(choice);
    // No longer auto-closes here
  };
  
  React.useEffect(() => {
    if (outcome) {
      timerRef.current = setTimeout(() => { // Changed window.setTimeout to setTimeout
        onClose();
      }, 10000); // 10 seconds
      return () => clearTimeout(timerRef.current!);
    }
  }, [outcome, onClose]);

  const statIcons: Record<string, React.ElementType> = {
    iq: IqIcon,
    happiness: HappinessIcon,
    eq: eqIcon,
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
                              (
                              {choice.effect.triggers.map((trigger, idx) => {
                                const triggeredEvent = EVENTS.find(e => e.id === trigger.eventId);
                                if (!triggeredEvent) return null;
                                const triggerText = t(triggeredEvent.titleKey, lang);
                                return `${Math.round(trigger.chance * 100)}% ${triggerText}${idx < choice.effect.triggers!.length - 1 ? ', ' : ''}`;
                              }).filter(Boolean).join(', ')}
                              )
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
                            if (change === 0) return null; // Don't show bars for no change
                            const key = stat as keyof typeof initialCharacterState.stats;
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
                                    color={'#cbd5e1'} // slate-300, base color, animation handles the rest
                                 />
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            clearTimer();
                            const isNewEventPending = eventData.event.id !== displayEventData.event.id || eventData.characterId !== displayEventData.characterId;
                            if (isNewEventPending) {
                                // A new event is waiting. Fast-forward to it.
                                setDisplayEventData(eventData);
                                setInitialCharacterState(character);
                                setOutcome(null);
                            } else {
                                // No new event, safe to close.
                                onClose();
                            }
                        }}
                        style={eventModalStyles.okButton}
                    >
                        <Text style={eventModalStyles.okButtonText}>
                            OK
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
      </View>
  );
};


interface GameLogProps extends LocalizedProps {
  log: GameLogEntry[];
  familyMembers: Record<string, Character>;
}

const LogStatChanges: React.FC<{ entry: GameLogEntry, lang: Language }> = ({ entry }) => {
    const { statChanges, fundChange } = entry;
    const allChanges: React.ReactNode[] = [];

    if (fundChange && fundChange !== 0) {
        const value = Math.round(fundChange);
        const sign = value > 0 ? '+' : '';
        const colorStyle = value > 0 ? logStatChangesStyles.positiveChange : logStatChangesStyles.negativeChange;
        allChanges.push(
            <Text key="fund" style={[logStatChangesStyles.changeText, colorStyle]}>
                <MoneyIcon /> {sign}${Math.abs(value).toLocaleString()}
            </Text>
        );
    }

    if (statChanges) {
        const statIconMap: Record<keyof Stats, React.ElementType> = {
            iq: IqIcon,
            happiness: HappinessIcon,
            eq: eqIcon,
            health: HealthIcon,
            skill: SkillIcon,
        };

        for (const [stat, change] of Object.entries(statChanges)) {
            if (change === 0 || change === undefined) continue;
            const Icon = statIconMap[stat as keyof Stats];
            if (!Icon) continue;

            const value = Math.round(change);
            const sign = value > 0 ? '+' : '';
            const colorStyle = value > 0 ? logStatChangesStyles.positiveChange : logStatChangesStyles.negativeChange;
            allChanges.push(
                <Text key={stat} style={[logStatChangesStyles.changeText, colorStyle]}>
                    <Icon /> {sign}{value}
                </Text>
            );
        }
    }

    if (allChanges.length === 0) {
        return null;
    }

    return (
        <View style={logStatChangesStyles.container}>
            {allChanges}
        </View>
    );
};

const GameLogInternal: React.FC<GameLogProps> = ({ log, lang, familyMembers }) => {
  return (
    <ScrollView style={gameLogStyles.scrollView}>
      <Text style={gameLogStyles.title}>{t('family_log_title', lang)}</Text>
      <View style={gameLogStyles.logContainer}>
        {log.map((entry, index) => {
          // New detailed format
          if (entry.eventTitleKey && entry.characterId) {
            const character = familyMembers[entry.characterId];
            const characterName = character ? getCharacterDisplayName(character, lang) : (entry.replacements?.name || 'Unknown');
            const eventName = t(entry.eventTitleKey, lang);

            return (
              <View key={index} style={gameLogStyles.logEntry}>
                <Text style={gameLogStyles.logEntryYear}>{t('year_label', lang)} {entry.year}</Text>
                <View style={gameLogStyles.logEntryContent}>
                    <Text style={gameLogStyles.logEntryText}>
                        <Text style={gameLogStyles.logEntryCharacterName}>{characterName}:</Text>
                        <Text style={gameLogStyles.logEntryEventName}> {eventName}</Text>
                    </Text>
                    <Text style={gameLogStyles.logEntryMessage}>↳ {t(entry.messageKey, lang, entry.replacements)}</Text>
                    <LogStatChanges entry={entry} lang={lang} />
                </View>
              </View>
            );
          }

          // Fallback for old format
          return (
            <View key={index} style={gameLogStyles.logEntry}>
               <Text style={gameLogStyles.logEntryText}>
                  <Text style={gameLogStyles.logEntryYear}>{t('year_label', lang)} {entry.year}:</Text>
                  <Text style={gameLogStyles.logEntryMessage}> {t(entry.messageKey, lang, entry.replacements)}</Text>
               </Text>
               <LogStatChanges entry={entry} lang={lang} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
export const GameLog = React.memo(GameLogInternal);

interface SummaryScreenProps extends LocalizedProps {
  gameState: GameState;
  onRestart: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ gameState, onRestart, lang }) => {
  const livingMembers = Object.values(gameState.familyMembers).filter((m: Character) => m.isAlive).length;
  const deceasedMembers = Object.values(gameState.familyMembers).filter((m: Character) => !m.isAlive).length;
  const isVictory = gameState.gameOverReason === 'victory';
  
  let descriptionKey = 'summary_gameover_desc';
  if (isVictory) {
      descriptionKey = 'summary_victory_desc';
  } else if (gameState.gameOverReason === 'debt') {
      descriptionKey = 'summary_gameover_desc_debt';
  }

  return (
    <View style={summaryScreenStyles.container}>
      <View style={summaryScreenStyles.contentWrapper}>
        <View style={summaryScreenStyles.content}>
            <Text style={summaryScreenStyles.title}>{isVictory ? t('summary_victory_title', lang) : t('summary_gameover_title', lang)}</Text>
            <Text style={summaryScreenStyles.description}>
                {t(descriptionKey, lang)}
            </Text>
            
            <View style={summaryScreenStyles.statsContainer}>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_generations', lang)}:</Text> {isVictory ? '6' : Object.values(gameState.familyMembers).reduce((max, m: Character) => Math.max(max, m.generation), 0)}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_total_members', lang)}:</Text> {gameState.totalMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_living_members', lang)}:</Text> {livingMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_deceased_members', lang)}:</Text> {deceasedMembers}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_education', lang)}:</Text> {gameState.highestEducation}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_highest_career', lang)}:</Text> {gameState.highestCareer}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_final_funds', lang)}:</Text> ${gameState.familyFund.toLocaleString()}</Text>
               <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_asset_value', lang)}:</Text> ${gameState.purchasedAssets.reduce((sum, a) => sum + (ASSET_DEFINITIONS[a.id]?.cost || 0), 0).toLocaleString()}</Text>
              <Text style={summaryScreenStyles.statItem}><Text style={summaryScreenStyles.statLabel}>{t('summary_ending_year', lang)}:</Text> {gameState.currentDate.year}</Text>
            </View>

            <TouchableOpacity onPress={onRestart} style={summaryScreenStyles.restartButton}>
              <Text style={summaryScreenStyles.restartButtonText}>
                {t('play_again_button', lang)}
              </Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface StartMenuProps extends LocalizedProps {
  onStart: (mode: string) => void;
  onShowInstructions: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, lang }) => (
    <View style={styles.startMenuContainer}>
        <Text style={styles.gameTitle}>{t('game_title', lang)}</Text>
        <Text style={styles.gameSubtitle}>{t('game_subtitle', lang)}</Text>
        <View style={styles.scenarioList}>
            {SCENARIOS.map((scenario, i) => (
                <TouchableOpacity
                    key={scenario.id}
                    onPress={() => onStart(scenario.id)}
                    style={styles.scenarioButton}
                >
                    <View>
                        <Text style={styles.scenarioName}>{t(scenario.nameKey, lang)}</Text>
                        <Text style={styles.scenarioDescription}>{t(scenario.descriptionKey, lang)}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
        <TouchableOpacity
            onPress={onShowInstructions}
            style={styles.howToPlayButton}
        >
            <Text style={styles.howToPlayButtonText}>
                {t('how_to_play_button', lang)}
            </Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    startMenuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    gameTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
        marginBottom: 8,
    },
    gameSubtitle: {
        fontSize: 18,
        color: '#4b5563', // slate-600
        marginBottom: 32,
    },
    scenarioList: {
        width: '100%',
        marginBottom: 24,
    },
    scenarioButton: {
        backgroundColor: '#f1f5f9', // slate-100
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderBottomWidth: 4,
        borderColor: '#e2e8f0', // slate-200
    },
    scenarioName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    scenarioDescription: {
        fontSize: 14,
        color: '#64748b', // slate-500
        marginTop: 4,
    },
    howToPlayButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    howToPlayButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // ... existing styles for InstructionsModal
    modalOverlay: {
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
    comicPanelWrapper: {
        // Removed web-specific --rotate style
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 32,
        maxWidth: 768, // max-w-2xl (32rem * 16px/rem = 512px, but 2xl is 42rem = 672px, let's use 768 for a bit more space)
        width: '100%',
        position: 'relative',
        borderRadius: 8, // Example, adjust as needed
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    closeButtonText: {
        fontSize: 32, // text-4xl
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    instructionsTitle: {
        fontSize: 28, // text-3xl
        fontWeight: 'bold',
        color: '#60a5fa', // blue-400
        marginBottom: 16,
    },
    instructionsContent: {
        // space-y-3
    },
    instructionsParagraph: {
        fontSize: 14, // text-base
        color: '#475569', // slate-600
        marginBottom: 12, // space-y-3 equivalent
    },
    instructionsStrong: {
        fontWeight: 'bold',
    },
});

interface InstructionsModalProps extends LocalizedProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose, lang }) => (
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.comicPanelWrapper}>
            <View style={styles.comicPanel}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>&times;</Text>
                </TouchableOpacity>
                <Text style={styles.instructionsTitle}>{t('instructions_title', lang)}</Text>
                <View style={styles.instructionsContent}>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_objective_title', lang)}:</Text> {t('instructions_objective_desc', lang)}</Text>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_gameplay_title', lang)}:</Text> {t('instructions_gameplay_desc', lang)}</Text>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_events_title', lang)}:</Text> {t('instructions_events_desc', lang)}</Text>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_stats_title', lang)}:</Text> {t('instructions_stats_desc', lang)}</Text>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_phases_title', lang)}:</Text> {t('instructions_phases_desc', lang)}</Text>
                    <Text style={styles.instructionsParagraph}><Text style={styles.instructionsStrong}>{t('instructions_finance_title', lang)}:</Text> {t('instructions_finance_desc', lang)}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);


interface WelcomeBackMenuProps extends LocalizedProps {
  onContinue: () => void;
  onStartNew: () => void;
}

export const WelcomeBackMenu: React.FC<WelcomeBackMenuProps> = ({ onContinue, onStartNew, lang }) => (
    <View style={welcomeBackMenuStyles.container}>
        <Text style={welcomeBackMenuStyles.title}>{t('welcome_back_title', lang)}</Text>
        <Text style={welcomeBackMenuStyles.subtitle}>{t('welcome_back_subtitle', lang)}</Text>
        <View style={welcomeBackMenuStyles.buttonGroup}>
            <TouchableOpacity
                onPress={onContinue}
                style={[welcomeBackMenuStyles.button, welcomeBackMenuStyles.buttonGreen]}
            >
                <Text style={welcomeBackMenuStyles.buttonText}>
                    {t('continue_game_button', lang)}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onStartNew}
                style={[welcomeBackMenuStyles.button, welcomeBackMenuStyles.buttonSlate]}
            >
                <Text style={welcomeBackMenuStyles.buttonText}>
                    {t('start_new_game_button', lang)}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);


interface ModalBaseProps extends LocalizedProps {
    titleKey: string;
    characterName?: string;
    descriptionKey: string;
    descriptionReplacements?: Record<string, string | number>;
    children: React.ReactNode;
}

export const ModalBase: React.FC<ModalBaseProps> = ({titleKey, characterName, descriptionKey, descriptionReplacements, children, lang}) => (
     <View style={modalBaseStyles.overlay}>
        <View style={modalBaseStyles.comicPanelWrapper}>
            <View style={modalBaseStyles.comicPanel}>
                <Text style={modalBaseStyles.title}>{t(titleKey, lang)}</Text>
                {characterName && <Text style={modalBaseStyles.characterNameLabel}>{t('for_char_label', lang)}: <Text style={modalBaseStyles.characterName}>{characterName}</Text></Text>}
                <Text style={modalBaseStyles.description}>{t(descriptionKey, lang, { name: characterName, ...descriptionReplacements })}</Text>
                <View style={modalBaseStyles.childrenContainer}>
                   {children}
                </View>
            </View>
        </View>
    </View>
);

const ChoiceButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({onClick, disabled, children}) => (
     <TouchableOpacity
        onPress={onClick}
        disabled={disabled}
        style={[
            choiceButtonStyles.button,
            disabled && choiceButtonStyles.buttonDisabled,
        ]}
    >
       {children}
    </TouchableOpacity>
);


interface SchoolChoiceModalProps extends LocalizedProps {
    character: Character;
    schoolOptions: SchoolOption[];
    onSelect: (option: SchoolOption) => void;
    currentFunds: number;
}
export const SchoolChoiceModal: React.FC<SchoolChoiceModalProps> = ({ character, schoolOptions, onSelect, currentFunds, lang }) => (
    <ModalBase titleKey="modal_school_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_school_desc" lang={lang}>
        {schoolOptions.map((option, index) => (
            <ChoiceButton key={index} onClick={() => onSelect(option)} disabled={currentFunds < option.cost}>
                <View style={schoolChoiceModalStyles.choiceContent}>
                    <Text style={schoolChoiceModalStyles.choiceName}>{t(option.nameKey, lang)}</Text>
                    <Text style={[schoolChoiceModalStyles.choiceCost, currentFunds >= option.cost ? schoolChoiceModalStyles.costAffordable : schoolChoiceModalStyles.costUnaffordable]}>(-${option.cost.toLocaleString()})</Text>
                </View>
                <Text style={schoolChoiceModalStyles.choiceEffects}>
                    {Object.entries(option.effects).map(([stat, val]) => `${t(`stat_${stat}` as any, lang)} ${val > 0 ? `+${val}` : val}`).join(', ')}
                </Text>
            </ChoiceButton>
        ))}
    </ModalBase>
);

interface UniversityChoiceModalProps extends LocalizedProps {
    character: Character;
    onSelect: (goToUniversity: boolean) => void;
}
export const UniversityChoiceModal: React.FC<UniversityChoiceModalProps> = ({ character, onSelect, lang }) => (
    <ModalBase titleKey="modal_university_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_university_desc" lang={lang}>
        <TouchableOpacity onPress={() => onSelect(true)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonBlue]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_yes', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelect(false)} style={[universityChoiceModalStyles.button, universityChoiceModalStyles.buttonSlate]}>
            <Text style={universityChoiceModalStyles.buttonText}>{t('university_choice_no', lang)}</Text>
        </TouchableOpacity>
    </ModalBase>
);


interface UniversityMajorChoiceModalProps extends LocalizedProps {
    character: Character;
    majors: UniversityMajor[];
    onSelect: (major: UniversityMajor) => void;
    currentFunds: number;
    onAbandon: () => void;
}
export const UniversityMajorChoiceModal: React.FC<UniversityMajorChoiceModalProps> = ({ character, majors, onSelect, currentFunds, lang, onAbandon }) => {
    const allUnaffordable = majors.every(major => currentFunds < major.cost);

    return (
        <ModalBase titleKey="modal_major_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_major_desc" lang={lang}>
            {majors.map((major, index) => (
                <ChoiceButton key={index} onClick={() => onSelect(major)} disabled={currentFunds < major.cost}>
                    <View style={universityMajorChoiceModalStyles.choiceContent}>
                        <Text style={universityMajorChoiceModalStyles.choiceName}>{t(major.nameKey, lang)}</Text>
                        <Text style={[universityMajorChoiceModalStyles.choiceCost, currentFunds >= major.cost ? universityMajorChoiceModalStyles.costAffordable : universityMajorChoiceModalStyles.costUnaffordable]}>(-${major.cost.toLocaleString()})</Text>
                    </View>
                    <Text style={universityMajorChoiceModalStyles.choiceDescription}>{t(major.descriptionKey, lang)}</Text>
                </ChoiceButton>
            ))}
            {allUnaffordable && (
                <View style={universityMajorChoiceModalStyles.unaffordableSection}>
                    <Text style={universityMajorChoiceModalStyles.unaffordableText}>{t('modal_major_no_money', lang)}</Text>
                    <TouchableOpacity onPress={onAbandon} style={[universityMajorChoiceModalStyles.button, universityMajorChoiceModalStyles.buttonSlate]}>
                        <Text style={universityMajorChoiceModalStyles.buttonText}>
                            {t('university_choice_no', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ModalBase>
    );
};

interface CareerChoiceModalProps extends LocalizedProps {
    character: Character;
    options: string[];
    onSelect: (careerTrackKey: string) => void;
    currentFunds: number;
}
export const CareerChoiceModal: React.FC<CareerChoiceModalProps> = ({ character, options, onSelect, currentFunds, lang }) => (
     <ModalBase titleKey="modal_career_title" characterName={getCharacterDisplayName(character, lang)} descriptionKey="modal_career_desc" lang={lang}>
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
    </ModalBase>
);

interface UnderqualifiedChoiceModalProps extends LocalizedProps {
    character: Character;
    careerTrackKey: string;
    onSelect: (isTrainee: boolean) => void;
}
export const UnderqualifiedChoiceModal: React.FC<UnderqualifiedChoiceModalProps> = ({ character, careerTrackKey, onSelect, lang }) => {
    const track = CAREER_LADDER[careerTrackKey];
    if (!track) return null;
    
    return (
        <ModalBase 
            titleKey="modal_underqualified_title" 
            characterName={getCharacterDisplayName(character, lang)} 
            descriptionKey="modal_underqualified_desc"
            descriptionReplacements={{ careerName: t(track.nameKey, lang) }}
            lang={lang}
        >
            <ChoiceButton onClick={() => onSelect(true)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_trainee', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_trainee_desc', lang)}</Text>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <Text style={underqualifiedChoiceModalStyles.choiceTitle}>{t('underqualified_choice_penalized', lang)}</Text>
                <Text style={underqualifiedChoiceModalStyles.choiceDescription}>{t('underqualified_choice_penalized_desc', lang)}</Text>
            </ChoiceButton>
        </ModalBase>
    );
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

interface LoanModalProps extends LocalizedProps {
    onLoanChoice: (amount: number, term: number) => void;
}
export const LoanModal: React.FC<LoanModalProps> = ({ onLoanChoice, lang }) => {
    const amounts = [1000, 10000, 100000, 1000000];
    const terms = [2, 5, 7, 10];
    const [selectedAmount, setSelectedAmount] = React.useState(amounts[0]);
    const [selectedTerm, setSelectedTerm] = React.useState(terms[0]);

    return (
        <View style={loanModalStyles.overlay}>
            <View style={loanModalStyles.comicPanelWrapper}>
                <View style={loanModalStyles.comicPanel}>
                    <Text style={loanModalStyles.title}>{t('modal_loan_title', lang)}</Text>
                    <Text style={loanModalStyles.description}>{t('modal_loan_desc', lang)}</Text>
                    
                    <View style={loanModalStyles.optionsContainer}>
                        <View>
                            <Text style={loanModalStyles.label}>{t('loan_amount_label', lang)}</Text>
                            <View style={loanModalStyles.grid}>
                                {amounts.map(amount => (
                                    <TouchableOpacity 
                                        key={amount}
                                        onPress={() => setSelectedAmount(amount)}
                                        style={[
                                            loanModalStyles.gridButton,
                                            selectedAmount === amount ? loanModalStyles.gridButtonSelected : loanModalStyles.gridButtonNormal
                                        ]}
                                    >
                                        <Text style={loanModalStyles.gridButtonText}>
                                            ${amount.toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View>
                             <Text style={loanModalStyles.label}>{t('loan_term_label', lang)}</Text>
                             <View style={loanModalStyles.grid}>
                                {terms.map(term => (
                                    <TouchableOpacity 
                                        key={term}
                                        onPress={() => setSelectedTerm(term)}
                                        style={[
                                            loanModalStyles.gridButton,
                                            selectedTerm === term ? loanModalStyles.gridButtonSelected : loanModalStyles.gridButtonNormal
                                        ]}
                                    >
                                        <Text style={loanModalStyles.gridButtonText}>
                                            {term}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={() => onLoanChoice(selectedAmount, selectedTerm)} style={[loanModalStyles.chunkyButton, loanModalStyles.chunkyButtonGreen]}>
                        <Text style={loanModalStyles.chunkyButtonText}>
                            {t('accept_loan_button', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

interface BusinessManagementModalProps extends LocalizedProps {
    business: Business;
    gameState: GameState;
    onAssignToBusiness: (businessId: string, slotIndex: number, characterId: string | null) => void;
    onUpgradeBusiness: (businessId: string) => void;
    onClose: () => void;
    images: Record<string, HTMLImageElement>;
    manifest: Manifest;
}

export const BusinessManagementModal: React.FC<BusinessManagementModalProps> = ({
    business,
    gameState,
    onAssignToBusiness,
    onUpgradeBusiness,
    onClose,
    lang,
    images,
    manifest
}) => {
    const businessDef = BUSINESS_DEFINITIONS[business.type];
    if (!businessDef) return null;

    const upgradeCost = businessDef.cost * 0.75;
    const canUpgrade = business.level < 2 && gameState.familyFund >= upgradeCost;

    const availableMembers = Object.values(gameState.familyMembers).filter(char => {
        if (!char.isAlive || char.age < 18 || char.phase === LifePhase.Retired) return false;
        
        const isCurrentlyAssignedHere = business.slots.some(slot => slot.assignedCharacterId === char.id);
        if (isCurrentlyAssignedHere) return true;
        
        const isAvailableForWork = [CharacterStatus.Unemployed, CharacterStatus.Idle, CharacterStatus.Working].includes(char.status);
        
        const isWorkingInAnotherBusiness = Object.values(gameState.familyBusinesses).some(b => 
            b.id !== business.id && b.slots.some(s => s.assignedCharacterId === char.id)
        );

        return isAvailableForWork && !isWorkingInAnotherBusiness;
    });

    const handleAssignmentChange = (slotIndex: number, newCharacterId: string) => {
        if (newCharacterId === 'unassigned') {
            onAssignToBusiness(business.id, slotIndex, null);
        } else if (newCharacterId === 'robot') {
            onAssignToBusiness(business.id, slotIndex, 'robot');
        } else {
            onAssignToBusiness(business.id, slotIndex, newCharacterId);
        }
    };

    return (
        <View style={businessManagementModalStyles.overlay}>
            <View style={businessManagementModalStyles.comicPanelWrapper}>
                <View style={businessManagementModalStyles.comicPanel}>
                    <View style={businessManagementModalStyles.header}>
                        <View>
                            <Text style={businessManagementModalStyles.title}>{t(businessDef.nameKey, lang)}</Text>
                            <Text style={businessManagementModalStyles.levelText}>{t('level_label', lang)}: {business.level}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={businessManagementModalStyles.closeButton}><Text style={businessManagementModalStyles.closeButtonText}>&times;</Text></TouchableOpacity>
                    </View>

                    <ScrollView style={businessManagementModalStyles.slotsContainer}>
                        <Text style={businessManagementModalStyles.sectionTitle}>{t('family_members_label', lang)}</Text>
                        {business.slots.map((slot, index) => {
                             const assignedCharacter = slot.assignedCharacterId && slot.assignedCharacterId !== 'robot' ? gameState.familyMembers[slot.assignedCharacterId] : null;
                             const isRobot = slot.assignedCharacterId === 'robot';
                             const salary = assignedCharacter ? calculateEmployeeSalary(assignedCharacter) : 0;

                             return (
                                <View key={index} style={businessManagementModalStyles.slotItem}>
                                    <View style={businessManagementModalStyles.avatarPlaceholder}>
                                        {assignedCharacter ? (
                                            <AgeAwareAvatarPreview manifest={manifest} character={assignedCharacter} images={images} size={{width: 64, height: 64}} />
                                        ) : isRobot ? (
                                            <RobotAvatarIcon style={businessManagementModalStyles.robotIcon} />
                                        ) : (
                                            <View style={businessManagementModalStyles.emptyAvatar} />
                                        )}
                                    </View>
                                    <View style={businessManagementModalStyles.slotDetails}>
                                        <Text style={businessManagementModalStyles.slotRole}>{t(slot.role, lang)}</Text>
                                        <Text style={businessManagementModalStyles.slotRequirement}>{t('req_major_label', lang)}: {slot.requiredMajor === 'Unskilled' ? t('unskilled_major', lang) : t(slot.requiredMajor, lang)}</Text>
                                        {assignedCharacter && (
                                            <Text style={businessManagementModalStyles.slotSalary}>
                                                {t('salary_label', lang)}: ${salary.toLocaleString()}/mo
                                            </Text>
                                        )}
                                    </View>
                                    <Picker
                                        selectedValue={slot.assignedCharacterId || 'unassigned'}
                                        onValueChange={(itemValue) => handleAssignmentChange(index, itemValue as string)}
                                        style={businessManagementModalStyles.picker}
                                        itemStyle={businessManagementModalStyles.pickerItem}
                                    >
                                        <Picker.Item label={t('unassigned_option', lang)} value="unassigned" />
                                        <Picker.Item label={`${t('hire_robot_option', lang)} (-$${ROBOT_HIRE_COST}/mo)`} value="robot" />
                                        {/* Optgroup is not directly supported in React Native Picker, so we'll just list items */}
                                        {availableMembers.map(char => {
                                            const isMajorMatch = slot.requiredMajor !== 'Unskilled' && char.major === slot.requiredMajor;
                                            return (
                                                <Picker.Item key={char.id} label={`${isMajorMatch ? '⭐ ' : ''}${getCharacterDisplayName(char, lang)} (Skill: ${Math.round(char.stats.skill)})`} value={char.id} />
                                            )
                                        })}
                                    </Picker>
                                </View>
                             )
                        })}
                    </ScrollView>

                    <View style={businessManagementModalStyles.footer}>
                         {business.level < 2 && businessDef.upgradeSlots.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onUpgradeBusiness(business.id)}
                                disabled={!canUpgrade}
                                style={[businessManagementModalStyles.upgradeButton, !canUpgrade && businessManagementModalStyles.upgradeButtonDisabled]}
                            >
                                <UpgradeIcon style={businessManagementModalStyles.upgradeIcon} />
                                <Text style={businessManagementModalStyles.upgradeButtonText}>
                                    {t('upgrade_button', lang)} (-${upgradeCost.toLocaleString()})
                                </Text>
                            </TouchableOpacity>
                         )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const statBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        marginLeft: 4,
        marginRight: 8,
        fontSize: 14,
        color: '#333',
    },
    barBackground: {
        flex: 1,
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginRight: 8,
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    changeText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    changePositive: {
        color: '#22c55e', // green-500
    },
    changeNegative: {
        color: '#ef4444', // red-500
    },
    barPositive: {
        backgroundColor: '#4ade80', // green-400
    },
    barNegative: {
        backgroundColor: '#f87171', // red-400
    },
    particlesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    particle: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'white', // Example, adjust as needed
        opacity: 0, // Will be animated
    },
});

const characterNodeStyles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        margin: 4,
    },
    nodeBgDeceased: {
        backgroundColor: '#e2e8f0', // slate-200
    },
    nodeBgAlive: {
        backgroundColor: 'transparent',
    },
    borderPlayer: {
        borderColor: '#fbbf24', // amber-400
    },
    borderNormal: {
        borderColor: '#cbd5e1', // slate-300
    },
    grayscale: {
        // This would typically be an image style, not a View style.
        // For React Native, you might need to apply a colorFilter or use a specific image processing library
        // if a true grayscale effect is needed. For now, I'll leave it as a placeholder.
        // If AgeAwareAvatarPreview handles image styles, it should be passed there.
    },
    avatarWrapper: {
        position: 'relative',
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageText: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        paddingHorizontal: 4,
        borderRadius: 4,
        fontSize: 12,
    },
    displayNameText: {
        marginTop: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    netIncomeWrapper: {
        position: 'relative',
        marginTop: 2,
        overflow: 'hidden', // To contain the animated money effect
    },
    netIncomeText: {
        fontSize: 12,
        textAlign: 'center',
    },
    netIncomePositive: {
        color: '#22c55e', // green-600
    },
    netIncomeNegative: {
        color: '#ef4444', // red-500
    },
    netIncomeEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        // Animation for this would be handled by Animated API in RN
    },
    netIncomeEffectText: {
        fontSize: 12,
        fontWeight: 'bold',
        // Animation for this would be handled by Animated API in RN
    },
});

const characterDetailModalStyles = StyleSheet.create({
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
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 4,
    },
    tabButtonActive: {
        backgroundColor: '#eff6ff', // blue-50
    },
    tabButtonText: {
        fontSize: 16,
        color: '#475569', // slate-600
    },
    tabButtonTextActive: {
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
    },
    detailsContent: {
        padding: 16,
    },
    eventsContent: {
        flex: 1,
        padding: 16,
    },
    detailsSection: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatarSection: {
        marginRight: 16,
    },
    infoSection: {
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    sectionContent: {
        marginLeft: 8,
    },
    sectionItem: {
        fontSize: 14,
        color: '#555',
    },
    statsSection: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // slate-200
        paddingTop: 16,
    },
    customizeButtonContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    customizeButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    customizeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

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
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90%',
        overflow: 'hidden',
        padding: 16,
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
        alignItems: 'center',
        marginTop: 16,
    },
    okButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const logStatChangesStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    changeText: {
        fontSize: 12,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    positiveChange: {
        color: '#22c55e', // green-600
    },
    negativeChange: {
        color: '#ef4444', // red-600
    },
});

const gameLogStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1e293b', // slate-800
    },
    logContainer: {
        // space-y-4
    },
    logEntry: {
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
    },
    logEntryYear: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b', // slate-500
        marginBottom: 4,
    },
    logEntryContent: {
        marginLeft: 8,
    },
    logEntryText: {
        fontSize: 16,
        color: '#333',
    },
    logEntryCharacterName: {
        fontWeight: 'bold',
    },
    logEntryEventName: {
        fontStyle: 'italic',
    },
    logEntryMessage: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

const summaryScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        padding: 16,
    },
    contentWrapper: {
        // This was a comic-panel-wrapper, might need specific styling if it had visual effects
        // For now, just a container
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        maxWidth: 500,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb', // blue-700
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#475569', // slate-600
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        marginBottom: 24,
        // space-y-2
    },
    statItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    restartButton: {
        backgroundColor: '#60a5fa', // blue-400
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    restartButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

const familyTreeStyles = StyleSheet.create({
    familyTreeContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    parentsNode: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spouseConnector: {
        width: 20, // Horizontal line
        height: 2,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spouseConnectorVertical: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childrenBranch: {
        alignItems: 'center',
        marginTop: 10,
    },
    childrenVerticalLine: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childrenNodesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    childNodeWrapper: {
        alignItems: 'center',
        marginHorizontal: 5,
        position: 'relative',
    },
    childConnectorVertical: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childConnectorHorizontal: {
        height: 2,
        backgroundColor: '#ccc',
        position: 'absolute',
        top: 0,
        // These will be dynamically set based on index
    },
});

const welcomeBackMenuStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center', // Not directly applicable to View, but for Text children
        padding: 16,
    },
    title: {
        fontSize: 64, // text-8xl, adjusted for RN
        fontWeight: '900', // font-black
        color: '#60a5fa', // blue-400
        marginBottom: 8,
        textShadowColor: '#fde047', // yellow-200
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 0,
        // Second shadow for rgba(0,0,0,0.1) might need a separate Text component or a custom solution
    },
    subtitle: {
        fontSize: 24, // text-2xl
        color: '#475569', // slate-600
        marginBottom: 48, // mb-12
        fontWeight: 'bold',
    },
    buttonGroup: {
        flexDirection: 'row',
        // sm:flex-row gap-6
        // For small screens, it might stack vertically, but for now, row.
        // Gap can be simulated with margin.
        gap: 24, // gap-6
    },
    button: {
        paddingVertical: 16, // py-4
        paddingHorizontal: 48, // px-12
        borderRadius: 8,
        // chunky-button styles need to be defined
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 24, // text-2xl
        fontWeight: 'bold',
    },
});

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
    comicPanelWrapper: {
        // For React Native, if a rotation is desired, it would be applied directly to the style prop
        // transform: [{ rotate: '-1deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24, // p-6
        maxWidth: 400, // max-w-lg
        width: '100%',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold', // font-black
        color: '#60a5fa', // blue-400
        marginBottom: 8, // mb-2
    },
    characterNameLabel: {
        color: '#64748b', // slate-500
        marginBottom: 16, // mb-4
        fontSize: 14,
    },
    characterName: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    description: {
        marginBottom: 24, // mb-6
        color: '#475569', // slate-600
        fontSize: 16,
    },
    childrenContainer: {
        // space-y-3
    },
});

const choiceButtonStyles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: '#f1f5f9', // slate-100
        paddingVertical: 12, // py-3
        paddingHorizontal: 16, // px-4
        borderRadius: 12, // rounded-xl
        borderBottomWidth: 4,
        borderColor: '#e2e8f0', // slate-200
        transitionDuration: 200, // transition duration-200
        transitionTimingFunction: 'ease-in-out', // ease-in-out
        justifyContent: 'flex-start', // text-left
        marginBottom: 12, // For space-y-3 in parent
    },
    buttonDisabled: {
        opacity: 0.6, // disabled:opacity-60
        // cursor-not-allowed is not applicable in RN
    },
    // Hover and active states are handled differently in React Native,
    // often with `TouchableHighlight` or `Pressable` and their `onPressIn`/`onPressOut`
    // or by manually changing styles on state. For simplicity, I'm omitting them for now.
    // enabled:hover:bg-blue-300 enabled:hover:text-white enabled:hover:border-blue-400
    // enabled:active:translate-y-1 enabled:active:border-b-2
});

const schoolChoiceModalStyles = StyleSheet.create({
    choiceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choiceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    choiceCost: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    costAffordable: {
        color: '#f87171', // red-400
    },
    costUnaffordable: {
        color: '#ef4444', // red-500 font-extrabold
        fontWeight: 'bold',
    },
    choiceEffects: {
        fontSize: 12, // text-xs
        color: '#64748b', // slate-500
        marginTop: 4, // mt-1
    },
});

const universityChoiceModalStyles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12, // For space-y-3 in parent
    },
    buttonBlue: {
        backgroundColor: '#60a5fa', // blue-400
        borderBottomWidth: 4,
        borderColor: '#3b82f6', // blue-500
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const universityMajorChoiceModalStyles = StyleSheet.create({
    choiceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choiceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    choiceCost: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    costAffordable: {
        color: '#f87171', // red-400
    },
    costUnaffordable: {
        color: '#ef4444', // red-500 font-extrabold
        fontWeight: 'bold',
    },
    choiceDescription: {
        fontSize: 12, // text-xs
        color: '#64748b', // slate-500
        marginTop: 4, // mt-1
    },
    unaffordableSection: {
        marginTop: 16, // mt-4
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // border-t
        paddingTop: 16, // pt-4
        alignItems: 'center', // text-center
    },
    unaffordableText: {
        fontSize: 14, // text-sm
        color: '#dc2626', // red-600
        marginBottom: 8, // mb-2
        fontWeight: 'bold',
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderBottomWidth: 4,
        borderColor: '#475569', // slate-600
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const careerChoiceModalStyles = StyleSheet.create({
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    majorMatchIcon: {
        marginLeft: 8, // ml-2
        color: '#fbbf24', // amber-400
    },
    underqualifiedIcon: {
        marginLeft: 8, // ml-2
    },
    choiceCost: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    costAffordable: {
        color: '#f87171', // red-400
    },
    costUnaffordable: {
        color: '#ef4444', // red-500 font-extrabold
        fontWeight: 'bold',
    },
    choiceDescription: {
        fontSize: 12, // text-xs
        color: '#64748b', // slate-500
        marginTop: 4, // mt-1
    },
});

const underqualifiedChoiceModalStyles = StyleSheet.create({
    choiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    choiceDescription: {
        fontSize: 12, // text-xs
        color: '#64748b', // slate-500
        marginTop: 4, // mt-1
    },
});

const promotionModalStyles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const loanModalStyles = StyleSheet.create({
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
    comicPanelWrapper: {
        // transform: [{ rotate: '-1deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24, // p-6
        maxWidth: 400, // max-w-lg
        width: '100%',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold', // font-black
        color: '#ef4444', // red-500
        marginBottom: 8, // mb-2
    },
    description: {
        marginBottom: 24, // mb-6
        color: '#475569', // slate-600
        fontSize: 16,
    },
    optionsContainer: {
        marginBottom: 24, // mb-6
        // space-y-4
    },
    label: {
        fontWeight: 'bold',
        color: '#333', // slate-700
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-2
        marginTop: 8, // mt-2
    },
    gridButton: {
        padding: 8, // p-2
        borderRadius: 8, // rounded-lg
        borderBottomWidth: 4,
        transitionDuration: 200, // transition
        flex: 1, // To make them take equal space
        alignItems: 'center',
    },
    gridButtonSelected: {
        backgroundColor: '#93c5fd', // blue-300
        borderColor: '#60a5fa', // blue-400
    },
    gridButtonNormal: {
        backgroundColor: '#f1f5f9', // slate-100
        borderColor: '#e2e8f0', // slate-200
    },
    gridButtonText: {
        fontWeight: 'bold',
        fontSize: 14, // text-sm
        color: '#333', // text-slate-600
    },
    chunkyButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    chunkyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const businessManagementModalStyles = StyleSheet.create({
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
    comicPanelWrapper: {
        // transform: [{ rotate: '-2deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24, // p-6
        maxWidth: 768, // max-w-2xl
        width: '100%',
        maxHeight: '90%', // max-h-[90vh]
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'column', // flex flex-col
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // items-start
        marginBottom: 16, // mb-4
        flexShrink: 0, // flex-shrink-0
    },
    title: {
        fontSize: 28, // text-3xl
        fontWeight: 'bold', // font-black
        color: '#3b82f6', // blue-500
    },
    levelText: {
        color: '#64748b', // slate-500
        fontWeight: 'bold',
    },
    closeButton: {
        // -mt-2
    },
    closeButtonText: {
        color: '#94a3b8', // slate-400
        fontSize: 32, // text-4xl
        fontWeight: 'bold',
    },
    slotsContainer: {
        flexGrow: 1, // flex-grow
        paddingRight: 8, // pr-2
        // space-y-4
    },
    sectionTitle: {
        fontSize: 18, // text-lg
        fontWeight: 'bold', // font-extrabold
        color: '#333', // slate-700
        marginBottom: 12,
    },
    slotItem: {
        backgroundColor: '#f1f5f9', // slate-100
        padding: 12, // p-3
        borderRadius: 12, // rounded-xl
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16, // gap-4
        marginBottom: 12, // For space-y-4 in parent
    },
    avatarPlaceholder: {
        flexShrink: 0, // flex-shrink-0
        width: 64, // w-16
        height: 64, // h-16
        borderRadius: 8, // rounded-lg
        backgroundColor: '#e2e8f0', // bg-slate-200
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    robotIcon: {
        width: '100%',
        height: '100%',
    },
    emptyAvatar: {
        width: 40, // w-10
        height: 40, // h-10
        backgroundColor: '#cbd5e1', // bg-slate-300
        borderRadius: 20, // rounded-full
    },
    slotDetails: {
        flexGrow: 1, // flex-grow
    },
    slotRole: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    slotRequirement: {
        fontSize: 12, // text-xs
        color: '#64748b', // slate-500
    },
    slotSalary: {
        fontSize: 12, // text-xs
        color: '#22c55e', // green-600
        fontWeight: 'bold',
        marginTop: 4, // mt-1
    },
    picker: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#e2e8f0', // slate-200
        borderRadius: 12, // rounded-xl
        // px-3 py-2 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400
        // These styles are harder to apply directly to Picker, might need custom wrapper
        height: 40, // Example height
        width: 150, // Example width
    },
    pickerItem: {
        fontSize: 14,
        color: '#475569', // slate-600
    },
    footer: {
        marginTop: 24, // mt-6
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // border-t border-slate-200
        paddingTop: 16, // pt-4
        flexShrink: 0, // flex-shrink-0
    },
    upgradeButton: {
        backgroundColor: '#22c55e', // green-500
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 4,
        borderColor: '#16a34a', // green-600
    },
    upgradeButtonDisabled: {
        opacity: 0.6,
    },
    upgradeIcon: {
        width: 20, // w-5
        height: 20, // h-5
        marginRight: 8, // mr-2
        color: 'white', // Assuming icon color should be white
    },
    upgradeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

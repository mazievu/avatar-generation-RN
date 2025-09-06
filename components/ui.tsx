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
            <View>
                <Icon />
                <Text>{label}</Text>
                <View>
                    <View style={{ width: `${(value / max) * 100}%` }}></View>
                </View>
                <Text>{displayValue}</Text>
            </View>
        );
    }

    // Animated StatBar for the Event Outcome Modal
    const displayFinalValue = Math.round(value);
    const displayInitialValue = Math.round(initialValue);
    const displayChange = displayFinalValue - displayInitialValue;
    const changeColor = displayChange >= 0 ? 'text-green-600' : 'text-red-600'; // Still has Tailwind classes, needs conversion
    const barColor = displayChange >= 0 ? 'bg-green-400' : 'bg-red-400'; // Still has Tailwind classes, needs conversion
    
    return (
        <View>
            <Icon />
            <Text>{label}</Text>
            <View>
                <View
                    style={{ width: `${animatedWidth}%` }}
                />
                <View>
                    {particles.map(p => (
                        <View key={p.id} style={p.style} />
                    ))}
                </View>
            </View>
            <Text>{displayFinalValue}</Text>
            <Text>
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

  const nodeBgColor   = !isAlive ? 'bg-slate-200' : 'bg-transparent'; // Still has Tailwind classes, needs conversion
  const borderColor   = isPlayerLineage ? 'border-amber-400' : 'border-slate-300'; // Still has Tailwind classes, needs conversion
  const grayscale     = !isAlive ? 'grayscale' : ''; // Still has Tailwind classes, needs conversion
  const netIncomeColor= monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-500'; // Still has Tailwind classes, needs conversion
  const netIncomeSign = monthlyNetIncome > 0 ? '+' : '';

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

  return (
    <TouchableOpacity onPress={onClick}>
      <View>
        <View>
          {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
            <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{ width: 96, height: 96 }} />
          ) : (
            gender === Gender.Male ? <MaleIcon /> : <FemaleIcon />
          )}
        </View>

        {isAlive && (
          <Text>
            {age}
          </Text>
        )}
      </View>

      <Text>
        {displayName}
      </Text>

      {isAlive && (
        // ⬇⬇⬇ BỌC DÒNG THU NHẬP TRONG WRAPPER RELATIVE & RENDER HIỆU ỨNG Ở ĐÂY
        <View>
          <Text>
            {netIncomeSign}${Math.round(monthlyNetIncome).toLocaleString()}/mo
          </Text>

          {showMoney && (
            <View key={effectKey}>
              <Text>
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
        <View>
            <View>
                <View>
                    <View>
                        <Text>
                            {displayName} (G{character.generation})
                        </Text>
                        <TouchableOpacity onPress={onClose}><Text>&times;</Text></TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('details')}
                        >
                            <Text>
                                {t('tab_details', lang)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveDetailTab('events')}
                        >
                            <Text>
                                {t('tab_life_events', lang)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    
                    {activeDetailTab === 'details' && (
                        <View>
                            <View>
                                <View>
                                    {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
                                        <AgeAwareAvatarPreview
                                            manifest={manifest}
                                            character={character}
                                            images={images}
                                            size={{ width: 128, height: 128 }}
                                        />
                                    ) : null}
                                </View>

                                <View>
                                    <View>
                                        <Text>{displayPhase(character.phase, lang)} | {displayStatus(character.status, lang)}</Text>
                                        <Text>{character.isAlive ? `${character.age} ${t('age_short', lang)}` : `${t('deceased_at', lang)} ${character.age}`}</Text>
                                    </View>

                                    <Text>{t('relationship_label', lang)}: {displayRelationshipStatus(character.relationshipStatus, lang)}{partner ? ` ${t('with_person', lang)} ${partnerDisplayName}`: ''}</Text>
                                </View>
                            </View>
                            
                            {pet && <Text>{getPetIcon(pet.type)} {t('pet_label', lang)}: {pet.name} {t('the_pet_type', lang)} {t(PET_DATA[pet.type].nameKey, lang)}</Text>}

                            <Text>{t('education_label', lang)}: {educationText}</Text>
                            {character.major && <Text>{t('major_label', lang)}: {t(character.major, lang)}</Text>}
                            {career && <Text>{t('career_label', lang)}: {t(career.titleKey, lang)} (${career.salary.toLocaleString()}/yr)</Text>}
                            {businessRole && <Text>{t('working_at_label', lang)}: {businessRole.businessName} ({businessRole.role})</Text>}

                            {character.currentClubs && character.currentClubs.length > 0 && (
                                <View>
                                    <Text>{t('clubs_label', lang)}:</Text>
                                    <View>
                                        {character.currentClubs.map(clubId => {
                                            const club = CLUBS.find(c => c.id === clubId);
                                            return club ? <Text key={clubId}>{t(club.nameKey, lang)}</Text> : null;
                                        }) }
                                    </View>
                                </View>
                            )}

                            {character.completedOneTimeEvents && character.completedOneTimeEvents.length > 0 && (
                                <View>
                                    <Text>{t('life_events_label', lang)}:</Text>
                                    <View>
                                        {character.completedOneTimeEvents.map((eventId, index) => {
                                            const event = EVENTS.find(e => e.id === eventId);
                                            return event ? <Text key={`${eventId}-${index}`}>{t(event.titleKey, lang)}</Text> : null;
                                        }) }
                                    </View>
                                </View>
                            )}

                            {character.isAlive && (
                                <View>
                                    <StatBar Icon={IqIcon} value={character.stats.iq} max={200} label="IQ" color="bg-blue-400" />
                                    <StatBar Icon={HappinessIcon} value={character.stats.happiness} max={100} label={t('stat_happiness', lang)} color="bg-yellow-400" />
                                    <StatBar Icon={eqIcon} value={character.stats.eq} max={100} label={t('stat_eq', lang)} color="bg-purple-400" />
                                    <StatBar Icon={HealthIcon} value={character.stats.health} max={100} label={t('stat_health', lang)} color="bg-red-400" />
                                    {character.age >= 18 && <StatBar Icon={SkillIcon} value={character.stats.skill} max={100} label={t('stat_skill', lang)} color="bg-green-400" />}
                                </View>
                            )}
                            {!character.staticAvatarUrl && (
                                <View>
                                    <TouchableOpacity onPress={() => onCustomize(character.id)}>
                                        <Text>
                                            Customize
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {activeDetailTab === 'events' && (
                        <ScrollView>
                            <GameLog 
                                log={gameState.gameLog.filter(entry => entry.characterId === character.id)}
                                lang={lang}
                                familyMembers={gameState.familyMembers}
                            />
                        </ScrollView>
                    )}
                </View>
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
        <View>
            {/* Parents Node */}
            <View>
                <CharacterNode character={character} onClick={() => onAvatarClick(character)} lang={lang} images={images} manifest={manifest} />
                {partner && character.relationshipStatus === RelationshipStatus.Married && (
                    <>
                        {/* Spouse Connector */}
                        <View>
                            <View />
                        </View>
                        <CharacterNode character={partner} onClick={() => onAvatarClick(partner)} lang={lang} images={images} manifest={manifest} />
                    </>
                )}
            </View>

            {/* Children Branch */}
            {children.length > 0 && (
                <View>
                    {/* Vertical line from parent(s) center */}
                    <View />

                    {/* Children nodes container */}
                    <View>
                        {children.map((child, index) => (
                            <View key={child.id}>
                                {/* Connector from child up to horizontal line */}
                                <View />
                                {/* Horizontal line segment */}
                                <View />
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
    <View>
      <View>
        <View>
            <View
                onPress={() => onAvatarClick(character)} // Changed onClick to onPress
            >
                <AgeAwareAvatarPreview
                    manifest={manifest}
                    character={character}
                    images={images}
                    size={{ width: 80, height: 80 }}
                />
            </View>
            <View>
                <Text>{t(displayEventData.event.titleKey, lang)}</Text>
                <Text>{t('event_for', lang)}: <Text>{characterDisplayName}</Text></Text>
            </View>
        </View>
        
        <Text>{t(displayEventData.event.descriptionKey, lang, displayEventData.replacements)}</Text>
        
        {!outcome ? (
                <View>
                  {displayEventData.event.choices.map((choice, index) => (
                    <TouchableOpacity // Changed button to TouchableOpacity
                      key={index}
                      onPress={() => handleSelectChoice(choice)} // Changed onClick to onPress
                      disabled={!!outcome}
                    >
                      <View>
                        <Text>
                          {t(choice.textKey, lang)}
                          {choice.effect.triggers && choice.effect.triggers.length > 0 && (
                            <Text>
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
                          <Text>
                              {choice.effect.fundChange > 0 ? '+' : '-'}${Math.abs(choice.effect.fundChange).toLocaleString()}
                          </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
            ) : (
                <View>
                    <Text>"{t(outcome.logKey, lang, { name: characterDisplayName })}"</Text>
                    <View>
                        {outcome.fundChange && (
                            <View>
                                <MoneyIcon />
                                <Text>{t('family_fund_label', lang)}: {outcome.fundChange > 0 ? '+' : ''}${outcome.fundChange.toLocaleString()}</Text>
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
                                    color={'bg-slate-400'} // Base color, animation handles the rest
                                 />
                            );
                        })}
                    </View>
                    <TouchableOpacity // Changed button to TouchableOpacity
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
                        // autoFocus is a web-specific prop, removed
                    >
                        <Text>
                            OK
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
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
        const color = value > 0 ? 'text-green-600' : 'text-red-600'; // Still has Tailwind classes, needs conversion
        allChanges.push(
            <Text key="fund">
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
            const color = value > 0 ? 'text-green-600' : 'text-red-600'; // Still has Tailwind classes, needs conversion
            allChanges.push(
                <Text key={stat}>
                    <Icon /> {sign}{value}
                </Text>
            );
        }
    }

    if (allChanges.length === 0) {
        return null;
    }

    return (
        <View>
            {allChanges}
        </View>
    );
};

const GameLogInternal: React.FC<GameLogProps> = ({ log, lang, familyMembers }) => {
  return (
    <ScrollView>
      <Text>{t('family_log_title', lang)}</Text>
      <View>
        {log.map((entry, index) => {
          // New detailed format
          if (entry.eventTitleKey && entry.characterId) {
            const character = familyMembers[entry.characterId];
            const characterName = character ? getCharacterDisplayName(character, lang) : (entry.replacements?.name || 'Unknown');
            const eventName = t(entry.eventTitleKey, lang);

            return (
              <View key={index}>
                <Text>{t('year_label', lang)} {entry.year}</Text>
                <View>
                    <Text>
                        <Text>{characterName}:</Text>
                        <Text>{eventName}</Text>
                    </Text>
                    <Text>↳ {t(entry.messageKey, lang, entry.replacements)}</Text>
                    <LogStatChanges entry={entry} lang={lang} />
                </View>
              </View>
            );
          }

          // Fallback for old format
          return (
            <View key={index}>
               <Text>
                  <Text>{t('year_label', lang)} {entry.year}:</Text>
                  <Text>{t(entry.messageKey, lang, entry.replacements)}</Text>
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
    <View>
      <View>
        <View>
            <Text>{isVictory ? t('summary_victory_title', lang) : t('summary_gameover_title', lang)}</Text>
            <Text>
                {t(descriptionKey, lang)}
            </Text>
            
            <View>
              <Text><Text>{t('summary_total_generations', lang)}:</Text> {isVictory ? '6' : Object.values(gameState.familyMembers).reduce((max, m: Character) => Math.max(max, m.generation), 0)}</Text>
              <Text><Text>{t('summary_total_members', lang)}:</Text> {gameState.totalMembers}</Text>
              <Text><Text>{t('summary_living_members', lang)}:</Text> {livingMembers}</Text>
              <Text><Text>{t('summary_deceased_members', lang)}:</Text> {deceasedMembers}</Text>
              <Text><Text>{t('summary_highest_education', lang)}:</Text> {gameState.highestEducation}</Text>
              <Text><Text>{t('summary_highest_career', lang)}:</Text> {gameState.highestCareer}</Text>
              <Text><Text>{t('summary_final_funds', lang)}:</Text> ${gameState.familyFund.toLocaleString()}</Text>
               <Text><Text>{t('summary_asset_value', lang)}:</Text> ${gameState.purchasedAssets.reduce((sum, a) => sum + (ASSET_DEFINITIONS[a.id]?.cost || 0), 0).toLocaleString()}</Text>
              <Text><Text>{t('summary_ending_year', lang)}:</Text> {gameState.currentDate.year}</Text>
            </View>

            <TouchableOpacity onPress={onRestart}>
              <Text>
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
    <View>
        <Text>{t('game_title', lang)}</Text>
        <Text>{t('game_subtitle', lang)}</Text>
        <View>
            {SCENARIOS.map((scenario, i) => (
                <TouchableOpacity // Changed div to TouchableOpacity
                    key={scenario.id}
                    onPress={() => onStart(scenario.id)} // Changed onClick to onPress
                >
                    <View>
                        <Text>{t(scenario.nameKey, lang)}</Text>
                        <Text>{t(scenario.descriptionKey, lang)}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
        <TouchableOpacity // Changed button to TouchableOpacity
            onPress={onShowInstructions} // Changed onClick to onPress
        >
            <Text>
                {t('how_to_play_button', lang)}
            </Text>
        </TouchableOpacity>
    </View>
);


interface InstructionsModalProps extends LocalizedProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose, lang }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="comic-panel-wrapper" style={{'--rotate': '1deg'} as React.CSSProperties}>
            <div className="comic-panel p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-4xl font-bold">&times;</button>
                <h2 className="text-3xl font-black text-blue-400 mb-4">{t('instructions_title', lang)}</h2>
                <div className="text-left space-y-3 text-slate-600">
                    <p><strong>{t('instructions_objective_title', lang)}:</strong> {t('instructions_objective_desc', lang)}</p>
                    <p><strong>{t('instructions_gameplay_title', lang)}:</strong> {t('instructions_gameplay_desc', lang)}</p>
                    <p><strong>{t('instructions_events_title', lang)}:</strong> {t('instructions_events_desc', lang)}</p>
                    <p><strong>{t('instructions_stats_title', lang)}:</strong> {t('instructions_stats_desc', lang)}</p>
                    <p><strong>{t('instructions_phases_title', lang)}:</strong> {t('instructions_phases_desc', lang)}</p>
                    <p><strong>{t('instructions_finance_title', lang)}:</strong> {t('instructions_finance_desc', lang)}</p>
                </div>
            </div>
        </div>
    </div>
);

interface WelcomeBackMenuProps extends LocalizedProps {
  onContinue: () => void;
  onStartNew: () => void;
}

export const WelcomeBackMenu: React.FC<WelcomeBackMenuProps> = ({ onContinue, onStartNew, lang }) => (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-8xl font-black text-blue-400 mb-2" style={{textShadow: '4px 4px 0 #fde047, 8px 8px 0 rgba(0,0,0,0.1)'}}>{t('welcome_back_title', lang)}</h1>
        <p className="text-2xl text-slate-600 mb-12 font-bold">{t('welcome_back_subtitle', lang)}</p>
        <div className="flex flex-col sm:flex-row gap-6">
            <button
                onClick={onContinue}
                className="chunky-button chunky-button-green text-2xl px-12 py-4"
            >
                {t('continue_game_button', lang)}
            </button>
            <button
                onClick={onStartNew}
                className="chunky-button chunky-button-slate text-2xl px-12 py-4"
            >
                {t('start_new_game_button', lang)}
            </button>
        </div>
    </div>
);


interface ModalBaseProps extends LocalizedProps {
    titleKey: string;
    characterName?: string;
    descriptionKey: string;
    descriptionReplacements?: Record<string, string | number>;
    children: React.ReactNode;
}

export const ModalBase: React.FC<ModalBaseProps> = ({titleKey, characterName, descriptionKey, descriptionReplacements, children, lang}) => (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="comic-panel-wrapper" style={{'--rotate': '-1deg'} as React.CSSProperties}>
            <div className="comic-panel p-6 max-w-lg w-full">
                <h2 className="text-2xl font-black text-blue-400 mb-2">{t(titleKey, lang)}</h2>
                {characterName && <p className="text-slate-500 mb-4">{t('for_char_label', lang)}: <span className="font-semibold text-slate-800">{characterName}</span></p>}
                <p className="mb-6 text-slate-600">{t(descriptionKey, lang, { name: characterName, ...descriptionReplacements })}</p>
                <div className="space-y-3">
                   {children}
                </div>
            </div>
        </div>
    </div>
);

const ChoiceButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({onClick, disabled, children}) => (
     <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl transition duration-200 ease-in-out border-b-4 border-slate-200 enabled:hover:bg-blue-300 enabled:hover:text-white enabled:hover:border-blue-400 enabled:active:translate-y-1 enabled:active:border-b-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
       {children}
    </button>
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
                <div className="flex justify-between items-center">
                    <span>{t(option.nameKey, lang)}</span>
                    <span className={currentFunds >= option.cost ? 'text-red-400' : 'text-red-500 font-extrabold'}>(-${option.cost.toLocaleString()})</span>
                </div>
                <div className="text-xs font-normal text-slate-500 mt-1">
                    {Object.entries(option.effects).map(([stat, val]) => `${t(`stat_${stat}` as any, lang)} ${val > 0 ? `+${val}` : val}`).join(', ')}
                </div>
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
        <button onClick={() => onSelect(true)} className="chunky-button chunky-button-blue w-full">{t('university_choice_yes', lang)}</button>
        <button onClick={() => onSelect(false)} className="chunky-button chunky-button-slate w-full">{t('university_choice_no', lang)}</button>
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
                    <div className="flex justify-between items-center">
                        <span>{t(major.nameKey, lang)}</span>
                        <span className={currentFunds >= major.cost ? 'text-red-400' : 'text-red-500 font-extrabold'}>(-${major.cost.toLocaleString()})</span>
                    </div>
                    <p className="text-xs font-normal text-slate-500 mt-1">{t(major.descriptionKey, lang)}</p>
                </ChoiceButton>
            ))}
            {allUnaffordable && (
                <div className="mt-4 text-center border-t pt-4">
                    <p className="text-sm text-red-600 mb-2 font-bold">{t('modal_major_no_money', lang)}</p>
                    <button onClick={onAbandon} className="chunky-button chunky-button-slate w-full">
                        {t('university_choice_no', lang)}
                    </button>
                </div>
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
                        <div className="flex justify-between items-center">
                             <span className="flex items-center">
                                {t(track.nameKey, lang)}
                                {isMajorMatch && !isUnderqualified && <span className="ml-2 text-amber-400" title={t('major_match_tooltip', lang)}>⭐</span>}
                                {isUnderqualified && <span className="ml-2" title={tooltipText}>⚠️</span>}
                            </span>
                        </div>
                        <p className="text-xs font-normal text-slate-500 mt-1">{t(track.descriptionKey, lang)}</p>
                    </ChoiceButton>
                );
            } else if (optionKey === 'job' || optionKey === 'internship' || optionKey === 'vocational') {
                const keyBase = `career_option_${optionKey}`;
                const descKey = `${keyBase}_desc`;
                const cost = optionKey === 'vocational' ? VOCATIONAL_TRAINING.cost : 0;
                
                return (
                    <ChoiceButton key={index} onClick={() => onSelect(optionKey)} disabled={currentFunds < cost}>
                        <div className="flex justify-between items-center">
                            <span>{t(keyBase, lang)}</span>
                             {cost > 0 && (
                                <span className={currentFunds >= cost ? 'text-red-400' : 'text-red-500 font-extrabold'}>
                                    (-${cost.toLocaleString()})
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-normal text-slate-500 mt-1">{t(descKey, lang)}</p>
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
                <span>{t('underqualified_choice_trainee', lang)}</span>
                <p className="text-xs font-normal text-slate-500 mt-1">{t('underqualified_choice_trainee_desc', lang)}</p>
            </ChoiceButton>
            <ChoiceButton onClick={() => onSelect(false)}>
                <span>{t('underqualified_choice_penalized', lang)}</span>
                <p className="text-xs font-normal text-slate-500 mt-1">{t('underqualified_choice_penalized_desc', lang)}</p>
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
        <button onClick={onAccept} className="chunky-button chunky-button-green w-full">
            {t('accept_promotion_button', lang)}
        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="comic-panel-wrapper" style={{'--rotate': '-1deg'} as React.CSSProperties}>
                <div className="comic-panel p-6 max-w-lg w-full">
                    <h2 className="text-2xl font-black text-red-500 mb-2">{t('modal_loan_title', lang)}</h2>
                    <p className="mb-6 text-slate-600">{t('modal_loan_desc', lang)}</p>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="font-bold text-slate-700">{t('loan_amount_label', lang)}</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {amounts.map(amount => (
                                    <button 
                                        key={amount}
                                        onClick={() => setSelectedAmount(amount)}
                                        className={`p-2 rounded-lg font-bold text-sm border-b-4 transition ${selectedAmount === amount ? 'bg-blue-300 border-blue-400 text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        ${amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="font-bold text-slate-700">{t('loan_term_label', lang)}</label>
                             <div className="grid grid-cols-4 gap-2 mt-2">
                                {terms.map(term => (
                                    <button 
                                        key={term}
                                        onClick={() => setSelectedTerm(term)}
                                        className={`p-2 rounded-lg font-bold text-sm border-b-4 transition ${selectedTerm === term ? 'bg-blue-300 border-blue-400 text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => onLoanChoice(selectedAmount, selectedTerm)} className="chunky-button chunky-button-green w-full">
                        {t('accept_loan_button', lang)}
                    </button>
                </div>
            </div>
        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="comic-panel-wrapper" style={{'--rotate': '-2deg'} as React.CSSProperties} onClick={e => e.stopPropagation()}>
                <div className="comic-panel p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-start mb-4 flex-shrink-0">
                        <div>
                            <h3 className="text-3xl font-black text-blue-500">{t(businessDef.nameKey, lang)}</h3>
                            <p className="text-slate-500 font-bold">{t('level_label', lang)}: {business.level}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-4xl font-bold -mt-2">&times;</button>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-grow pr-2">
                        <h4 className="text-lg font-extrabold text-slate-700">{t('family_members_label', lang)}</h4>
                        {business.slots.map((slot, index) => {
                             const assignedCharacter = slot.assignedCharacterId && slot.assignedCharacterId !== 'robot' ? gameState.familyMembers[slot.assignedCharacterId] : null;
                             const isRobot = slot.assignedCharacterId === 'robot';
                             const salary = assignedCharacter ? calculateEmployeeSalary(assignedCharacter) : 0;

                             return (
                                <div key={index} className="bg-slate-100 p-3 rounded-xl flex items-center gap-4">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                                        {assignedCharacter ? (
                                            <AgeAwareAvatarPreview manifest={manifest} character={assignedCharacter} images={images} size={{width: 64, height: 64}} />
                                        ) : isRobot ? (
                                            <RobotAvatarIcon className="w-full h-full" />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-300 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-slate-800">{t(slot.role, lang)}</p>
                                        <p className="text-xs text-slate-500">{t('req_major_label', lang)}: {slot.requiredMajor === 'Unskilled' ? t('unskilled_major', lang) : t(slot.requiredMajor, lang)}</p>
                                        {assignedCharacter && (
                                            <p className="text-xs text-green-600 font-semibold mt-1">
                                                {t('salary_label', lang)}: ${salary.toLocaleString()}/mo
                                            </p>
                                        )}
                                    </div>
                                    <select 
                                        value={slot.assignedCharacterId || 'unassigned'}
                                        onChange={(e) => handleAssignmentChange(index, e.target.value)}
                                        className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="unassigned">{t('unassigned_option', lang)}</option>
                                        <option value="robot">{t('hire_robot_option', lang)} (-${ROBOT_HIRE_COST}/mo)</option>
                                        <optgroup label={t('family_members_label', lang)}>
                                            {availableMembers.map(char => {
                                                const isMajorMatch = slot.requiredMajor !== 'Unskilled' && char.major === slot.requiredMajor;
                                                return (
                                                    <option key={char.id} value={char.id}>
                                                        {isMajorMatch ? '⭐ ' : ''}
                                                        {getCharacterDisplayName(char, lang)} (Skill: {Math.round(char.stats.skill)})
                                                    </option>
                                                )
                                            })}
                                        </optgroup>
                                    </select>
                                </div>
                             )
                        })}
                    </div>
                    
                    <div className="mt-6 border-t border-slate-200 pt-4 flex-shrink-0">
                         {business.level < 2 && businessDef.upgradeSlots.length > 0 && (
                            <button 
                                onClick={() => onUpgradeBusiness(business.id)}
                                disabled={!canUpgrade}
                                className="chunky-button chunky-button-green w-full"
                            >
                                <UpgradeIcon className="inline-block w-5 h-5 mr-2" />
                                {t('upgrade_button', lang)} (-${upgradeCost.toLocaleString()})
                            </button>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
import * as React from 'react';
import type { Character, GameState, GameEvent, EventChoice, SchoolOption, PurchasedAsset, UniversityMajor, EventEffect, Business, GameLogEntry, Manifest, Stats, AssetDefinition } from '../types';
import { IqIcon, HappinessIcon, eqIcon, HealthIcon, SkillIcon, MaleIcon, FemaleIcon, MoneyIcon, getPetIcon, RobotIcon, UpgradeIcon, RobotAvatarIcon } from './icons';
import { Gender, RelationshipStatus, CharacterStatus, LifePhase } from '../types';
import { CAREER_LADDER, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, PET_DATA, EVENTS, VOCATIONAL_TRAINING, ASSET_DEFINITIONS } from '../constants';
import { CLUBS } from '../clubsAndEventsData';
import { SCENARIOS } from '../scenarios';
import { Language, t, displayPhase, displayStatus, displayRelationshipStatus } from '../localization';
import { getCharacterDisplayName, calculateEmployeeSalary } from '../utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { BusinessMap } from './BusinessMap';
import './ui.css'
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
  style: React.CSSProperties;
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
                                '--x-end': `${(Math.random() - 0.5) * 60}px`,
                                '--y-end': `${(Math.random() * -40) - 10}px`,
                                animationDelay: `${Math.random() * 0.3}s`
                            } as React.CSSProperties,
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
            <div className="flex items-center text-sm text-slate-700">
                <Icon />
                <span className="w-20 font-bold">{label}</span>
                <div className="w-full bg-slate-200 rounded-full h-3 flex-1">
                    <div className={`${color} h-3 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
                </div>
                <span className="ml-3 w-8 text-right font-bold">{displayValue}</span>
            </div>
        );
    }

    // Animated StatBar for the Event Outcome Modal
    const displayFinalValue = Math.round(value);
    const displayInitialValue = Math.round(initialValue);
    const displayChange = displayFinalValue - displayInitialValue;
    const changeColor = displayChange >= 0 ? 'text-green-600' : 'text-red-600';
    const barColor = displayChange >= 0 ? 'bg-green-400' : 'bg-red-400';
    
    return (
        <div className="flex items-center text-sm text-slate-700 animate-fade-in">
            <Icon />
            <span className="w-20 font-bold">{label}</span>
            <div className="w-full bg-slate-200 rounded-full h-4 flex-1 relative">
                <div
                    className={`${barColor} h-4 rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${animatedWidth}%` }}
                />
                <div className="particle-container">
                    {particles.map(p => (
                        <div key={p.id} className={`particle ${p.type}`} style={p.style} />
                    ))}
                </div>
            </div>
            <span className="ml-3 w-8 text-right font-bold">{displayFinalValue}</span>
            <span className={`ml-2 w-10 text-right font-bold ${changeColor}`}>
                ({displayChange >= 0 ? `+${displayChange}` : displayChange})
            </span>
        </div>
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

  const nodeBgColor   = !isAlive ? 'bg-slate-200' : 'bg-transparent';
  const borderColor   = isPlayerLineage ? 'border-amber-400' : 'border-slate-300';
  const grayscale     = !isAlive ? 'grayscale' : '';
  const netIncomeColor= monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-500';
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
    <div className="flex flex-col items-center gap-1 cursor-pointer group w-28" onClick={onClick}>
      <div className={`relative w-24 h-24 transition-transform group-hover:scale-110 ${grayscale}`}>
        <div className={`relative w-full h-full rounded-full border-4 ${borderColor} ${nodeBgColor} flex items-center justify-center shadow-lg overflow-hidden`}>
          {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
            <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{ width: 96, height: 96 }} />
          ) : (
            gender === Gender.Male ? <MaleIcon className="h-12 w-12 text-sky-700" /> : <FemaleIcon className="h-12 w-12 text-pink-600" />
          )}
        </div>

        {isAlive && (
          <span className="absolute -top-1 right-0 bg-slate-800 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white">
            {age}
          </span>
        )}
      </div>

      <p className="font-bold text-sm truncate w-full text-center text-slate-800 bg-white/70 rounded-md px-1">
        {displayName}
      </p>

      {isAlive && (
        // ⬇⬇⬇ BỌC DÒNG THU NHẬP TRONG WRAPPER RELATIVE & RENDER HIỆU ỨNG Ở ĐÂY
        <div className="relative inline-flex items-center justify-center">
          <p className={`text-xs font-mono font-bold ${netIncomeColor}`}>
            {netIncomeSign}${Math.round(monthlyNetIncome).toLocaleString()}/mo
          </p>

          {showMoney && (
            <div className="money-fly-effect" key={effectKey}>
              <span className={`money-fly-text ${monthlyNetIncome >= 0 ? "positive" : "negative"}`}>
                {netIncomeSign}{Math.round(monthlyNetIncome).toLocaleString()}$
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



interface CharacterDetailModalProps extends LocalizedProps {
    character: Character;
    gameState: GameState;
    onClose: () => void;
    onCustomize: (characterId: string) => void;
    images: Record<string, HTMLImageElement>;
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="comic-panel-wrapper" style={{'--rotate': '3deg'} as React.CSSProperties}>
                <div className="comic-panel p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-3xl font-black ${character.isPlayerCharacter ? 'text-amber-500' : 'text-slate-800'}`}>
                            {displayName} (G{character.generation})
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-4xl font-bold -mt-2">&times;</button>
                    </div>

                    <div className="flex mb-4">
                        <button
                            onClick={() => setActiveDetailTab('details')}
                            className={`px-4 py-2 text-sm font-bold rounded-t-lg ${activeDetailTab === 'details' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                            {t('tab_details', lang)}
                        </button>
                        <button
                            onClick={() => setActiveDetailTab('events')}
                            className={`px-4 py-2 text-sm font-bold rounded-t-lg ${activeDetailTab === 'events' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                            {t('tab_life_events', lang)}
                        </button>
                    </div>

                    
                    {activeDetailTab === 'details' && (
                        <div className="space-y-3">
                            <div className="flex gap-4 items-start mb-2">
                                <div className="w-32 h-32 rounded-2xl border-4 border-amber-400 overflow-hidden shadow-lg flex-shrink-0 bg-slate-200">
                                    {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
                                        <AgeAwareAvatarPreview
                                            manifest={manifest}
                                            character={character}
                                            images={images}
                                            size={{ width: 128, height: 128 }}
                                        />
                                    ) : null}
                                </div>

                                <div className="flex-grow">
                                    <div className="flex justify-between items-center text-sm text-slate-500 mb-1">
                                        <span>{displayPhase(character.phase, lang)} | {displayStatus(character.status, lang)}</span>
                                        <span>{character.isAlive ? `${character.age} ${t('age_short', lang)}` : `${t('deceased_at', lang)} ${character.age}`}</span>
                                    </div>

                                    <p className="text-sm text-slate-500 mb-3">{t('relationship_label', lang)}: {displayRelationshipStatus(character.relationshipStatus, lang)}{partner ? ` ${t('with_person', lang)} ${partnerDisplayName}`: ''}</p>
                                </div>
                            </div>
                            
                            {pet && <p className="text-sm text-cyan-600 mb-2 font-bold">{getPetIcon(pet.type)} {t('pet_label', lang)}: {pet.name} {t('the_pet_type', lang)} {t(PET_DATA[pet.type].nameKey, lang)}</p>}

                            <p className="text-sm text-sky-600 mb-1">{t('education_label', lang)}: {educationText}</p>
                            {character.major && <p className="text-sm text-sky-600 mb-1">{t('major_label', lang)}: {t(character.major, lang)}</p>}
                            {career && <p className="text-sm text-green-600 font-bold mb-3">{t('career_label', lang)}: {t(career.titleKey, lang)} (${career.salary.toLocaleString()}/yr)</p>}
                            {businessRole && <p className="text-sm text-green-600 font-bold mb-3">{t('working_at_label', lang)}: {businessRole.businessName} ({businessRole.role})</p>}

                            {character.currentClubs && character.currentClubs.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm text-purple-600 font-bold mb-1">{t('clubs_label', lang)}:</p>
                                    <ul className="list-disc list-inside text-sm text-slate-600">
                                        {character.currentClubs.map(clubId => {
                                            const club = CLUBS.find(c => c.id === clubId);
                                            return club ? <li key={clubId}>{t(club.nameKey, lang)}</li> : null;
                                        }) }
                                    </ul>
                                </div>
                            )}

                            {character.completedOneTimeEvents && character.completedOneTimeEvents.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm text-indigo-600 font-bold mb-1">{t('life_events_label', lang)}:</p>
                                    <ul className="list-disc list-inside text-sm text-slate-600">
                                        {character.completedOneTimeEvents.map(eventId => {
                                            const event = EVENTS.find(e => e.id === eventId);
                                            return event ? <li key={eventId}>{t(event.titleKey, lang)}</li> : null;
                                        }) }
                                    </ul>
                                </div>
                            )}

                            {character.isAlive && (
                                <div className="mt-4 space-y-2 p-3 bg-slate-50 rounded-xl">
                                    <StatBar Icon={IqIcon} value={character.stats.iq} max={200} label="IQ" color="bg-blue-400" />
                                    <StatBar Icon={HappinessIcon} value={character.stats.happiness} max={100} label={t('stat_happiness', lang)} color="bg-yellow-400" />
                                    <StatBar Icon={eqIcon} value={character.stats.eq} max={100} label={t('stat_eq', lang)} color="bg-purple-400" />
                                    <StatBar Icon={HealthIcon} value={character.stats.health} max={100} label={t('stat_health', lang)} color="bg-red-400" />
                                    {character.age >= 18 && <StatBar Icon={SkillIcon} value={character.stats.skill} max={100} label={t('stat_skill', lang)} color="bg-green-400" />}
                                </div>
                            )}
                            {!character.staticAvatarUrl && (
                                <div className="mt-4 text-center">
                                    <button onClick={() => onCustomize(character.id)} className="chunky-button chunky-button-pink">
                                        Customize
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeDetailTab === 'events' && (
                        <div className="h-full overflow-y-auto">
                            <GameLog 
                                log={gameState.gameLog.filter(entry => entry.characterId === character.id)}
                                lang={lang}
                                familyMembers={gameState.familyMembers}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};




interface FamilyTreeProps extends LocalizedProps {
  characterId: string;
  allMembers: Record<string, Character>;
  onAvatarClick: (character: Character) => void;
  images: Record<string, HTMLImageElement>;
  manifest: Manifest;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ characterId, allMembers, onAvatarClick, lang, images, manifest }) => {
    const character = allMembers[characterId];
    if (!character) return null;

    const partner = character.partnerId ? allMembers[character.partnerId] : null;
    const children = character.childrenIds.map(id => allMembers[id]).filter(Boolean);

    return (
        <div className="inline-flex flex-col items-center text-center">
            {/* Parents Node */}
            <div className="flex items-start gap-4">
                <CharacterNode character={character} onClick={() => onAvatarClick(character)} lang={lang} images={images} manifest={manifest} />
                {partner && character.relationshipStatus === RelationshipStatus.Married && (
                    <>
                        {/* Spouse Connector */}
                        <div className="relative w-8 h-24">
                            <div className="absolute top-12 w-full h-2 bg-slate-300 rounded-full" />
                        </div>
                        <CharacterNode character={partner} onClick={() => onAvatarClick(partner)} lang={lang} images={images} manifest={manifest} />
                    </>
                )}
            </div>

            {/* Children Branch */}
            {children.length > 0 && (
                <div className="relative flex justify-center mt-4">
                    {/* Vertical line from parent(s) center */}
                    <div className={`absolute bottom-full w-2 h-4 bg-slate-300 ${partner ? 'left-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`} />

                    {/* Children nodes container */}
                    <div className="flex gap-x-4">
                        {children.map((child, index) => (
                            <div key={child.id} className="relative pt-8">
                                {/* Connector from child up to horizontal line */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-4 bg-slate-300" />
                                {/* Horizontal line segment */}
                                <div className={`absolute top-4 h-2 bg-slate-300 rounded-full ${
                                    children.length === 1 ? 'hidden' :
                                    index === 0 ? 'left-1/2 w-1/2' :
                                    index === children.length - 1 ? 'right-1/2 w-1/2' : 'left-0 w-full'
                                }`} />
                                <FamilyTree characterId={child.id} allMembers={allMembers} onAvatarClick={onAvatarClick} lang={lang} images={images} manifest={manifest} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


interface EventModalProps extends LocalizedProps {
  eventData: { characterId: string; event: GameEvent };
  character: Character;
  onChoice: (choice: EventChoice) => void;
  onClose: () => void;
  images: Record<string, HTMLImageElement>;
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
      timerRef.current = window.setTimeout(() => {
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
      timerRef.current = window.setTimeout(() => {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="comic-panel-wrapper" style={{'--rotate': '2deg'} as React.CSSProperties}>
        <div className="comic-panel p-6 max-w-lg w-full">
            <div className="flex gap-4 items-center mb-4">
                <div
                    className="w-20 h-20 rounded-full border-4 border-amber-300 overflow-hidden shadow-lg flex-shrink-0 bg-slate-200 cursor-pointer"
                    onClick={() => onAvatarClick(character)}
                >
                    <AgeAwareAvatarPreview
                        manifest={manifest}
                        character={character}
                        images={images}
                        size={{ width: 80, height: 80 }}
                    />
                </div>
                <div className="flex-grow">
                    <h2 className="text-3xl font-black text-pink-400 mb-2">{t(displayEventData.event.titleKey, lang)}</h2>
                    <p className="text-slate-500">{t('event_for', lang)}: <span className="font-semibold text-slate-800">{characterDisplayName}</span></p>
                </div>
            </div>
            
            <p className="mb-6 text-slate-600">{t(displayEventData.event.descriptionKey, lang)}</p>
            
            {!outcome ? (
                <div className="space-y-3">
                  {displayEventData.event.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={!!outcome}
                      className="w-full text-left bg-slate-100 enabled:hover:bg-blue-300 text-slate-700 font-bold py-3 px-4 rounded-xl transition duration-200 ease-in-out border-b-4 border-slate-200 enabled:hover:border-blue-400 enabled:active:translate-y-1 enabled:active:border-b-2 disabled:opacity-50 flex justify-between items-center"
                    >
                      <div>
                        {t(choice.textKey, lang)}
                        {choice.effect.triggers && choice.effect.triggers.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            (
                            {choice.effect.triggers.map((trigger, idx) => {
                              const triggeredEvent = EVENTS.find(e => e.id === trigger.eventId);
                              if (!triggeredEvent) return null;
                              const triggerText = t(triggeredEvent.titleKey, lang);
                              return `${Math.round(trigger.chance * 100)}% ${triggerText}${idx < choice.effect.triggers!.length - 1 ? ', ' : ''}`;
                            }).filter(Boolean).join(', ')}
                            )
                          </span>
                        )}
                      </div>
                      {choice.effect.fundChange && choice.effect.fundChange !== 0 && (
                          <span className={`font-bold ${choice.effect.fundChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {choice.effect.fundChange > 0 ? '+' : '-'}${Math.abs(choice.effect.fundChange).toLocaleString()}
                          </span>
                      )}
                    </button>
                  ))}
                </div>
            ) : (
                <div className="text-center animate-fade-in bg-slate-50 p-4 rounded-xl">
                    <p className="text-lg italic text-slate-600 mb-4">"{t(outcome.logKey, lang, { name: characterDisplayName })}"</p>
                    <div className="space-y-2">
                        {outcome.fundChange && (
                            <div className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-bold ${outcome.fundChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <MoneyIcon className="h-5 w-5 mr-2" />
                                <span>{t('family_fund_label', lang)}: {outcome.fundChange > 0 ? '+' : ''}${outcome.fundChange.toLocaleString()}</span>
                            </div>
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
                    </div>
                    <button
                        className="mt-4 chunky-button chunky-button-blue"
                        onClick={() => {
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
                        autoFocus
                    >
                        OK
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
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
        const color = value > 0 ? 'text-green-600' : 'text-red-600';
        allChanges.push(
            <span key="fund" className={`inline-flex items-center text-xs font-bold ${color}`}>
                <MoneyIcon className="h-4 w-4 mr-0.5" /> {sign}${Math.abs(value).toLocaleString()}
            </span>
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
            const color = value > 0 ? 'text-green-600' : 'text-red-600';
            allChanges.push(
                <span key={stat} className={`inline-flex items-center text-xs font-bold ${color}`}>
                    <Icon className="h-4 w-4 mr-0.5" /> {sign}{value}
                </span>
            );
        }
    }

    if (allChanges.length === 0) {
        return null;
    }

    return (
        <div className="pl-4 mt-1 flex flex-wrap gap-x-4 gap-y-1 items-center">
            {allChanges}
        </div>
    );
};

const GameLogInternal: React.FC<GameLogProps> = ({ log, lang, familyMembers }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-2xl font-black mb-2 text-blue-400">{t('family_log_title', lang)}</h3>
      <div className="space-y-2 text-sm">
        {log.map((entry, index) => {
          // New detailed format
          if (entry.eventTitleKey && entry.characterId) {
            const character = familyMembers[entry.characterId];
            const characterName = character ? getCharacterDisplayName(character, lang) : (entry.replacements?.name || 'Unknown');
            const eventName = t(entry.eventTitleKey, lang);

            return (
              <div key={index} className="py-2 border-b border-slate-100 last:border-b-0">
                <p className="font-bold text-slate-500">{t('year_label', lang)} {entry.year}</p>
                <div className="pl-2 mt-1 space-y-1">
                    <p className="font-bold text-slate-800">
                        <span className="text-pink-500">{characterName}:</span>
                        <span className="ml-2 text-blue-500">{eventName}</span>
                    </p>
                    <p className="pl-4 text-slate-600 italic">↳ {t(entry.messageKey, lang, entry.replacements)}</p>
                    <LogStatChanges entry={entry} lang={lang} />
                </div>
              </div>
            );
          }

          // Fallback for old format
          return (
            <div key={index} className="py-1.5 border-b border-slate-100 last:border-b-0">
               <p>
                  <span className="font-bold text-slate-500">{t('year_label', lang)} {entry.year}:</span>
                  <span className="ml-2 text-slate-700">{t(entry.messageKey, lang, entry.replacements)}</span>
               </p>
               <LogStatChanges entry={entry} lang={lang} />
            </div>
          );
        })}
      </div>
    </div>
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
    <div className="fixed inset-0 bg-sky-100 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="comic-panel-wrapper" style={{'--rotate': '0deg'} as React.CSSProperties}>
        <div className="comic-panel p-8 max-w-2xl w-full text-center">
            <h1 className="text-6xl font-black text-amber-500 mb-4">{isVictory ? t('summary_victory_title', lang) : t('summary_gameover_title', lang)}</h1>
            <p className="text-xl mb-6 text-slate-600">
                {t(descriptionKey, lang)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-left mb-8 bg-slate-50 p-4 rounded-xl text-slate-700">
              <p><strong>{t('summary_total_generations', lang)}:</strong> {isVictory ? '6' : Object.values(gameState.familyMembers).reduce((max, m: Character) => Math.max(max, m.generation), 0)}</p>
              <p><strong>{t('summary_total_members', lang)}:</strong> {gameState.totalMembers}</p>
              <p><strong>{t('summary_living_members', lang)}:</strong> {livingMembers}</p>
              <p><strong>{t('summary_deceased_members', lang)}:</strong> {deceasedMembers}</p>
              <p><strong>{t('summary_highest_education', lang)}:</strong> {gameState.highestEducation}</p>
              <p><strong>{t('summary_highest_career', lang)}:</strong> {gameState.highestCareer}</p>
              <p><strong>{t('summary_final_funds', lang)}:</strong> ${gameState.familyFund.toLocaleString()}</p>
               <p><strong>{t('summary_asset_value', lang)}:</strong> ${gameState.purchasedAssets.reduce((sum, a) => sum + (ASSET_DEFINITIONS[a.id]?.cost || 0), 0).toLocaleString()}</p>
              <p><strong>{t('summary_ending_year', lang)}:</strong> {gameState.currentDate.year}</p>
            </div>

            <button onClick={onRestart} className="chunky-button chunky-button-blue text-lg">
              {t('play_again_button', lang)}
            </button>
        </div>
      </div>
    </div>
  );
};

interface StartMenuProps extends LocalizedProps {
  onStart: (mode: string) => void;
  onShowInstructions: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, lang }) => (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-8xl font-black text-pink-400 mb-2" style={{textShadow: '4px 4px 0 #fde047, 8px 8px 0 rgba(0,0,0,0.1)'}}>{t('game_title', lang)}</h1>
        <p className="text-2xl text-slate-600 mb-12 font-bold">{t('game_subtitle', lang)}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {SCENARIOS.map((scenario, i) => (
                <div
                    key={scenario.id}
                    onClick={() => onStart(scenario.id)}
                    className="comic-panel-wrapper cursor-pointer"
                    style={{'--rotate': `${(i % 2 === 0 ? 1 : -1) * (2 - i)}deg`, '--rotate-hover': '0deg' } as React.CSSProperties}
                >
                    <div className="comic-panel p-6">
                        <h2 className={`text-2xl font-black text-pink-400 mb-2`}>{t(scenario.nameKey, lang)}</h2>
                        <p className="text-slate-500">{t(scenario.descriptionKey, lang)}</p>
                    </div>
                </div>
            ))}
        </div>
        <button
            onClick={onShowInstructions}
            className="mt-10 chunky-button chunky-button-slate text-lg"
        >
            {t('how_to_play_button', lang)}
        </button>
    </div>
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
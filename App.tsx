
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, CareerChoice, PurchasedAsset, Business, Pet, GameEvent, Loan, AvatarState, Stats, GameLogEntry } from './types';
import { LifePhase, CharacterStatus, RelationshipStatus, Gender } from './types';
// FIX: Changed import from COST_OF_LIVING to getCostOfLiving to match the exported member from constants.
import { GAME_SPEED_MS, DAYS_IN_YEAR, EVENTS, SCHOOL_OPTIONS, UNIVERSITY_MAJORS, CAREER_LADDER, VOCATIONAL_TRAINING, INTERNSHIP, MOURNING_PERIOD_YEARS, PENSION_AMOUNT, getCostOfLiving, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, PET_DATA, BUSINESS_WORKER_BASE_SALARY_MONTHLY, BUSINESS_WORKER_SKILL_MULTIPLIER, ASSET_DEFINITIONS, TRAINEE_SALARY } from './constants';
import { GameUI } from './components/GameUI';
import AvatarBuilder, { exampleManifest, usePreloadedImages } from './components/AvatarBuilder';
import { SCENARIOS } from './scenarios';
import { getLifePhase, addDays, isBefore, getCharacterDisplayName, calculateNewAdjectiveKey, generateRandomAvatar } from './utils';
import { Language, t } from './localization';

type GameView = 'menu' | 'playing' | 'gameover' | 'welcome_back';
const SAVE_KEY = 'generations_savegame';

const ONE_TIME_EVENT_IDS = [
    // Newborn Milestones
    'newborn_first_night_crying',
    'newborn_first_bath',
    'newborn_learning_to_roll_over',
    'newborn_learning_to_crawl',
    'newborn_first_steps',
    'newborn_first_day_daycare',
    'newborn_first_self_feeding',
    'newborn_first_tooth',
    'newborn_first_haircut',
    'newborn_learning_to_talk',
    'newborn_first_dentist_visit',
    'newborn_first_swim',
    'newborn_potty_training',
    'newborn_self_dressing',
    // School Milestones
    'elementary_first_day',
    'university_first_day',
    // Career
    'workinglife_first_day',
    // Relationships
    'relationship_first_date',
    'relationship_prom_night',
    'relationship_first_argument',
    'relationship_anniversary',
    // Life
    // Retired
    'retired_official_retirement_day',
    'retired_first_pension',
    'retired_long_trip',
    'write_memoirs', 
    'last_day'
];

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_MS);
    const [view, setView] = useState<GameView>('menu');
    const [mainView, setMainView] = useState<'tree' | 'business'>('tree');
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [language, setLanguage] = useState<Language>('vi');
    const [customizingCharacterId, setCustomizingCharacterId] = useState<string | null>(null);
    
    const timerRef = useRef<number | null>(null);
    
    const allAvatarUrls = useMemo(() => {
        const s = new Set<string>();
        exampleManifest.forEach((layer) =>
          layer.options.forEach((o) => {
            s.add(o.previewSrc || o.src);
          })
        );
        s.add('/asset/avatar-face/face/old.png');
        s.add('/asset/mila.png');
        s.add('/asset/max.png');
        s.add('/asset/alice.png');
        s.add('/asset/lucas.png');
        s.add('/asset/daisy.png');
        s.add('/asset/avatar-face/face/baby.png');
        s.add('/asset/avatar-face/face/normal.png');
        return Array.from(s);
    }, []);
    const { loaded: avatarImages } = usePreloadedImages(allAvatarUrls);

    const saveGame = useCallback(() => {
        if (gameState) {
            try {
                const stateToSave = { ...gameState, lang: language };
                localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save game:", error);
            }
        }
    }, [gameState, language]);

    // Initial load check
    useEffect(() => {
        try {
            const savedGame = localStorage.getItem(SAVE_KEY);
            if (savedGame) {
                const savedState = JSON.parse(savedGame);
                if (savedState.lang) {
                    setLanguage(savedState.lang);
                }
                setView('welcome_back');
            } else {
                setView('menu');
            }
        } catch (error) {
            console.error("Failed to check for saved game:", error);
            setView('menu');
        }
        setIsInitialized(true);
    }, []);

     // Auto-save interval
    useEffect(() => {
        if (view === 'playing' && !isPaused) {
            const interval = setInterval(() => {
                saveGame();
            }, 60000); // 60 seconds
            return () => clearInterval(interval);
        }
    }, [view, isPaused, saveGame]);
    
    // Save on unload
    useEffect(() => {
        window.addEventListener('beforeunload', saveGame);
        return () => {
            window.removeEventListener('beforeunload', saveGame);
        };
    }, [saveGame]);


    const initializeGame = useCallback((mode: string) => {
        const initialYear = 2024;
        const scenario = SCENARIOS.find(s => s.id === mode);

        if (!scenario) {
            console.error(`Scenario with id "${mode}" not found.`);
            const defaultScenario = SCENARIOS[0];
            setGameState(defaultScenario.createInitialState(initialYear, language));
        } else {
            setGameState(scenario.createInitialState(initialYear, language));
        }
        
        setIsPaused(false);
        setView('playing');
    }, [language]);

    const handleContinueGame = useCallback(() => {
        try {
            const savedGame = localStorage.getItem(SAVE_KEY);
            if (savedGame) {
                const savedState = JSON.parse(savedGame);

                // Data migration: Ensure all characters have completedOneTimeEvents array
                if (savedState.familyMembers) {
                    for (const charId in savedState.familyMembers) {
                        if (!savedState.familyMembers[charId].completedOneTimeEvents) {
                            savedState.familyMembers[charId].completedOneTimeEvents = [];
                        }
                    }
                }
                 if (!savedState.purchasedAssets) { // Migration for old saves
                    savedState.purchasedAssets = [];
                }
                if (!savedState.familyBusinesses) { // Migration for old saves
                    savedState.familyBusinesses = {}; // Initialize as an empty object
                }


                setLanguage(savedState.lang || 'vi');
                setGameState(savedState);
                setView('playing');
                setIsPaused(true); 
            }
        } catch (error) {
            console.error("Failed to load game:", error);
            localStorage.removeItem(SAVE_KEY);
            setView('menu');
        }
    }, []);

    const handleStartNewGame = useCallback(() => {
        localStorage.removeItem(SAVE_KEY);
        setGameState(null);
        setView('menu');
    }, []);

    const handleStartGame = (mode: string) => {
        initializeGame(mode);
    };
    
    const stopGameLoop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const generateCareerChoices = (character: Character): string[] => {
        const allCareerKeys = Object.keys(CAREER_LADDER);
        const hasUniversity = !!character.major;
        const potentialChoices = new Set<string>();
    
        // 1. Major-specific career path
        const majorSpecificCareer = hasUniversity
            ? allCareerKeys.find(key => CAREER_LADDER[key].requiredMajor === character.major)
            : null;
        
        // Always add it as an option if it exists, regardless of stats
        if (majorSpecificCareer) {
            potentialChoices.add(majorSpecificCareer);
        }
    
        // 2. Add all careers that don't have a major requirement OR if the character is a graduate (can work mismatched)
        allCareerKeys.forEach(key => {
            const track = CAREER_LADDER[key];
            if (!track.requiredMajor || hasUniversity) {
                potentialChoices.add(key);
            }
        });
    
        let finalChoices = Array.from(potentialChoices);
    
        // 3. Fallback for characters who still have no options
        if (finalChoices.length === 0) {
            const unskilledCareerKey = 'Unskilled';
            if (allCareerKeys.includes(unskilledCareerKey)) {
               finalChoices.push(unskilledCareerKey);
            }
        }
    
        // 4. Shuffle the choices, but keep major-specific one at the top if present
        if (majorSpecificCareer && finalChoices.includes(majorSpecificCareer)) {
            finalChoices = finalChoices.filter(c => c !== majorSpecificCareer);
            finalChoices.sort(() => 0.5 - Math.random()); 
            finalChoices.unshift(majorSpecificCareer);
        } else {
            finalChoices.sort(() => 0.5 - Math.random());
        }
    
        // 5. Return up to 5 choices.
        return finalChoices.slice(0, 5);
    };
    
    const gameLoop = useCallback(() => {
        setGameState(prevState => {
            if (!prevState || prevState.gameOverReason) {
                return prevState;
            }

            let newState = { ...prevState };
            let nextFamilyMembers = { ...prevState.familyMembers };
            let nextGameLog = [...prevState.gameLog];

            const isNewMonth = prevState.currentDate.day % 30 === 1;
            
            let day = prevState.currentDate.day + 1;
            let year = prevState.currentDate.year;
            if (day > DAYS_IN_YEAR) {
                day = 1;
                year += 1;
            }
            newState.currentDate = { day, year };
            const isNewYear = day === 1 && year > prevState.currentDate.year;

            if (isNewMonth) {
                let totalBusinessNetChange = 0;
                let memberUpdates: Record<string, Partial<Character>> = {};
                
                let businessSalaries: Record<string, number> = {}; 
                for (const business of Object.values(prevState.familyBusinesses)) {
                    for (const slot of business.slots) {
                        if (slot.assignedCharacterId && slot.assignedCharacterId !== 'robot') {
                            const char = prevState.familyMembers[slot.assignedCharacterId];
                            if (char) {
                                const salary = BUSINESS_WORKER_BASE_SALARY_MONTHLY + (char.stats.skill * BUSINESS_WORKER_SKILL_MULTIPLIER);
                                businessSalaries[char.id] = (businessSalaries[char.id] || 0) + salary;
                            }
                        }
                    }
                }

                for (const business of Object.values(prevState.familyBusinesses)) {
                    const definition = BUSINESS_DEFINITIONS[business.type];
                    if (!definition) continue;
            
                    const filledSlots = business.slots.filter(slot => slot.assignedCharacterId).length;
                    const totalSlots = business.slots.length;
                    let businessNet = 0;

                    if (filledSlots > 0) {
                        const workersAndRobots = business.slots.map(slot => {
                            if (!slot.assignedCharacterId) return null;
                            if (slot.assignedCharacterId === 'robot') return { stats: { skill: 30 } }; 
                            return prevState.familyMembers[slot.assignedCharacterId];
                        }).filter((w): w is (Character | { stats: { skill: number } }) => !!w);

                        let revenueBuff = 1;
                        if (workersAndRobots.length > 0) {
                            const totalSkill = workersAndRobots.reduce((sum, worker) => sum + worker.stats.skill, 0);
                            const avgSkill = totalSkill / workersAndRobots.length;
                            revenueBuff = 1 + (avgSkill / 200); 
                        }
                        
                        const operationalCapacity = filledSlots / totalSlots;
                        const scaledBaseRevenue = business.baseRevenue * operationalCapacity;

                        const robotCostForBusiness = business.slots.filter(s => s.assignedCharacterId === 'robot').length * ROBOT_HIRE_COST;
                        
                        const salaryExpenseForBusiness = business.slots
                            .map(slot => slot.assignedCharacterId ? businessSalaries[slot.assignedCharacterId] : 0)
                            .filter(Boolean)
                            .reduce((sum, s) => sum + s, 0);

                        const grossRevenue = scaledBaseRevenue * revenueBuff;
                        const costOfGoods = grossRevenue * definition.costOfGoodsSold;
                        businessNet = grossRevenue - costOfGoods - robotCostForBusiness - definition.fixedMonthlyCost - salaryExpenseForBusiness;
                    } else {
                        businessNet = -definition.fixedMonthlyCost;
                    }
                    totalBusinessNetChange += businessNet;
                }

                let petExpenses: Record<string, number> = {};
                 for (const pet of Object.values(prevState.familyPets)) {
                    const petData = PET_DATA[pet.type];
                    if (petData && pet.ownerId && prevState.familyMembers[pet.ownerId]?.isAlive) {
                        petExpenses[pet.ownerId] = (petExpenses[pet.ownerId] || 0) + petData.monthlyCost;
                    }
                }
                
                let totalPersonalIncome = 0;
                let totalPersonalExpenses = 0;

                const livingMembers = Object.values(prevState.familyMembers).filter(c => c.isAlive);
                
                livingMembers.forEach(char => {
                    let personalIncome = 0;
                    // FIX: Changed COST_OF_LIVING[char.phase] to a function call getCostOfLiving(char.phase)
                    const personalExpenses = (getCostOfLiving(char.phase) / 12) + (petExpenses[char.id] || 0);
                    totalPersonalExpenses += personalExpenses;
                    let charUpdate: Partial<Character> = {};
                    let statsUpdate: Partial<Stats> = {};
                    
                    if (businessSalaries[char.id]) {
                        personalIncome = businessSalaries[char.id];
                        const iqRatio = char.stats.iq / 200;
                        const confRatio = char.stats.confidence / 100;
                        let skillGain = Math.min(1, iqRatio * confRatio);

                        let assignedBusinessSlot: { role: string; requiredMajor: string; } | null = null;
                        for (const business of Object.values(prevState.familyBusinesses)) {
                            const foundSlot = business.slots.find(s => s.assignedCharacterId === char.id);
                            if(foundSlot) {
                                assignedBusinessSlot = foundSlot;
                                break;
                            }
                        }

                        if(assignedBusinessSlot) {
                            const requiredMajor = assignedBusinessSlot.requiredMajor;
                            if (requiredMajor && requiredMajor !== 'Unskilled' && char.major !== requiredMajor) {
                                skillGain *= 0.5; // 50% slower skill gain
                            }
                        }

                        const newSkill = Math.min(100, char.stats.skill + skillGain);
                        charUpdate.status = CharacterStatus.Working;
                        statsUpdate = { ...(statsUpdate || char.stats), skill: newSkill };
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;

                    } else if (char.status === CharacterStatus.Working && char.careerTrack) {
                        const salary = CAREER_LADDER[char.careerTrack].levels[char.careerLevel].salary;
                        personalIncome += salary / 12;
                        const iqRatio = char.stats.iq / 200;
                        const confRatio = char.stats.confidence / 100;

                        const career = CAREER_LADDER[char.careerTrack];
                        const isMismatched = career.requiredMajor && char.major !== career.requiredMajor;

                        let skillGain = Math.min(1, iqRatio * confRatio);
                        if (isMismatched) {
                            skillGain *= 0.5; // 50% slower skill gain
                        }
                        if (char.progressionPenalty) {
                             skillGain *= (1 - char.progressionPenalty);
                        }
                        
                        const newSkill = Math.min(100, char.stats.skill + skillGain);
                        statsUpdate = { ...(statsUpdate || char.stats), skill: newSkill };
                        
                        const nextLevel = char.careerLevel + 1;
                        if (nextLevel < career.levels.length) {
                             let skillRequired = career.levels[nextLevel].skillRequired;
                             const hasHigherEducation = !!char.major || char.education === 'education_vocational_diploma';
                             if (!hasHigherEducation) {
                                 skillRequired *= 1.5; // 50% harder progression
                             }
                             if (isMismatched) {
                                skillRequired *= 1.5; // 50% harder progression for mismatch
                             }
                             if (char.progressionPenalty) {
                                skillRequired *= (1 + char.progressionPenalty);
                             }
                            if (newSkill >= skillRequired && !prevState.pendingPromotion) {
                                newState.pendingPromotion = {
                                    characterId: char.id,
                                    newLevel: nextLevel,
                                    newTitleKey: career.levels[nextLevel].titleKey,
                                };
                            }
                        }
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;
                    } else if (char.status === CharacterStatus.Trainee && char.traineeForCareer) {
                        personalIncome += TRAINEE_SALARY / 12;
                        const career = CAREER_LADDER[char.traineeForCareer];
                        if (career) {
                            const iqNeeded = career.iqRequired > char.stats.iq;
                            const confNeeded = career.confidenceRequired > char.stats.confidence;
                            if(iqNeeded) statsUpdate.iq = Math.min(career.iqRequired, (statsUpdate.iq || char.stats.iq) + 0.5);
                            if(confNeeded) statsUpdate.confidence = Math.min(career.confidenceRequired, (statsUpdate.confidence || char.stats.confidence) + 0.5);
                            
                            const newIQ = statsUpdate.iq || char.stats.iq;
                            const newConf = statsUpdate.confidence || char.stats.confidence;

                            if(newIQ >= career.iqRequired && newConf >= career.confidenceRequired) {
                                charUpdate.status = CharacterStatus.Working;
                                charUpdate.careerTrack = char.traineeForCareer;
                                charUpdate.careerLevel = 0;
                                charUpdate.traineeForCareer = null;
                                charUpdate.progressionPenalty = 0;
                                charUpdate.stats = { ...char.stats, ...statsUpdate, skill: 0 };
                                const title = t(career.levels[0].titleKey, language);
                                nextGameLog.push({ year: newState.currentDate.year, messageKey: 'log_promoted_from_trainee', replacements: {name: getCharacterDisplayName(char, language), title}, characterId: char.id, eventTitleKey: 'event_promotion_title' });
                            }
                        }
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;

                    } else if (char.status === CharacterStatus.Retired) {
                        personalIncome += PENSION_AMOUNT / 12;
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;
                    } else if (char.status === CharacterStatus.Internship) {
                        personalIncome += INTERNSHIP.stipend / 12;
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;
                    } else if (char.status === CharacterStatus.VocationalTraining) {
                        const monthlySkillGain = VOCATIONAL_TRAINING.effects.skill / (VOCATIONAL_TRAINING.duration * 12);
                        const monthlyConfidenceGain = VOCATIONAL_TRAINING.effects.confidence / (VOCATIONAL_TRAINING.duration * 12);
                        statsUpdate = { 
                            ...(statsUpdate || char.stats), 
                            skill: Math.min(100, char.stats.skill + monthlySkillGain),
                            confidence: Math.min(100, char.stats.confidence + monthlyConfidenceGain)
                        };
                        charUpdate.monthlyNetIncome = -personalExpenses;
                    } else if (char.status === CharacterStatus.Unemployed) {
                        statsUpdate = { 
                            ...(statsUpdate || char.stats), 
                            happiness: Math.max(0, char.stats.happiness - 1),
                            confidence: Math.max(0, char.stats.confidence - 1)
                        };
                        charUpdate.monthlyNetIncome = -personalExpenses;
                    } else {
                        charUpdate.monthlyNetIncome = -personalExpenses;
                    }

                    if(Object.keys(statsUpdate).length > 0) charUpdate.stats = { ...char.stats, ...statsUpdate };

                    totalPersonalIncome += personalIncome;
                    memberUpdates[char.id] = { ...(memberUpdates[char.id] || {}), ...charUpdate };
                });

                const totalNetChange = totalPersonalIncome + totalBusinessNetChange - totalPersonalExpenses;
                newState.familyFund = prevState.familyFund + totalNetChange;
                newState.monthlyNetChange = totalNetChange;

                if (Object.keys(memberUpdates).length > 0) {
                    const updatedFamilyMembers = { ...prevState.familyMembers };
                    for (const id in memberUpdates) {
                        updatedFamilyMembers[id] = { ...updatedFamilyMembers[id], ...memberUpdates[id] };
                    }
                    nextFamilyMembers = updatedFamilyMembers;
                }

                if (newState.familyFund < 0 && !prevState.pendingLoanChoice) {
                    newState.pendingLoanChoice = true;
                }
            }
            
            let memberUpdates: Record<string, Partial<Character>> = {};
            let hasMemberUpdates = false;

            const livingMemberIds = Object.values(nextFamilyMembers).filter(c => c.isAlive).map(c => c.id);
            for (const id of livingMemberIds) {
                const character = nextFamilyMembers[id];
                const displayName = getCharacterDisplayName(character, language);
                let charUpdate: Partial<Character> = {};
                let statsUpdate: Partial<typeof character.stats> = {};

                if (newState.currentDate.day === character.birthDate.day) {
                    charUpdate.age = character.age + 1;
                    charUpdate.eventsThisYear = 0;
                    nextGameLog.push({ year: newState.currentDate.year, characterId: id, eventTitleKey: 'event_birthday_title', messageKey: 'log_birthday', replacements: { name: displayName, age: charUpdate.age } });
                    
                    const newAdjectiveKey = calculateNewAdjectiveKey(character);
                    charUpdate.displayAdjective = { key: newAdjectiveKey, year: newState.currentDate.year };

                    const newPhase = getLifePhase(charUpdate.age);
                    if (newPhase !== character.phase) {
                        charUpdate.phase = newPhase;
                        if (!character.staticAvatarUrl) {
                             charUpdate.avatarState = generateRandomAvatar(exampleManifest, charUpdate.age, character.gender);
                        }
                        nextGameLog.push({ year: newState.currentDate.year, characterId: id, eventTitleKey: 'event_new_phase_title', messageKey: 'log_new_phase', replacements: { name: displayName, phase: t(newPhase, language) } });
                    }
                }
                
                if (character.mourningUntilYear) {
                    if (newState.currentDate.year > character.mourningUntilYear) {
                        charUpdate.mourningUntilYear = null;
                    } else {
                         statsUpdate.happiness = Math.max(0, character.stats.happiness - 0.1);
                    }
                }

                let healthDecay = 0;
                if (character.age > 50) healthDecay += 0.005;
                if (character.age > 70) healthDecay += 0.01;
                if(healthDecay > 0) statsUpdate.health = Math.max(0, character.stats.health - healthDecay);
                
                if (character.isAlive && (statsUpdate.health ?? character.stats.health) <= 0) {
                     const lastDayEvent = EVENTS.find(e => e.id === 'milestone_death_old_age');
                     if (lastDayEvent) {
                        newState.eventQueue = [{ characterId: character.id, event: lastDayEvent }, ...newState.eventQueue];
                     }
                }

                if (Object.keys(statsUpdate).length > 0) charUpdate.stats = { ...character.stats, ...statsUpdate };
                if (Object.keys(charUpdate).length > 0) {
                     memberUpdates[id] = { ...(memberUpdates[id] || {}), ...charUpdate };
                     hasMemberUpdates = true;
                }
            }

            if(hasMemberUpdates) {
                 const updatedFamilyMembers = { ...nextFamilyMembers };
                 for (const id in memberUpdates) {
                    updatedFamilyMembers[id] = { ...updatedFamilyMembers[id], ...memberUpdates[id] };
                 }
                 nextFamilyMembers = updatedFamilyMembers;
            }

            if (isNewYear) {
                const anyModalPending = !!(
                    newState.pendingSchoolChoice?.length || 
                    newState.pendingUniversityChoice?.length || 
                    newState.pendingCareerChoice || 
                    newState.pendingUnderqualifiedChoice ||
                    newState.activeEvent
                );

                if (!anyModalPending) {
                    const newSchoolChoices: { characterId: string; newPhase: LifePhase }[] = [];
                    const newUniversityChoices: { characterId: string }[] = [];
                    let careerChoiceSet = false;

                    for (const id of livingMemberIds) {
                        const char = nextFamilyMembers[id];
                        if (char.age === 6 && char.status === CharacterStatus.Idle) {
                            newSchoolChoices.push({ characterId: id, newPhase: LifePhase.Elementary });
                        } else if (char.age === 12 && char.status === CharacterStatus.InEducation) {
                            newSchoolChoices.push({ characterId: id, newPhase: LifePhase.MiddleSchool });
                        } else if (char.age === 16 && char.status === CharacterStatus.InEducation) {
                            newSchoolChoices.push({ characterId: id, newPhase: LifePhase.HighSchool });
                        }
                    }

                    if (newSchoolChoices.length > 0) {
                        newState.pendingSchoolChoice = newSchoolChoices;
                    } else {
                        for (const id of livingMemberIds) {
                            const char = nextFamilyMembers[id];
                            
                            if (char.statusEndYear !== null && year >= char.statusEndYear) {
                                const charUpdate: Partial<Character> = { status: CharacterStatus.Idle, statusEndYear: null };
                                const updatedChar = { ...char, ...charUpdate };
                                nextFamilyMembers[id] = updatedChar;
                                
                                if (updatedChar.age === 19) {
                                    newUniversityChoices.push({ characterId: id });
                                } else { 
                                    if (!careerChoiceSet) {
                                        const careerOptions = generateCareerChoices(updatedChar);
                                        newState.pendingCareerChoice = { characterId: id, options: careerOptions };
                                        careerChoiceSet = true;
                                    }
                                }
                            } 
                            else if (char.age === 19 && char.status === CharacterStatus.Idle) {
                                newUniversityChoices.push({ characterId: id });
                            } 
                            else if (char.age === 60 && char.status !== CharacterStatus.Retired) {
                                const charUpdate: Partial<Character> = { status: CharacterStatus.Retired, careerTrack: null, careerLevel: 0 };
                                nextFamilyMembers[id] = { ...char, ...charUpdate };
                                const displayName = getCharacterDisplayName(char, language);
                                nextGameLog.push({ year: newState.currentDate.year, characterId: id, eventTitleKey: 'event_retirement_title', messageKey: 'log_retired', replacements: { name: displayName } });
                            }
                        }

                        if (newUniversityChoices.length > 0) {
                            newState.pendingUniversityChoice = newUniversityChoices;
                        }
                    }
                }
                
                const dueLoans = newState.activeLoans.filter(loan => newState.currentDate.year >= loan.dueDate.year);
                let stillActiveLoans = [...newState.activeLoans];

                for (const loan of dueLoans) {
                    nextGameLog = [...nextGameLog, { year: newState.currentDate.year, messageKey: 'log_loan_repayment_due', replacements: { amount: loan.amount.toLocaleString() } }];
                    if (newState.familyFund >= loan.amount) {
                        newState.familyFund -= loan.amount;
                        stillActiveLoans = stillActiveLoans.filter(l => l.id !== loan.id);
                        nextGameLog = [...nextGameLog, { year: newState.currentDate.year, messageKey: 'log_loan_repaid', replacements: { amount: loan.amount.toLocaleString() } }];
                    } else {
                        newState.gameOverReason = 'debt';
                        break; 
                    }
                }
                 if (newState.gameOverReason !== 'debt') {
                    newState.activeLoans = stillActiveLoans;
                }

                if (!((newState.pendingSchoolChoice && newState.pendingSchoolChoice.length > 0) || (newState.pendingUniversityChoice && newState.pendingUniversityChoice.length > 0) || newState.pendingCareerChoice || newState.pendingUnderqualifiedChoice)) {
                    const MILESTONE_EVENTS = EVENTS.filter(e => e.isMilestone);
                    const stateForConditionCheck: GameState = { ...newState, familyMembers: nextFamilyMembers, gameLog: nextGameLog };

                    for (const event of MILESTONE_EVENTS) {
                        for (const id of livingMemberIds) {
                            const character = nextFamilyMembers[id];
                            if (!character.completedOneTimeEvents.includes(event.id) && event.condition && event.condition(stateForConditionCheck, character) && !newState.eventQueue.some(q => q.event.id === event.id)) {
                                newState.eventQueue.push({ characterId: character.id, event: event });
                                break;
                            }
                        }
                    }
                }
            }
            
            // --- EVENT TRIGGER LOGIC ---
            const isGlobalCooldownActive = newState.eventCooldownUntil && isBefore(newState.currentDate, newState.eventCooldownUntil);
            
            if (!isGlobalCooldownActive && !newState.activeEvent && prevState.eventQueue.length === 0 && (!newState.pendingSchoolChoice || newState.pendingSchoolChoice.length === 0) && (!newState.pendingUniversityChoice || newState.pendingUniversityChoice.length === 0) && !newState.pendingCareerChoice && !newState.pendingUnderqualifiedChoice) {
                const eligibleCharacters = Object.values(nextFamilyMembers).filter(c =>
                    c.isAlive &&
                    (c.eventsThisYear || 0) < 2
                );

                if (eligibleCharacters.length > 0) {
                    const chosenCharacter = eligibleCharacters[Math.floor(Math.random() * eligibleCharacters.length)];
                    const stateForConditionCheck: GameState = { ...newState, familyMembers: nextFamilyMembers };

                    let event: GameEvent | undefined;

                    const possibleEvents = EVENTS.filter(e =>
                        !e.isMilestone &&
                        e.phases.includes(chosenCharacter.phase) &&
                        !e.isTriggerOnly &&
                        (!e.allowedRelationshipStatuses || e.allowedRelationshipStatuses.includes(chosenCharacter.relationshipStatus)) &&
                        !(chosenCharacter.completedOneTimeEvents || []).includes(e.id) &&
                        (!e.condition || e.condition(stateForConditionCheck, chosenCharacter))
                    );

                    if (possibleEvents.length > 0) {
                        event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
                    }

                    if (event) {
                        newState.activeEvent = { characterId: chosenCharacter.id, event: event };

                        const livingMembersCount = Object.values(nextFamilyMembers).filter(c => c.isAlive).length;
                        const cooldownDays = livingMembersCount <= 3 ? 120 : 180;
                        newState.eventCooldownUntil = addDays(newState.currentDate, cooldownDays);

                        const charToUpdate = { ...nextFamilyMembers[chosenCharacter.id] };
                        charToUpdate.eventsThisYear = (charToUpdate.eventsThisYear || 0) + 1;
                        nextFamilyMembers[chosenCharacter.id] = charToUpdate;
                    }
                }
            }

            if (!newState.activeEvent && prevState.eventQueue.length > 0) {
                 newState.activeEvent = prevState.eventQueue[0];
                 newState.eventQueue = prevState.eventQueue.slice(1);
            }
            
            newState.familyMembers = nextFamilyMembers;
            newState.gameLog = nextGameLog;
            
            if (newState.gameOverReason) {
                setView('gameover');
            }

            return newState;
        });
    }, [language]);

    useEffect(() => {
        const isModalOrSpecialViewActive = 
            !!gameState?.activeEvent ||
            (!!gameState?.pendingSchoolChoice && gameState.pendingSchoolChoice.length > 0) ||
            (!!gameState?.pendingUniversityChoice && gameState.pendingUniversityChoice.length > 0) ||
            !!gameState?.pendingMajorChoice ||
            !!gameState?.pendingCareerChoice ||
            !!gameState?.pendingLoanChoice ||
            !!gameState?.pendingPromotion ||
            !!gameState?.pendingUnderqualifiedChoice ||
            !!customizingCharacterId ||
            mainView === 'business';

        if (isModalOrSpecialViewActive) {
            setIsPaused(true);
        }
    }, [gameState?.activeEvent, gameState?.pendingSchoolChoice, gameState?.pendingUniversityChoice, gameState?.pendingMajorChoice, gameState?.pendingCareerChoice, gameState?.pendingLoanChoice, gameState?.pendingPromotion, gameState?.pendingUnderqualifiedChoice, customizingCharacterId, mainView]);

    useEffect(() => {
        stopGameLoop();
        if (view === 'playing' && !isPaused && !gameState?.gameOverReason) {
            timerRef.current = window.setInterval(gameLoop, gameSpeed);
        }
        return () => stopGameLoop();
    }, [isPaused, gameSpeed, view, gameLoop, gameState?.gameOverReason]);


    const handleEventChoice = useCallback((choice: EventChoice) => {
        setGameState(prevState => {
            if (!prevState || !prevState.activeEvent) return prevState;
    
            let nextState = JSON.parse(JSON.stringify(prevState));
    
            const { characterId, event } = prevState.activeEvent;
            const character = nextState.familyMembers[characterId];
            const { effect } = choice;

            let finalEffect = effect;
            if (effect.getDynamicEffect) {
                const dynamicResult = effect.getDynamicEffect();
                finalEffect = { 
                    ...effect, 
                    ...dynamicResult,
                    statChanges: { ...effect.statChanges, ...dynamicResult.statChanges }
                };
            }
    
            // 1. Apply direct stat/fund changes
            if (finalEffect.statChanges) {
                for (const [stat, change] of Object.entries(finalEffect.statChanges)) {
                    const key = stat as keyof Stats;
                    if (key === 'skill' && character.phase !== LifePhase.PostGraduation && character.phase !== LifePhase.Retired) {
                        continue;
                    }
                    character.stats[key] = Math.max(0, character.stats[key] + change);
                    if (key === 'iq') {
                        character.stats[key] = Math.min(200, character.stats[key]);
                    } else {
                        character.stats[key] = Math.min(100, character.stats[key]);
                    }
                }
            }
    
            if (finalEffect.fundChange) {
                nextState.familyFund += finalEffect.fundChange;
            }
    
            // 2. Update one-time event list or cooldowns
            // SPECIAL HANDLING for the repeating children milestone
            if (event.id === 'milestone_children') {
                const cooldownYears = 3; // 3 years
                character.childrenEventCooldownUntil = addDays(nextState.currentDate, cooldownYears * DAYS_IN_YEAR);
            } 
            // HANDLING for all other one-time events
            else if (ONE_TIME_EVENT_IDS.includes(event.id) || event.isMilestone) {
                character.completedOneTimeEvents = [...(character.completedOneTimeEvents || []), event.id];
            }
    
            // 3. Process actions, which return partial state updates
            if (finalEffect.action) {
                const updates = finalEffect.action(nextState, characterId);
                // Merge the partial state update.
                Object.assign(nextState, updates);
            }
    
            // 4. Determine the next event (trigger or null)
            let eventTriggered = false;
            if (finalEffect.triggers) {
                for (const trigger of finalEffect.triggers) {
                    if (Math.random() < trigger.chance) {
                        const triggeredEvent = EVENTS.find(e => e.id === trigger.eventId);
                        if (triggeredEvent) {
                            let newCharacterId = characterId;
                            if (trigger.reTarget === 'parents') {
                                const originalChar = nextState.familyMembers[characterId];
                                const parents = originalChar.parentsIds.map((id: string) => nextState.familyMembers[id]).filter((p: Character) => p && p.isAlive);
                                if (parents.length > 0) newCharacterId = parents[0].id;
                            }
                            nextState.activeEvent = { characterId: newCharacterId, event: triggeredEvent };
                            eventTriggered = true;
                            break;
                        }
                    }
                }
            }

            // 5. Add detailed log entry
            // BUG FIX: The 'milestone_child_conceived' action handles its own logging to support multiples (twins, etc).
            // To avoid a duplicate log entry, we skip the generic logging for this specific event.
            if (event.id !== 'milestone_child_conceived') {
                const displayName = getCharacterDisplayName(character, language);
                const logMessage: GameLogEntry = {
                    year: nextState.currentDate.year,
                    messageKey: finalEffect.logKey,
                    replacements: { name: displayName },
                    statChanges: finalEffect.statChanges,
                    fundChange: finalEffect.fundChange,
                    characterId: characterId,
                    eventTitleKey: event.titleKey,
                };
                nextState.gameLog.push(logMessage);
            }
    
            // If an event was NOT triggered, we leave the activeEvent as is.
            // The modal is responsible for closing itself by calling onEventModalClose.
            
            // 6. Check for victory condition
            const childBorn = Object.values(nextState.familyMembers).find((c: Character) => c.generation >= 6);
            if(childBorn) {
                nextState.gameOverReason = 'victory';
            }
    
            return nextState;
        });
    }, [language]);


    const handleCloseEventModal = useCallback(() => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = { ...prevState, activeEvent: null };
            return newState;
        });
        setIsPaused(false);
    }, []);

    const handleSchoolChoice = useCallback((option: SchoolOption) => {
        if (gameState?.pendingSchoolChoice?.length === 1) {
            setIsPaused(false);
        }
        setGameState(prevState => {
            if (!prevState || !prevState.pendingSchoolChoice || prevState.pendingSchoolChoice.length === 0) return prevState;
            
            const currentChoice = prevState.pendingSchoolChoice[0];
            const { characterId } = currentChoice;
            const character = prevState.familyMembers[characterId];
            let newStats = { ...character.stats };

            for (const [stat, change] of Object.entries(option.effects)) {
                const key = stat as keyof typeof character.stats;
                newStats[key] = Math.max(0, newStats[key] + change);
                if (key === 'iq') newStats[key] = Math.min(200, newStats[key]);
                else if (key !== 'skill') newStats[key] = Math.min(100, newStats[key]);
            }

            let newStatusEndYear = character.statusEndYear;
            if (currentChoice.newPhase === LifePhase.MiddleSchool) {
                newStatusEndYear = prevState.currentDate.year + 4;
            } else if (currentChoice.newPhase === LifePhase.HighSchool) {
                newStatusEndYear = prevState.currentDate.year + 3;
            }

            const updatedCharacter: Character = {
                ...character,
                phase: currentChoice.newPhase,
                status: CharacterStatus.InEducation,
                education: option.nameKey,
                stats: newStats,
                statusEndYear: newStatusEndYear
            };
            const displayName = getCharacterDisplayName(updatedCharacter, language);

            const remainingChoices = prevState.pendingSchoolChoice.slice(1);
            
            const logEntry: GameLogEntry = {
                year: prevState.currentDate.year,
                messageKey: option.logKey,
                replacements: { name: displayName },
                statChanges: option.effects,
                fundChange: -option.cost,
                characterId: characterId,
                eventTitleKey: 'event_school_choice_title',
            };

            return {
                ...prevState,
                familyFund: prevState.familyFund - option.cost,
                familyMembers: {
                    ...prevState.familyMembers,
                    [characterId]: updatedCharacter
                },
                gameLog: [...prevState.gameLog, logEntry],
                pendingSchoolChoice: remainingChoices.length > 0 ? remainingChoices : null,
            };
        });
    }, [language, gameState]);

    const handleUniversityChoice = useCallback((goToUniversity: boolean) => {
        if (gameState?.pendingUniversityChoice?.length === 1) {
            setIsPaused(false);
        }
        setGameState(prevState => {
            if (!prevState || !prevState.pendingUniversityChoice || prevState.pendingUniversityChoice.length === 0) return prevState;

            const currentChoice = prevState.pendingUniversityChoice[0];
            const { characterId } = currentChoice;
            const character = prevState.familyMembers[characterId];
            const displayName = getCharacterDisplayName(character, language);

            const remainingChoices = prevState.pendingUniversityChoice.slice(1);

            if (goToUniversity) {
                const shuffledMajors = [...UNIVERSITY_MAJORS].sort(() => 0.5 - Math.random());
                const selectedMajors = shuffledMajors.slice(0, 5);
                return {
                    ...prevState,
                    pendingMajorChoice: { characterId, options: selectedMajors },
                    pendingUniversityChoice: remainingChoices.length > 0 ? remainingChoices : null,
                };
            } else {
                const careerOptions = generateCareerChoices(character);
                return {
                    ...prevState,
                    familyMembers: {
                        ...prevState.familyMembers,
                        [characterId]: { ...character, status: CharacterStatus.Idle, phase: LifePhase.PostGraduation }
                    },
                    pendingCareerChoice: { characterId: characterId, options: careerOptions },
                    gameLog: [...prevState.gameLog, { 
                        year: prevState.currentDate.year, 
                        messageKey: 'log_graduated_enter_workforce', 
                        replacements: {name: displayName},
                        characterId: characterId,
                        eventTitleKey: 'event_university_decision_title',
                    }],
                    pendingUniversityChoice: remainingChoices.length > 0 ? remainingChoices : null,
                };
            }
        });
    }, [language, gameState]);

    const handleMajorChoice = useCallback((major: UniversityMajor) => {
        setGameState(prevState => {
            if(!prevState || !prevState.pendingMajorChoice) return prevState;
            const { characterId } = prevState.pendingMajorChoice;
            const character = prevState.familyMembers[characterId];
            let newStats = { ...character.stats };
            for (const [stat, change] of Object.entries(major.effects)) {
                const key = stat as keyof typeof character.stats;
                if (key === 'skill') {
                    continue;
                }
                newStats[key] = Math.max(0, newStats[key] + change);
            }

            const updatedCharacter: Character = {
                ...character,
                major: major.nameKey,
                education: `University (${major.nameKey})`,
                status: CharacterStatus.InEducation,
                statusEndYear: prevState.currentDate.year + 4,
                stats: newStats
            };
            const displayName = getCharacterDisplayName(updatedCharacter, language);
            
            const logEntry: GameLogEntry = {
                year: prevState.currentDate.year,
                messageKey: 'log_enrolled_university',
                replacements: { name: displayName, major: t(major.nameKey, language) },
                statChanges: major.effects,
                fundChange: -major.cost,
                characterId: characterId,
                eventTitleKey: 'event_major_choice_title',
            };

            return {
                ...prevState,
                familyFund: prevState.familyFund - major.cost,
                familyMembers: {
                    ...prevState.familyMembers,
                    [characterId]: updatedCharacter
                },
                gameLog: [...prevState.gameLog, logEntry],
                pendingMajorChoice: null,
            };
        });
        setIsPaused(false);
    }, [language]);
    
    const handleAbandonUniversity = useCallback(() => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingMajorChoice) return prevState;
            const { characterId } = prevState.pendingMajorChoice;
            const character = prevState.familyMembers[characterId];
            const displayName = getCharacterDisplayName(character, language);

            const careerOptions = generateCareerChoices(character);
            const updatedCharacter = {
                ...character,
                status: CharacterStatus.Idle,
                phase: LifePhase.PostGraduation
            };

            return {
                ...prevState,
                familyMembers: {
                    ...prevState.familyMembers,
                    [characterId]: updatedCharacter
                },
                pendingMajorChoice: null,
                pendingCareerChoice: { characterId, options: careerOptions },
                gameLog: [...prevState.gameLog, { 
                    year: prevState.currentDate.year, 
                    messageKey: 'log_abandon_university_for_work', 
                    replacements: { name: displayName },
                    characterId: characterId,
                    eventTitleKey: 'event_major_choice_title',
                }],
            };
        });
        setIsPaused(false);
    }, [language]);

    const handleCareerChoice = useCallback((choiceKey: string) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingCareerChoice) return prevState;

            const { characterId } = prevState.pendingCareerChoice;
            const character = prevState.familyMembers[characterId];
            const displayName = getCharacterDisplayName(character, language);
            let nextState = JSON.parse(JSON.stringify(prevState));
            
            if (choiceKey === 'job') {
                const careerOptions = generateCareerChoices(character);
                nextState.pendingCareerChoice = { characterId: characterId, options: careerOptions };
                return nextState;
            }

            nextState.pendingCareerChoice = null;

            if (choiceKey === 'internship' || choiceKey === 'vocational') {
                 if (choiceKey === 'internship') {
                    const updatedCharacter: Character = {
                        ...character,
                        status: CharacterStatus.Internship,
                        statusEndYear: prevState.currentDate.year + INTERNSHIP.duration,
                    };
                    nextState.familyMembers[characterId] = updatedCharacter;
                    nextState.gameLog.push({ 
                        year: prevState.currentDate.year, 
                        messageKey: 'log_started_internship', 
                        replacements: {name: displayName},
                        characterId: characterId,
                        eventTitleKey: 'event_career_choice_title',
                    });
                } else { // vocational
                    const updatedCharacter: Character = {
                        ...character,
                        status: CharacterStatus.VocationalTraining,
                        statusEndYear: prevState.currentDate.year + VOCATIONAL_TRAINING.duration,
                        education: 'education_vocational_diploma',
                    };
                    nextState.familyFund -= VOCATIONAL_TRAINING.cost;
                    nextState.familyMembers[characterId] = updatedCharacter;
                    nextState.gameLog.push({ 
                        year: prevState.currentDate.year, 
                        messageKey: 'log_enrolled_vocational', 
                        replacements: {name: displayName},
                        characterId: characterId,
                        eventTitleKey: 'event_career_choice_title',
                    });
                }
                setIsPaused(false);
                return nextState;
            }
            
            const trackDetails = CAREER_LADDER[choiceKey];
            if (!trackDetails) return prevState; 

            const isMajorMatch = trackDetails.requiredMajor && character.major === trackDetails.requiredMajor;
            const noMajorRequired = !trackDetails.requiredMajor;
            const hasDegree = !!character.major;
            
            const iqReq = trackDetails.iqRequired || 0;
            const confReq = trackDetails.confidenceRequired || 0;
            const isStatQualified = character.stats.iq >= iqReq && character.stats.confidence >= confReq;

            let updatedCharacter: Partial<Character> = {};
            let logEntry: GameLogEntry | null = null;

            // THIS IS THE ONLY CASE FOR THE TRAINEE/PENALIZED MODAL
            if (isMajorMatch && !isStatQualified) {
                nextState.pendingUnderqualifiedChoice = { characterId, careerTrackKey: choiceKey };
                return nextState;
            }

            // All other cases get an immediate job assignment
            if ((isMajorMatch || noMajorRequired) && isStatQualified) {
                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: 0
                };
                logEntry = { year: prevState.currentDate.year, messageKey: 'log_found_job', replacements: { name: displayName, title: t(trackDetails.levels[0].titleKey, language) }, characterId, eventTitleKey: 'event_career_choice_title' };
            } else if (hasDegree && !isMajorMatch && isStatQualified) {
                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: 0.30
                };
                logEntry = { year: prevState.currentDate.year, messageKey: 'log_accepted_mismatched_job', replacements: { name: displayName, title: t(trackDetails.levels[0].titleKey, language) }, characterId, eventTitleKey: 'event_career_choice_title' };
            } else { // Underqualified for other reasons (mismatched major + low stats, or no degree + low stats)
                const iqDeficit = Math.max(0, iqReq - character.stats.iq);
                const confDeficit = Math.max(0, confReq - character.stats.confidence);
                const iqPenalty = iqReq > 0 ? iqDeficit / iqReq : 0;
                const confPenalty = confReq > 0 ? confDeficit / confReq : 0;
                const numDeficits = (iqDeficit > 0 ? 1 : 0) + (confDeficit > 0 ? 1 : 0);
                const lowStatPenalty = numDeficits > 0 ? (iqPenalty + confPenalty) / numDeficits : 0;
                
                const mismatchPenalty = (trackDetails.requiredMajor && !isMajorMatch) ? 0.30 : 0;
                const combinedPenalty = Math.min(0.9, mismatchPenalty + lowStatPenalty);

                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: combinedPenalty
                };

                const messageKey = mismatchPenalty > 0 ? 'log_accepted_severely_underqualified_job' : 'log_accepted_penalized_job';
                logEntry = { year: prevState.currentDate.year, messageKey, replacements: { name: displayName, title: t(trackDetails.levels[0].titleKey, language) }, characterId, eventTitleKey: 'event_career_choice_title' };
            }
            
            if (logEntry) {
                nextState.familyMembers[characterId] = { ...character, ...updatedCharacter };
                nextState.gameLog.push(logEntry);
            }
            
            setIsPaused(false);
            return nextState;
        });
    }, [language]);

    const handleUnderqualifiedChoice = useCallback((isTrainee: boolean) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingUnderqualifiedChoice) return prevState;

            const { characterId, careerTrackKey } = prevState.pendingUnderqualifiedChoice;
            const character = prevState.familyMembers[characterId];
            const track = CAREER_LADDER[careerTrackKey];
            const displayName = getCharacterDisplayName(character, language);

            let updatedCharacter: Partial<Character> = {};
            let logEntry: GameLogEntry;

            if (isTrainee) {
                updatedCharacter = {
                    status: CharacterStatus.Trainee,
                    traineeForCareer: careerTrackKey,
                    careerTrack: null,
                    careerLevel: 0,
                    progressionPenalty: 0,
                    stats: { ...character.stats, skill: 0 },
                };
                logEntry = {
                    year: prevState.currentDate.year,
                    messageKey: 'log_became_trainee',
                    replacements: { name: displayName, careerName: t(track.nameKey, language) },
                    characterId: characterId,
                    eventTitleKey: 'event_underqualified_decision_title',
                }
            } else {
                const iqDeficit = Math.max(0, track.iqRequired - character.stats.iq);
                const confDeficit = Math.max(0, track.confidenceRequired - character.stats.confidence);
                const iqPenalty = track.iqRequired > 0 ? iqDeficit / track.iqRequired : 0;
                const confPenalty = track.confidenceRequired > 0 ? confDeficit / track.confidenceRequired : 0;
                const numDeficits = (iqDeficit > 0 ? 1 : 0) + (confDeficit > 0 ? 1 : 0);
                const totalPenalty = numDeficits > 0 ? (iqPenalty + confPenalty) / numDeficits : 0;
                
                updatedCharacter = {
                    status: CharacterStatus.Working,
                    careerTrack: careerTrackKey,
                    careerLevel: 0,
                    progressionPenalty: totalPenalty,
                    traineeForCareer: null,
                    stats: { ...character.stats, skill: 0 },
                };
                 logEntry = {
                    year: prevState.currentDate.year,
                    messageKey: 'log_accepted_penalized_job',
                    replacements: { name: displayName, title: t(track.levels[0].titleKey, language) },
                    characterId: characterId,
                    eventTitleKey: 'event_underqualified_decision_title',
                }
            }
            
            return {
                ...prevState,
                familyMembers: {
                    ...prevState.familyMembers,
                    [characterId]: { ...character, ...updatedCharacter },
                },
                gameLog: [...prevState.gameLog, logEntry],
                pendingUnderqualifiedChoice: null,
            };
        });
        setIsPaused(false);
    }, [language]);

    const handleLoanChoice = useCallback((amount: number, term: number) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newLoan: Loan = {
                id: crypto.randomUUID(),
                amount: amount,
                dueDate: { day: prevState.currentDate.day, year: prevState.currentDate.year + term }
            };
            const actor = Object.values(prevState.familyMembers).find(c => c.isAlive);
            return {
                ...prevState,
                familyFund: prevState.familyFund + amount,
                activeLoans: [...prevState.activeLoans, newLoan],
                pendingLoanChoice: null,
                gameLog: [...prevState.gameLog, { 
                    year: prevState.currentDate.year, 
                    messageKey: 'log_loan_taken', 
                    replacements: { amount: amount.toLocaleString(), term: term },
                    characterId: actor?.id,
                    eventTitleKey: 'event_loan_decision_title'
                }]
            };
        });
        setIsPaused(false);
    }, []);

    const handlePromotionAccept = useCallback(() => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingPromotion) return prevState;
            const { characterId, newLevel, newTitleKey } = prevState.pendingPromotion;
            const character = prevState.familyMembers[characterId];
            const updatedCharacter = {
                ...character,
                careerLevel: newLevel,
                stats: { ...character.stats, happiness: Math.min(100, character.stats.happiness + 10), confidence: Math.min(100, character.stats.confidence + 5) }
            };
            const displayName = getCharacterDisplayName(character, language);
            const logEntry: GameLogEntry = {
                year: prevState.currentDate.year,
                messageKey: 'log_promoted',
                replacements: { name: displayName, title: t(newTitleKey, language) },
                statChanges: { happiness: 10, confidence: 5 },
                characterId: characterId,
                eventTitleKey: 'event_promotion_title',
            };

            return {
                ...prevState,
                familyMembers: { ...prevState.familyMembers, [characterId]: updatedCharacter },
                pendingPromotion: null,
                gameLog: [...prevState.gameLog, logEntry]
            };
        });
        setIsPaused(false);
    }, [language]);

    const handleAssignToBusiness = useCallback((businessId: string, slotIndex: number, newCharacterId: string | null) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const business = prevState.familyBusinesses[businessId];
            if (!business) return prevState;
    
            const nextState = JSON.parse(JSON.stringify(prevState));
            const businessToUpdate = nextState.familyBusinesses[businessId];
            const oldCharacterId = businessToUpdate.slots[slotIndex].assignedCharacterId;
    
            // Step 1: Unassign the character who was previously in THIS slot.
            if (oldCharacterId && oldCharacterId !== 'robot' && nextState.familyMembers[oldCharacterId]) {
                const oldChar = nextState.familyMembers[oldCharacterId];
                oldChar.status = CharacterStatus.Unemployed;
                oldChar.monthlyNetIncome = 0;
            }
    
            // Step 2: If we are assigning a new character, unassign them from ANY OTHER slot they might be in.
            if (newCharacterId && newCharacterId !== 'robot' && nextState.familyMembers[newCharacterId]) {
                // Find and clear any existing assignment for the new character across all businesses
                for (const bId in nextState.familyBusinesses) {
                    const b = nextState.familyBusinesses[bId];
                    for (const s of b.slots) {
                        if (s.assignedCharacterId === newCharacterId) {
                            s.assignedCharacterId = null;
                        }
                    }
                }
    
                // Step 3: Update the new character's status and log the change.
                const char = nextState.familyMembers[newCharacterId];
                const businessDef = BUSINESS_DEFINITIONS[business.type];
                if (char.status === CharacterStatus.Working && char.careerTrack) {
                    const oldJob = t(CAREER_LADDER[char.careerTrack].levels[char.careerLevel].titleKey, language);
                    nextState.gameLog.push({
                        year: nextState.currentDate.year,
                        messageKey: 'log_quit_job_for_business',
                        replacements: { name: char.name, oldJob: oldJob, businessName: t(businessDef.nameKey, language) },
                        characterId: char.id,
                        eventTitleKey: 'event_business_assignment_title',
                    });
                } else {
                    nextState.gameLog.push({
                        year: nextState.currentDate.year,
                        messageKey: 'log_started_at_business',
                        replacements: { name: char.name, businessName: t(businessDef.nameKey, language) },
                        characterId: char.id,
                        eventTitleKey: 'event_business_assignment_title',
                    });
                }
                char.status = CharacterStatus.Working;
                char.careerTrack = null;
                char.careerLevel = 0;
    
                // Only reset skill if the new role requires a different major
                const slot = businessToUpdate.slots[slotIndex];
                if (slot.requiredMajor !== 'Unskilled' && char.major !== slot.requiredMajor) {
                    char.stats.skill = 0;
                }
            }
    
            // Step 4: Assign the new character to the target slot.
            businessToUpdate.slots[slotIndex].assignedCharacterId = newCharacterId;
    
            return nextState;
        });
    }, [language]);
    
    const handleUpgradeBusiness = useCallback((businessId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const business = prevState.familyBusinesses[businessId];
            const definition = BUSINESS_DEFINITIONS[business.type];
            if (!business || !definition || business.level >= 2) return prevState;
    
            const upgradeCost = definition.cost * 0.75;
            const actor = Object.values(prevState.familyMembers).find(c => c.isAlive);

            if (prevState.familyFund < upgradeCost) {
                return { ...prevState, gameLog: [...prevState.gameLog, { year: prevState.currentDate.year, messageKey: 'log_business_upgrade_fail', replacements: { businessName: t(definition.nameKey, language) } }] };
            }
    
            const upgradedBusiness = {
                ...business,
                level: business.level + 1,
                slots: [...business.slots, ...definition.upgradeSlots.map(s => ({...s, role: s.roleKey, assignedCharacterId: null}))]
            };
    
            return {
                ...prevState,
                familyFund: prevState.familyFund - upgradeCost,
                familyBusinesses: { ...prevState.familyBusinesses, [businessId]: upgradedBusiness },
                gameLog: [...prevState.gameLog, { 
                    year: prevState.currentDate.year, 
                    messageKey: 'log_business_upgraded', 
                    replacements: { businessName: t(definition.nameKey, language) },
                    characterId: actor?.id,
                    eventTitleKey: 'event_business_upgrade_title',
                }]
            };
        });
    }, [language]);

    const handleBuyBusiness = useCallback((businessType: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const definition = BUSINESS_DEFINITIONS[businessType];
            if (!definition) return prevState;
    
            const actor = Object.values(prevState.familyMembers).find(c => c.isAlive);

            if (prevState.familyFund < definition.cost) {
                return { ...prevState, gameLog: [...prevState.gameLog, { year: prevState.currentDate.year, messageKey: 'log_business_purchase_fail', replacements: { businessName: t(definition.nameKey, language) } }] };
            }
    
            const newBusiness: Business = {
                id: crypto.randomUUID(),
                name: t(definition.nameKey, language),
                type: businessType,
                level: 1,
                ownerId: actor?.id || '', 
                slots: definition.slots.map(s => ({ role: s.roleKey, requiredMajor: s.requiredMajor, assignedCharacterId: null })),
                baseRevenue: definition.baseRevenue,
            };
    
            const updatedFamilyBusinesses = { ...prevState.familyBusinesses };
            updatedFamilyBusinesses[newBusiness.id] = newBusiness;

            return {
                ...prevState,
                familyFund: prevState.familyFund - definition.cost,
                familyBusinesses: updatedFamilyBusinesses,
                gameLog: [...prevState.gameLog, { 
                    year: prevState.currentDate.year, 
                    messageKey: 'log_business_purchased', 
                    replacements: { businessName: t(definition.nameKey, language) },
                    characterId: actor?.id,
                    eventTitleKey: 'event_business_purchase_title',
                }]
            };
        });
    }, [language]);
    
    const handlePurchaseAsset = useCallback((assetId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const assetDef = ASSET_DEFINITIONS[assetId];
            if (!assetDef || prevState.familyFund < assetDef.cost || prevState.purchasedAssets.some(a => a.id === assetId)) {
                return prevState;
            }
    
            const newAsset: PurchasedAsset = {
                id: assetId,
                purchaseYear: prevState.currentDate.year,
            };
            
            const actor = Object.values(prevState.familyMembers).find(c => c.isPlayerCharacter); // Target player character for permanent effects
            if (actor && assetDef.effects) {
                const updatedActorStats = { ...actor.stats };
                for (const [stat, value] of Object.entries(assetDef.effects)) {
                    const key = stat as keyof Stats;
                    const currentStatValue = updatedActorStats[key] ?? 0;
                    const max = (key === 'iq') ? 200 : 100;
                    // Apply percentage increase: current_value * (1 + percentage_effect)
                    updatedActorStats[key] = Math.min(max, Math.max(0, currentStatValue * (1 + value)));
                }
                // Update the actor in nextState.familyMembers
                prevState = {
                    ...prevState,
                    familyMembers: {
                        ...prevState.familyMembers,
                        [actor.id]: {
                            ...actor,
                            stats: updatedActorStats
                        }
                    }
                };
            }

            return {
                ...prevState,
                familyFund: prevState.familyFund - assetDef.cost,
                purchasedAssets: [...prevState.purchasedAssets, newAsset],
                gameLog: [...prevState.gameLog, {
                    year: prevState.currentDate.year,
                    messageKey: 'log_asset_purchased',
                    replacements: { name: t(assetDef.nameKey, prevState.lang) },
                    fundChange: -assetDef.cost,
                    characterId: actor?.id,
                    eventTitleKey: 'event_asset_purchase_title',
                }]
            };
        });
    }, []);


    const handleAvatarSave = (newState: AvatarState) => {
        if (customizingCharacterId) {
            setGameState(prevState => {
                if (!prevState) return null;
                const char = prevState.familyMembers[customizingCharacterId];
                if (!char) return prevState;
                const updatedChar = { ...char, avatarState: newState };
                return {
                    ...prevState,
                    familyMembers: { ...prevState.familyMembers, [customizingCharacterId]: updatedChar }
                };
            });
        }
        setCustomizingCharacterId(null);
    };

    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen">Initializing...</div>; // Or a proper loading screen
    }

    if (customizingCharacterId && gameState) {
        const characterToCustomize = gameState.familyMembers[customizingCharacterId];
        return (
          <AvatarBuilder
            manifest={exampleManifest}
            character={characterToCustomize}
            images={avatarImages}
            onSave={handleAvatarSave}
            onClose={() => setCustomizingCharacterId(null)}
          />
        );
    }
    
    return (
        <GameUI
            view={view}
            mainView={mainView}
            gameState={gameState}
            isPaused={isPaused}
            gameSpeed={gameSpeed}
            showInstructions={showInstructions}
            selectedCharacter={selectedCharacter}
            lang={language}
            avatarImages={avatarImages}
            onSetLang={setLanguage}
            onStartGame={handleStartGame}
            onShowInstructions={() => setShowInstructions(true)}
            onCloseInstructions={() => setShowInstructions(false)}
            onQuitGame={handleStartNewGame}
            onSetIsPaused={setIsPaused}
            onSetGameSpeed={(speed) => setGameSpeed(Number(speed))}
            onSetSelectedCharacter={setSelectedCharacter}
            onOpenAvatarBuilder={setCustomizingCharacterId}
            onEventChoice={handleEventChoice}
            onEventModalClose={handleCloseEventModal}
            onSchoolChoice={handleSchoolChoice}
            onUniversityChoice={handleUniversityChoice}
            onMajorChoice={handleMajorChoice}
            onAbandonUniversity={handleAbandonUniversity}
            onCareerChoice={handleCareerChoice}
            onUnderqualifiedChoice={handleUnderqualifiedChoice}
            onLoanChoice={handleLoanChoice}
            onPromotionAccept={handlePromotionAccept}
            onAssignToBusiness={handleAssignToBusiness}
            onUpgradeBusiness={handleUpgradeBusiness}
            onBuyBusiness={handleBuyBusiness}
            onContinueGame={handleContinueGame}
            onStartNewGame={handleStartNewGame}
            onPurchaseAsset={handlePurchaseAsset}
            onSetMainView={setMainView}
        />
    );
};

export { App };

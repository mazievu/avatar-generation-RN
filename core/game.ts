import { GameState, Character, EventChoice, SchoolOption, UniversityMajor, CareerChoice, PurchasedAsset, Business, Pet, GameEvent, Loan, AvatarState, Stats, GameLogEntry, Club, LifePhase, CharacterStatus, RelationshipStatus, Gender, Language } from './types';
import { GAME_SPEED_MS, DAYS_IN_YEAR, SCHOOL_OPTIONS, UNIVERSITY_MAJORS, CAREER_LADDER, VOCATIONAL_TRAINING, INTERNSHIP, MOURNING_PERIOD_YEARS, PENSION_AMOUNT, getCostOfLiving, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, PET_DATA, BUSINESS_WORKER_BASE_SALARY_MONTHLY, BUSINESS_WORKER_SKILL_MULTIPLIER, ASSET_DEFINITIONS, TRAINEE_SALARY, CONTENT_VERSION } from './constants';
import { CLUBS } from './clubsAndEventsData';
import { SCENARIOS } from './scenarios';
import { getLifePhase, addDays, isBefore, getCharacterDisplayName, calculateNewAdjectiveKey, generateRandomAvatar } from './utils';
import { t } from './localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAllGameData, getAllEvents } from './gameData';
import { applyMigrations } from './migrations';


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

// This function will encapsulate all game logic handlers
export const createGameLogicHandlers = (setGameState: React.Dispatch<React.SetStateAction<GameState | null>>, language: Language, timerRef: React.MutableRefObject<NodeJS.Timeout | null>, setView: React.Dispatch<React.SetStateAction<'menu' | 'playing' | 'gameover' | 'welcome_back'>>, setIsPaused: React.Dispatch<React.SetStateAction<boolean>>, setLanguage: React.Dispatch<React.SetStateAction<Language>>, exampleManifest: any) => {

    // Initialize game data (build events, etc.)
    initializeAllGameData();

    const stopGameLoop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const saveGame = async (gameState: GameState) => {
        if (gameState) {
            try {
                const stateToSave = { ...gameState, lang: language, contentVersion: CONTENT_VERSION };
                await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save game:", error);
            }
        }
    };

    const initializeGame = (mode: string) => {
        const initialYear = 2024;
        const scenario = SCENARIOS.find(s => s.id === mode);

        if (!scenario) {
            console.error(`Scenario with id "${mode}" not found.`);
            const defaultScenario = SCENARIOS[0];
            const initialState = defaultScenario.createInitialState(initialYear, language);
            // Initialize new properties for new characters
            for (const charId in initialState.familyMembers) {
                initialState.familyMembers[charId].lowHappinessYears = 0;
                initialState.familyMembers[charId].lowHealthYears = 0;
                initialState.familyMembers[charId].monthsInCurrentJobLevel = 0;
                initialState.familyMembers[charId].monthsUnemployed = 0;
            }
            setGameState(initialState);
        } else {
            const initialState = scenario.createInitialState(initialYear, language);
            // Initialize new properties for new characters
            for (const charId in initialState.familyMembers) {
                initialState.familyMembers[charId].lowHappinessYears = 0;
                initialState.familyMembers[charId].lowHealthYears = 0;
                initialState.familyMembers[charId].monthsInCurrentJobLevel = 0;
                initialState.familyMembers[charId].monthsUnemployed = 0;
            }
            setGameState(initialState);
        }
        
        setIsPaused(false);
        setView('playing');
    };

    const handleContinueGame = async () => {
        try {
            const savedGame = await AsyncStorage.getItem(SAVE_KEY);
            if (savedGame) {
                let savedState = JSON.parse(savedGame);

                // Apply migrations
                savedState = applyMigrations(savedState);

                // Data migration: Ensure all characters have completedOneTimeEvents array
                if (savedState.familyMembers) {
                    for (const charId in savedState.familyMembers) {
                        if (!savedState.familyMembers[charId].completedOneTimeEvents) {
                            savedState.familyMembers[charId].completedOneTimeEvents = [];
                        }
                        // Initialize new properties for existing characters
                        if (savedState.familyMembers[charId].lowHappinessYears === undefined) {
                            savedState.familyMembers[charId].lowHappinessYears = 0;
                        }
                        if (savedState.familyMembers[charId].lowHealthYears === undefined) {
                            savedState.familyMembers[charId].lowHealthYears = 0;
                        }
                        if (savedState.familyMembers[charId].monthsInCurrentJobLevel === undefined) {
                            savedState.familyMembers[charId].monthsInCurrentJobLevel = 0;
                        }
                        if (savedState.familyMembers[charId].monthsUnemployed === undefined) {
                            savedState.familyMembers[charId].monthsUnemployed = 0;
                        }
                    }
                }
                 if (!savedState.purchasedAssets || Array.isArray(savedState.purchasedAssets)) { // Migration for old saves
                    // If it's an array from an old save, convert it to a record
                    if (Array.isArray(savedState.purchasedAssets)) {
                        savedState.purchasedAssets = savedState.purchasedAssets.reduce((acc: Record<string, PurchasedAsset>, asset: PurchasedAsset) => {
                            acc[asset.id] = asset;
                            return acc;
                        }, {});
                    } else {
                        savedState.purchasedAssets = {};
                    }
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
            await AsyncStorage.removeItem(SAVE_KEY);
            setView('menu');
        }
    };

    const handleStartNewGame = async () => {
        await AsyncStorage.removeItem(SAVE_KEY);
        setGameState(null);
        setView('menu');
    };

    const handleStartGame = (mode: string) => {
        initializeGame(mode);
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
    
    const gameLoop = () => {
        setGameState(prevState => {
            if (!prevState || prevState.gameOverReason) {
                return prevState;
            }

            const newState = { ...prevState };
            const nextFamilyMembers = { ...prevState.familyMembers };
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

            const memberUpdates: Record<string, Partial<Character>> = {};

            if (isNewMonth) {
                // Cleanup invalid business assignments
                for (const businessId in newState.familyBusinesses) {
                    const business = newState.familyBusinesses[businessId];
                    for (const slot of business.slots) {
                        if (slot.assignedCharacterId && slot.assignedCharacterId !== 'robot') {
                            const char = nextFamilyMembers[slot.assignedCharacterId];
                            const isWorkingAge = char && char.isAlive && char.age >= 18 && char.age < 60;
                            if (!isWorkingAge) {
                                slot.assignedCharacterId = null;
                            }
                        }
                    }
                }

                let totalBusinessNetChange = 0;
                const memberUpdates: Record<string, Partial<Character>> = {};
                
                const businessSalaries: Record<string, number> = {}; 
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

                const petExpenses: Record<string, number> = {};
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
                    const charUpdate: Partial<Character> = {};
                    let statsUpdate: Partial<Stats> = {};
                    
                    if (businessSalaries[char.id]) {
                        personalIncome = businessSalaries[char.id];
                        const iqRatio = char.stats.iq / 200; // Assuming max IQ is 200
                        const eqRatio = char.stats.eq / 100; // Assuming max EQ is 100
                        let skillGain = Math.min(1, iqRatio * eqRatio);

                        let assignedBusinessSlot: { role: string; requiredMajor: string; } | null = null;
                        for (const business of Object.values(prevState.familyBusinesses)) {
                            const foundSlot = business.slots.find(s => s.assignedCharacterId === char.id);
                            if (foundSlot) {
                                assignedBusinessSlot = foundSlot;
                                break;
                            }
                        }

                        if (assignedBusinessSlot) {
                            const requiredMajor = assignedBusinessSlot.requiredMajor;
                            if (requiredMajor && requiredMajor !== 'Unskilled' && char.major !== requiredMajor) {
                                skillGain *= 0.5; // 50% slower skill gain
                            }
                        }

                        const newSkill = Math.min(100, char.stats.skill + skillGain); // Cap skill at 100
                        charUpdate.status = CharacterStatus.Working;
                        statsUpdate = { ...(statsUpdate || char.stats), skill: newSkill };
                        charUpdate.monthlyNetIncome = personalIncome - personalExpenses;

                    } else if (char.status === CharacterStatus.Working && char.careerTrack) {
                        const salary = CAREER_LADDER[char.careerTrack].levels[char.careerLevel].salary;
                        personalIncome += salary / 12;
                        const iqRatio = char.stats.iq / 200; // Assuming max IQ is 200
                        const eqRatio = char.stats.eq / 100; // Assuming max EQ is 100

                        const career = CAREER_LADDER[char.careerTrack];
                        const isMismatched = career.requiredMajor && char.major !== career.requiredMajor; // Mismatched major penalty

                        let skillGain = Math.min(1, iqRatio * eqRatio);
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
                            const eqNeeded = career.eqRequired > char.stats.eq;
                            if(iqNeeded) statsUpdate.iq = Math.min(career.iqRequired, (statsUpdate.iq || char.stats.iq) + 0.5);
                            if(eqNeeded) statsUpdate.eq = Math.min(career.eqRequired, (statsUpdate.eq || char.stats.eq) + 0.5);
                            
                            const newIQ = statsUpdate.iq || char.stats.iq;
                            const newEQ = statsUpdate.eq || char.stats.eq;

                            if(newIQ >= career.iqRequired && newEQ >= career.eqRequired) {
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
                        const monthlyEqGain = VOCATIONAL_TRAINING.effects.eq / (VOCATIONAL_TRAINING.duration * 12);
                        statsUpdate = {
                            ...(statsUpdate || char.stats),
                            skill: Math.min(100, char.stats.skill + monthlySkillGain),
                            eq: Math.min(100, char.stats.eq + monthlyEqGain)
                        };
                        charUpdate.monthlyNetIncome = -personalExpenses;
                    } else if (char.status === CharacterStatus.Unemployed) {
                        charUpdate.monthsUnemployed = (char.monthsUnemployed || 0) + 1;
                        statsUpdate = {
                            ...(statsUpdate || char.stats), 
                            happiness: Math.max(0, char.stats.happiness - 1),
                            eq: Math.max(0, char.stats.eq - 1)
                        };
                        charUpdate.monthlyNetIncome = -personalExpenses;

                        // If unemployed for more than a year, character actively seeks job
                        if (charUpdate.monthsUnemployed > 12 && Math.random() < 0.2) {
                            if (!newState.pendingCareerChoice) {
                                const careerOptions = generateCareerChoices(char);
                                newState.pendingCareerChoice = { characterId: char.id, options: careerOptions };
                                nextGameLog.push({
                                    year: newState.currentDate.year,
                                    messageKey: 'log_unemployed_seeking_job',
                                    replacements: { name: getCharacterDisplayName(char, language) },
                                    characterId: char.id,
                                });
                            }
                        }
                    } else {
                        charUpdate.monthlyNetIncome = -personalExpenses;
                    }

                    // Increment monthsInCurrentJobLevel for working characters
                    if (char.status === CharacterStatus.Working && char.careerTrack) {
                        charUpdate.monthsInCurrentJobLevel = (char.monthsInCurrentJobLevel || 0) + 1;

                        // Check for happiness reduction due to no promotion
                        const career = CAREER_LADDER[char.careerTrack];
                        const isHighestLevel = char.careerLevel === career.levels.length - 1;
                        const isWorkingInFamilyBusiness = Object.values(prevState.familyBusinesses).some(business =>
                            business.slots.some(slot => slot.assignedCharacterId === char.id)
                        );

                        if (charUpdate.monthsInCurrentJobLevel === 13 && !isHighestLevel && !isWorkingInFamilyBusiness) {
                            statsUpdate.happiness = Math.max(0, (statsUpdate.happiness ?? char.stats.happiness) - 3);
                            nextGameLog.push({
                                year: newState.currentDate.year,
                                messageKey: 'log_happiness_no_promotion',
                                replacements: { name: getCharacterDisplayName(char, language), jobTitle: t(career.levels[char.careerLevel].titleKey, language) },
                                characterId: char.id,
                            });
                        }
                    }

                    if(Object.keys(statsUpdate).length > 0) charUpdate.stats = { ...char.stats, ...statsUpdate };

                    totalPersonalIncome += personalIncome;
                    memberUpdates[char.id] = { ...(memberUpdates[char.id] || {}), ...charUpdate };
                });

                const totalNetChange = totalPersonalIncome + totalBusinessNetChange - totalPersonalExpenses;
                newState.familyFund = prevState.familyFund + totalNetChange;
                newState.monthlyNetChange = totalNetChange;

                if (newState.familyFund < 0 && !prevState.pendingLoanChoice) {
                    newState.pendingLoanChoice = true;
                }

                // After monthly updates, merge them into nextFamilyMembers
                for (const id in memberUpdates) {
                    nextFamilyMembers[id] = { ...nextFamilyMembers[id], ...memberUpdates[id] };
                }
            }
            
            // Daily updates will now add to the same memberUpdates object
            const livingMemberIds = Object.values(nextFamilyMembers).filter(c => c.isAlive).map(c => c.id);
            for (const id of livingMemberIds) {
                const character = nextFamilyMembers[id];
                const displayName = getCharacterDisplayName(character, language);
                const charUpdate: Partial<Character> = {};
                const statsUpdate: Partial<typeof character.stats> = {};

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
                     const lastDayEvent = getAllEvents().find(e => e.id === 'milestone_death_old_age');
                     if (lastDayEvent) {
                        newState.eventQueue = [{ characterId: character.id, event: lastDayEvent }, ...newState.eventQueue];
                     }
                }

                if (Object.keys(statsUpdate).length > 0) charUpdate.stats = { ...character.stats, ...statsUpdate };
                if (Object.keys(charUpdate).length > 0) {
                     memberUpdates[id] = { ...(memberUpdates[id] || {}), ...charUpdate };
                }
            }

            // Apply all updates (monthly and daily) to the characters
            for (const id in memberUpdates) {
                nextFamilyMembers[id] = { ...nextFamilyMembers[id], ...memberUpdates[id] };
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
                        let char = nextFamilyMembers[id];
                        const displayName = getCharacterDisplayName(char, language);
                        const charUpdate: Partial<Character> = {};

                        // Update low stats counters
                        if (char.stats.happiness < 10) {
                            charUpdate.lowHappinessYears = (char.lowHappinessYears || 0) + 1;
                        } else {
                            charUpdate.lowHappinessYears = 0;
                        }
                        if (char.stats.health < 10) {
                            charUpdate.lowHealthYears = (char.lowHealthYears || 0) + 1;
                        } else {
                            charUpdate.lowHealthYears = 0;
                        }

                        // Check for death due to prolonged low stats
                        if (char.isAlive && ((charUpdate.lowHappinessYears || 0) >= 2 || (charUpdate.lowHealthYears || 0) >= 2)) {
                            charUpdate.isAlive = false;
                            charUpdate.deathDate = newState.currentDate;
                            let deathMessageKey = '';
                            let causeOfDeathKey = '';
                            if ((charUpdate.lowHappinessYears || 0) >= 2 && (charUpdate.lowHealthYears || 0) >= 2) {
                                deathMessageKey = 'log_death_low_happiness_and_health';
                                causeOfDeathKey = 'death_cause_low_happiness_and_health';
                            } else if ((charUpdate.lowHappinessYears || 0) >= 2) {
                                deathMessageKey = 'log_death_low_happiness';
                                causeOfDeathKey = 'death_cause_low_happiness';
                            } else {
                                deathMessageKey = 'log_death_low_health';
                                causeOfDeathKey = 'death_cause_low_health';
                            }
                            nextGameLog.push({
                                year: newState.currentDate.year,
                                characterId: id,
                                eventTitleKey: 'event_death_title',
                                messageKey: deathMessageKey,
                                replacements: { name: displayName },
                            });

                            const mourningEvent = getAllEvents().find(e => e.id === 'milestone_mourning');
                            if (mourningEvent) {
                                const livingMembers = Object.values(nextFamilyMembers).filter(m => m.isAlive && m.id !== id);
                                const newEventQueue = livingMembers.map(member => ({
                                    characterId: member.id,
                                    event: mourningEvent,
                                    replacements: {
                                        deceasedName: displayName,
                                        causeOfDeath: t(causeOfDeathKey, language)
                                    }
                                }));
                                newState.eventQueue.push(...newEventQueue);
                            }
                        }

                        if (Object.keys(charUpdate).length > 0) {
                            char = { ...char, ...charUpdate };
                            nextFamilyMembers[id] = char;
                        }

                        if (char.isAlive && char.age === 6 && char.status === CharacterStatus.Idle) {
                            newSchoolChoices.push({ characterId: id, newPhase: LifePhase.Elementary });
                        } else if (char.isAlive && char.age === 12 && char.status === CharacterStatus.InEducation) {
                            newSchoolChoices.push({ characterId: id, newPhase: LifePhase.MiddleSchool });
                        } else if (char.isAlive && char.age === 16 && char.status === CharacterStatus.InEducation) {
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
                                
                                if (updatedChar.age === 19) { // Changed from 18 to 19
                                    newUniversityChoices.push({ characterId: id });
                                } else { 
                                    if (!careerChoiceSet) {
                                        const careerOptions = generateCareerChoices(updatedChar);
                                        newState.pendingCareerChoice = { characterId: id, options: careerOptions };
                                        careerChoiceSet = true;
                                    }
                                }
                            } 
                            // Handle characters who are already Idle and turn 19
                            else if (char.age === 19 && char.status === CharacterStatus.Idle) { // This condition is correct for characters turning 19 and being idle
                                newUniversityChoices.push({ characterId: id });
                            } 
                            else if (char.age === 60 && char.status !== CharacterStatus.Retired) {
                                const charUpdate: Partial<Character> = { 
                                    status: CharacterStatus.Retired, 
                                    careerTrack: null, 
                                    careerLevel: 0,
                                    monthlyNetIncome: 0
                                };

                                // Unassign from any business
                                for (const businessId in newState.familyBusinesses) {
                                    const business = newState.familyBusinesses[businessId];
                                    const slotIndex = business.slots.findIndex(slot => slot.assignedCharacterId === char.id);
                                    if (slotIndex !== -1) {
                                        business.slots[slotIndex].assignedCharacterId = null;
                                    }
                                }
                                
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
                    const MILESTONE_EVENTS = getAllEvents().filter(e => e.isMilestone);
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

                    const possibleEvents = getAllEvents().filter(e =>
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
                        console.log("GameLoop: Active event set for character:", chosenCharacter.id, "Event:", event.id); // ADD THIS

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
    };

    const handleEventChoice = (choice: EventChoice) => {
        setGameState(prevState => {
            if (!prevState || !prevState.activeEvent) return prevState;
    
            const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    
            const { characterId, event, replacements } = prevState.activeEvent;
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
            console.log(`[DEBUG] handleEventChoice called for event: ${event.id}, action present: ${!!finalEffect.action}`);
    
            // 1. Apply direct stat/fund changes
            if (event.applyEffectToAll) {
                if (finalEffect.statChanges) {
                    Object.values(nextState.familyMembers).forEach(char => {
                        if (char.isAlive) {
                            for (const [stat, change] of Object.entries(finalEffect.statChanges)) {
                                const key = stat as keyof Stats;
                                char.stats[key] = Math.max(0, char.stats[key] + change);
                                if (key === 'iq') {
                                    char.stats[key] = Math.min(200, char.stats[key]);
                                } else {
                                    char.stats[key] = Math.min(100, char.stats[key]);
                                }
                            }
                        }
                    });
                }
            } else {
                const character = nextState.familyMembers[characterId];
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
            }
    
            if (finalEffect.fundChange) {
                nextState.familyFund += finalEffect.fundChange;
            }

            if (event.applyEffectToAll) {
                nextState.eventQueue = nextState.eventQueue.filter((e: any) => e.event.id !== event.id);
            }
    
            // 2. Update one-time event list or cooldowns
            const character = nextState.familyMembers[characterId];
            if (event.id === 'milestone_children') {
                const cooldownYears = 3; // 3 years
                character.childrenEventCooldownUntil = addDays(nextState.currentDate, cooldownYears * DAYS_IN_YEAR);
            } 
            else if (ONE_TIME_EVENT_IDS.includes(event.id) || event.isMilestone) {
                character.completedOneTimeEvents = [...(character.completedOneTimeEvents || []), event.id];
            }
    
            // 3. Process actions, which return partial state updates
            if (finalEffect.action) {
                const updates = finalEffect.action(nextState, characterId, exampleManifest);
                Object.assign(nextState, updates);
                console.log(`[DEBUG] After action, familyMembers count: ${Object.keys(nextState.familyMembers).length}`);
            }
    
            // 4. Determine the next event (trigger or null)
            if (finalEffect.triggers) {
                for (const trigger of finalEffect.triggers) {
                    if (Math.random() < trigger.chance) {
                        const triggeredEvent = getAllEvents().find(e => e.id === trigger.eventId);
                        if (triggeredEvent) {
                            console.log(`[DEBUG] Found triggered event: ${triggeredEvent.id}`);
                            let newCharacterId = characterId;
                            if (trigger.reTarget === 'parents') {
                                const originalChar = nextState.familyMembers[characterId];
                                const parents = originalChar.parentsIds.map((id: string) => nextState.familyMembers[id]).filter((p: Character) => p && p.isAlive);
                                if (parents.length > 0) newCharacterId = parents[0].id;
                            }
                            const allAvailableEvents = getAllEvents();
                            console.log(`[DEBUG] All available events count: ${allAvailableEvents.length}`);
                            const foundTriggeredEvent = allAvailableEvents.find(e => e.id === trigger.eventId);
                            if (foundTriggeredEvent) {
                                console.log(`[DEBUG] Found triggered event: ${foundTriggeredEvent.id}`);
                                nextState.eventQueue.push({ characterId: newCharacterId, event: foundTriggeredEvent });
                                break; // We only process one trigger
                            }
                        }
                    }
                }
            }

            // 5. Add detailed log entry
            if (event.id !== 'milestone_child_conceived') {
                const logReplacements = { ...replacements, name: getCharacterDisplayName(character, language) };
                const logMessage: GameLogEntry = {
                    year: nextState.currentDate.year,
                    messageKey: finalEffect.logKey,
                    replacements: logReplacements,
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
    };


    const handleCloseEventModal = () => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = { ...prevState, activeEvent: null };
            return newState;
        });
        setIsPaused(false);
    };

    const handleSchoolChoice = (option: SchoolOption) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingSchoolChoice || prevState.pendingSchoolChoice.length === 0) return prevState;
            
            const currentChoice = prevState.pendingSchoolChoice[0];
            const { characterId } = currentChoice;
            const character = prevState.familyMembers[characterId];
            const newStats = { ...character.stats };

            for (const [stat, change] of Object.entries(option.effects)) {
                const key = stat as keyof Stats;
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

            let pendingClubChoice: { characterId: string; options: Club[] } | null = null;
            if (currentChoice.newPhase === LifePhase.MiddleSchool) {
                const eligibleClubs = CLUBS.filter(club => {
                    if (club.prerequisites.age && updatedCharacter.age < club.prerequisites.age) {
                        return false;
                    }
                    if (club.prerequisites.stats) {
                        for (const [stat, requiredValue] of Object.entries(club.prerequisites.stats)) {
                            const key = stat as keyof Stats;
                            if (updatedCharacter.stats[key] < requiredValue) {
                                return false;
                            }
                        }
                    }
                    return true;
                });

                const shuffledClubs = eligibleClubs.sort(() => 0.5 - Math.random());
                const clubOptions = shuffledClubs.slice(0, 4);
                if (clubOptions.length > 0) {
                    pendingClubChoice = { characterId, options: clubOptions };
                }
            }

            return {
                ...prevState,
                familyFund: prevState.familyFund - option.cost,
                familyMembers: {
                    ...prevState.familyMembers,
                    [characterId]: updatedCharacter
                },
                gameLog: [...prevState.gameLog, logEntry],
                pendingSchoolChoice: remainingChoices.length > 0 ? remainingChoices : null,
                pendingClubChoice: pendingClubChoice,
            };
        });
    };

    const handleClubChoice = (clubId: string | null) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingClubChoice) return prevState;
            const { characterId } = prevState.pendingClubChoice;
            const character = prevState.familyMembers[characterId];

            if (clubId) {
                const club = CLUBS.find(c => c.id === clubId);
                if (club) {
                    const newStats = { ...character.stats };
                    if (club.effects) {
                        for (const [stat, change] of Object.entries(club.effects)) {
                            const key = stat as keyof Stats;
                            let calculatedValue = Math.round(Math.max(0, newStats[key] + change));
                            if (isNaN(calculatedValue)) {
                                calculatedValue = 0; // Default to 0 or some safe value
                            }
                            if (key === 'iq') newStats[key] = Math.min(200, calculatedValue);
                            else if (key !== 'skill') newStats[key] = Math.min(100, calculatedValue);
                        }
                    }
                    const updatedCharacter: Character = {
                        ...character,
                        currentClubs: [...(character.currentClubs || []), clubId],
                        stats: newStats,
                    };
                    const displayName = getCharacterDisplayName(updatedCharacter, language);
                    const logEntry: GameLogEntry = {
                        year: prevState.currentDate.year,
                        messageKey: 'log_joined_club',
                        replacements: { name: displayName, clubName: t(club.nameKey, language) },
                        characterId: characterId,
                        eventTitleKey: 'event_club_join_title',
                    };
                    return {
                        ...prevState,
                        familyMembers: {
                            ...prevState.familyMembers,
                            [characterId]: updatedCharacter,
                        },
                        gameLog: [...prevState.gameLog, logEntry],
                        pendingClubChoice: null,
                    };
                }
            }
            
            // if player skips or club not found
            return {
                ...prevState,
                pendingClubChoice: null,
            };
        });
        setIsPaused(false);
    };

    const handleUniversityChoice = (goToUniversity: boolean) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingUniversityChoice || prevState.pendingUniversityChoice.length === 0) return prevState;

            if (prevState.pendingUniversityChoice.length === 1) {
                setIsPaused(false);
            }
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
    };

    const handleMajorChoice = (major: UniversityMajor) => {
        setGameState(prevState => {
            if(!prevState || !prevState.pendingMajorChoice) return prevState;
            const { characterId } = prevState.pendingMajorChoice;
            const character = prevState.familyMembers[characterId];
            const newStats = { ...character.stats };
            for (const [stat, change] of Object.entries(major.effects)) {
                const key = stat as keyof Stats;
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
    };
    
    const handleAbandonUniversity = () => {
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
    };

    const handleCareerChoice = (choiceKey: string) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingCareerChoice) return prevState;

            const { characterId } = prevState.pendingCareerChoice;
            const character = prevState.familyMembers[characterId];
            const displayName = getCharacterDisplayName(character, language);
            const nextState = JSON.parse(JSON.stringify(prevState));
            
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
            const eqReq = trackDetails.eqRequired || 0;
            const isStatQualified = character.stats.iq >= iqReq && character.stats.eq >= eqReq;

            let updatedCharacter: Partial<Character> = {};
            let logEntry: GameLogEntry | null = null; // FIX: Changed from GameLogEntry to GameLogEntry | null

            // THIS IS THE ONLY CASE FOR THE TRAINEE/PENALIZED MODAL
            if (isMajorMatch && !isStatQualified) {
                nextState.pendingUnderqualifiedChoice = { characterId, careerTrackKey: choiceKey };
                return nextState;
            }

            // All other cases get an immediate job assignment
            if ((isMajorMatch || noMajorRequired) && isStatQualified) {
                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: 0,
                    monthsInCurrentJobLevel: 0,
                    monthsUnemployed: 0
                };
                logEntry = { year: prevState.currentDate.year, messageKey: 'log_found_job', replacements: { name: displayName, title: t(trackDetails.levels[0].titleKey, language) }, characterId, eventTitleKey: 'event_career_choice_title' };
            } else if (hasDegree && !isMajorMatch && isStatQualified) {
                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: 0.30,
                    monthsInCurrentJobLevel: 0
                };
                logEntry = { year: prevState.currentDate.year, messageKey: 'log_accepted_mismatched_job', replacements: { name: displayName, title: t(trackDetails.levels[0].titleKey, language) }, characterId, eventTitleKey: 'event_career_choice_title' };
            } else { // Underqualified for other reasons (mismatched major + low stats, or no degree + low stats)
                const iqDeficit = Math.max(0, iqReq - character.stats.iq);
                const eqDeficit = Math.max(0, eqReq - character.stats.eq);
                const iqPenalty = iqReq > 0 ? iqDeficit / iqReq : 0; // Use iqReq
                const eqPenalty = eqReq > 0 ? eqDeficit / eqReq : 0; // Use eqReq
                const numDeficits = (iqDeficit > 0 ? 1 : 0) + (eqDeficit > 0 ? 1 : 0);
                const lowStatPenalty = numDeficits > 0 ? (iqPenalty + eqPenalty) / numDeficits : 0;
                
                const mismatchPenalty = (trackDetails.requiredMajor && !isMajorMatch) ? 0.30 : 0;
                const combinedPenalty = Math.min(0.9, mismatchPenalty + lowStatPenalty);

                updatedCharacter = {
                    careerTrack: choiceKey, careerLevel: 0, status: CharacterStatus.Working,
                    phase: LifePhase.PostGraduation, stats: { ...character.stats, skill: 0 }, progressionPenalty: combinedPenalty,
                    monthsInCurrentJobLevel: 0
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
    };

    const handleUnderqualifiedChoice = (isTrainee: boolean) => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingUnderqualifiedChoice) return prevState;

            const { characterId, careerTrackKey } = prevState.pendingUnderqualifiedChoice;
            const character = prevState.familyMembers[characterId];
            const track = CAREER_LADDER[careerTrackKey];
            const displayName = getCharacterDisplayName(character, language);

            let updatedCharacter: Partial<Character> = {};
            let logEntry: GameLogEntry;

            if (isTrainee) {
                updatedCharacter = { // FIX: Changed from const to let
                    status: CharacterStatus.Trainee,
                    traineeForCareer: careerTrackKey,
                    careerTrack: null,
                    careerLevel: 0, // FIX: Added careerLevel
                    progressionPenalty: 0,
                    stats: { ...character.stats, skill: 0 },
                    monthsInCurrentJobLevel: 0
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
                const eqDeficit = Math.max(0, track.eqRequired - character.stats.eq);
                const iqPenalty = track.iqRequired > 0 ? iqDeficit / track.iqRequired : 0;
                const eqPenalty = track.eqRequired > 0 ? eqDeficit / track.eqRequired : 0;
                const numDeficits = (iqDeficit > 0 ? 1 : 0) + (eqDeficit > 0 ? 1 : 0);
                const totalPenalty = numDeficits > 0 ? (iqPenalty + eqPenalty) / numDeficits : 0;
                
                updatedCharacter = {
                    status: CharacterStatus.Working,
                    careerTrack: careerTrackKey,
                    careerLevel: 0,
                    progressionPenalty: totalPenalty,
                    traineeForCareer: null,
                    stats: { ...character.stats, skill: 0 },
                    monthsInCurrentJobLevel: 0
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
    };

    const handleLoanChoice = (amount: number, term: number) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newLoan: Loan = {
                id: '' + Math.random(), // Replaced crypto.randomUUID() with a simple random string
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
    };

    const handlePromotionAccept = () => {
        setGameState(prevState => {
            if (!prevState || !prevState.pendingPromotion) return prevState;
            const { characterId, newLevel, newTitleKey } = prevState.pendingPromotion;
            const character = prevState.familyMembers[characterId];
            const updatedCharacter = {
                ...character,
                careerLevel: newLevel,
                stats: { ...character.stats, happiness: Math.min(100, character.stats.happiness + 20), eq: Math.min(100, character.stats.eq + 5) },
                monthsInCurrentJobLevel: 0
            };
            const displayName = getCharacterDisplayName(character, language);
            const logEntry: GameLogEntry = {
                year: prevState.currentDate.year,
                messageKey: 'log_promoted',
                replacements: { name: displayName, title: t(newTitleKey, language) },
                statChanges: { happiness: 20, eq: 5 },
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
    };

    const handleAssignToBusiness = (businessId: string, slotIndex: number, newCharacterId: string | null) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const business = prevState.familyBusinesses[businessId];
            if (!business) return prevState;
    
            const nextState: GameState = JSON.parse(JSON.stringify(prevState));
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
                char.monthsInCurrentJobLevel = 0;
    
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
    };
    
    const handleUpgradeBusiness = (businessId: string) => {
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
    };

    const handleBuyBusiness = (businessType: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const definition = BUSINESS_DEFINITIONS[businessType];
            if (!definition) return prevState;
    
            const actor = Object.values(prevState.familyMembers).find(c => c.isAlive);

            if (prevState.familyFund < definition.cost) {
                return { ...prevState, gameLog: [...prevState.gameLog, { year: prevState.currentDate.year, messageKey: 'log_business_purchase_fail', replacements: { businessName: t(definition.nameKey, language) } }] };
            }
    
            const newBusiness: Business = {
                id: '' + Math.random(), // Replaced crypto.randomUUID() with a simple random string
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
    };
    
    const handlePurchaseAsset = (assetId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const assetDef = ASSET_DEFINITIONS[assetId];
            if (!assetDef || prevState.familyFund < assetDef.cost || prevState.purchasedAssets[assetId]) {
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
                purchasedAssets: { ...prevState.purchasedAssets, [assetId]: newAsset },
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
    };

    const handleAvatarSave = (customizingCharacterId: string | null, newState: AvatarState) => {
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
    };

    return {
        saveGame,
        initializeGame,
        handleContinueGame,
        handleStartNewGame,
        handleStartGame,
        generateCareerChoices,
        gameLoop,
        handleEventChoice,
        handleCloseEventModal,
        handleSchoolChoice,
        handleClubChoice,
        handleUniversityChoice,
        handleMajorChoice,
        handleAbandonUniversity,
        handleCareerChoice,
        handleUnderqualifiedChoice,
        handleLoanChoice,
        handlePromotionAccept,
        handleAssignToBusiness,
        handleUpgradeBusiness,
        handleBuyBusiness,
        handlePurchaseAsset,
        handleAvatarSave,
        ONE_TIME_EVENT_IDS,
        SAVE_KEY,
        stopGameLoop,
    };
};
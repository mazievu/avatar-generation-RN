import { EventDraft, LifePhase, CharacterStatus, RelationshipStatus, Gender, Character, GameLogEntry } from '../types';
import { handleBirth, generateName, assignNpcCareer, generateRandomAvatar, getCharacterDisplayName } from '../utils';
import { randomUUID } from 'expo-crypto';

import { t } from '../localization';
import { EventIdByKey } from '../../src/generated/eventIds';
import { TWIN_BIRTH_UNLOCK_CHILDREN_COUNT, TRIPLET_BIRTH_UNLOCK_CHILDREN_COUNT } from '../constants'; // Import constants

export const MILESTONE_EVENTS: EventDraft[] = [
    // Relationships & Family
    {
        id: 'milestone_marriage',
        isMilestone: true,
        titleKey: 'milestone_marriage_title',
        descriptionKey: 'milestone_marriage_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char) => char.age >= 23 && char.relationshipStatus === RelationshipStatus.Single && Math.random() < 0.25,
        choices: [
            { textKey: 'milestone_marriage_yes', effect: { 
                statChanges: { happiness: 15 },
                logKey: 'log_milestone_marriage_yes',
                action: (state, charId, manifest) => {
                    const char1 = state.familyMembers[charId];
                    const partnerGender = char1.gender === Gender.Male ? Gender.Female : Gender.Male;
                    
                    let partner: Character = {
                        id: randomUUID(),
                        name: generateName(partnerGender, state.lang),
                        gender: partnerGender,
                        generation: char1.generation,
                        birthDate: { ...char1.birthDate },
                        age: char1.age,
                        isAlive: true,
                        deathDate: null,
                        stats: {
                            iq: Math.max(20, Math.min(200, char1.stats.iq + (Math.floor(Math.random() * 41) - 20))),
                            happiness: Math.max(0, Math.min(100, char1.stats.happiness + (Math.floor(Math.random() * 31) - 15))),
                            eq: Math.min(100, Math.floor(((char1.stats.eq + (Math.floor(Math.random() * 31) - 15))))),
                            health: Math.max(0, Math.min(100, char1.stats.health + (Math.floor(Math.random() * 21) - 10))),
                            skill: 0,
                        },
                        phase: char1.phase,
                        education: "None",
                        major: null,
                        careerTrack: null,
                        careerLevel: 0,
                        status: CharacterStatus.Idle,
                        statusEndYear: null,
                        relationshipStatus: RelationshipStatus.Married,
                        partnerId: char1.id,
                        childrenIds: [],
                        parentsIds: [],
                        isPlayerCharacter: false,
                        mourningUntilYear: null,
                        monthlyNetIncome: 0,
                        eventsThisYear: 0,
                        petId: null,
                        completedOneTimeEvents: [],
                        displayAdjective: null,
                        avatarState: generateRandomAvatar(manifest, char1.age, partnerGender),
                        currentClubs: [],
                        completedClubEvents: [],
                        lowHappinessYears: 0,
                        lowHealthYears: 0,
                        monthsInCurrentJobLevel: 0,
                        monthsUnemployed: 0,
                    };
                    partner = { ...partner, ...assignNpcCareer(partner, manifest) };
                    
                    const updatedChar1 = {
                        ...char1,
                        relationshipStatus: RelationshipStatus.Married,
                        partnerId: partner.id,
                    };

                    return {
                        familyMembers: {
                            ...state.familyMembers,
                            [charId]: updatedChar1,
                            [partner.id]: partner,
                        },
                        totalMembers: state.totalMembers + 1,
                        gameLog: [...state.gameLog, { 
                            year: state.currentDate.year, 
                            messageKey: 'log_married', 
                            replacements: {name1: char1.name, name2: partner.name},
                            characterId: char1.id,
                            eventTitleKey: 'event_marriage_title'
                        }],
                    };
                }
            }},
            { textKey: 'milestone_marriage_no', effect: { statChanges: { happiness: -10 }, logKey: 'log_milestone_marriage_no' }}
        ]
    },
    {
        id: 'milestone_children',
        isMilestone: true,
        titleKey: 'milestone_children_title',
        descriptionKey: 'milestone_children_desc',
        phases: [LifePhase.PostGraduation],
        condition: (state, char) => {
            if (char.childrenEventCooldownUntil) {
                if (state.currentDate.year < char.childrenEventCooldownUntil.year) {
                    return false;
                }
                if (state.currentDate.year === char.childrenEventCooldownUntil.year && state.currentDate.day < char.childrenEventCooldownUntil.day) {
                    return false;
                }
            }
            
            return char.relationshipStatus === RelationshipStatus.Married &&
                   char.gender === Gender.Female &&
                   char.age >= 23 &&
                   char.age <= 45 &&
                   (char.childrenIds?.length || 0) < 6 &&
                   Math.random() < 0.8;
        },
        choices: [
            { textKey: 'milestone_children_yes', effect: { 
                logKey: 'log_milestone_children_decision', // Placeholder for outcome modal
                getDynamicEffect: () => {
                    const randomValue = Math.random(); // Capture random value
                    const success = randomValue < 0.7;
                    if (success) {
                        return {
                            statChanges: { happiness: 20 },
                            logKey: 'log_milestone_children_try_success',
                            triggers: [{ eventId: EventIdByKey.milestone_child_conceived, chance: 1.0 }]
                        }
                    } else {
                        return {
                            statChanges: { happiness: -10 },
                            logKey: 'log_milestone_children_try_fail',
                            triggers: []
                        }
                    }
                }
            }},
            { textKey: 'milestone_children_no', effect: { statChanges: { happiness: -10 }, logKey: 'log_milestone_children_no' }}
        ]
    },
    {
        id: 'milestone_child_conceived',
        isMilestone: true,
        isTriggerOnly: true,
        titleKey: 'milestone_child_conceived_title',
        descriptionKey: 'milestone_child_conceived_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'milestone_child_conceived_ok', effect: {
                logKey: 'log_milestone_child_conceived_ok',
                action: (state, charId, manifest) => {
                    const parent1 = state.familyMembers[charId];
                    if (!parent1.partnerId) return {};
                    const parent2 = state.familyMembers[parent1.partnerId];

                    const roll = Math.random();
                    let numberOfChildren = 1;

                    // Conditional twin/triplet chance based on totalChildrenBorn
                    if (state.totalChildrenBorn >= TRIPLET_BIRTH_UNLOCK_CHILDREN_COUNT && roll < 0.10) {
                        numberOfChildren = 3;
                    } else if (state.totalChildrenBorn >= TWIN_BIRTH_UNLOCK_CHILDREN_COUNT && roll < 0.40) {
                        numberOfChildren = 2;
                    }

                    const children: Character[] = [];
                    for (let i = 0; i < numberOfChildren; i++) {
                        children.push(handleBirth(parent1, parent2, state.currentDate, state.lang, manifest));
                    }
                    
                    const newFamilyMembers = { ...state.familyMembers };
                    const newChildrenIds = children.map(c => c.id);

                    children.forEach(child => {
                        newFamilyMembers[child.id] = child;
                    });

                    const updatedParent1 = { ...parent1, childrenIds: [...parent1.childrenIds, ...newChildrenIds] };
                    const updatedParent2 = { ...parent2, childrenIds: [...parent2.childrenIds, ...newChildrenIds] };
                    newFamilyMembers[parent1.id] = updatedParent1;
                    newFamilyMembers[parent2.id] = updatedParent2;
                    
                    let logMessage: GameLogEntry;

                    if (numberOfChildren === 1) {
                        logMessage = { 
                            year: state.currentDate.year, 
                            messageKey: 'log_had_child', 
                            replacements: {parent1: parent1.name, parent2: parent2.name, childName: children[0].name},
                            characterId: parent1.id,
                            eventTitleKey: 'event_birth_title',
                        };
                    } else if (numberOfChildren === 2) {
                        logMessage = {
                            year: state.currentDate.year,
                            messageKey: 'log_had_twins',
                            replacements: {parent1: parent1.name, parent2: parent2.name, childName1: children[0].name, childName2: children[1].name},
                            characterId: parent1.id,
                            eventTitleKey: 'event_birth_title',
                        };
                    } else { // triplets
                        logMessage = {
                            year: state.currentDate.year,
                            messageKey: 'log_had_triplets',
                            replacements: {parent1: parent1.name, parent2: parent2.name, childName1: children[0].name, childName2: children[1].name, childName3: children[2].name},
                            characterId: parent1.id,
                            eventTitleKey: 'event_birth_title',
                        };
                    }

                    return {
                        familyMembers: newFamilyMembers,
                        totalMembers: state.totalMembers + numberOfChildren,
                        gameLog: [...state.gameLog, logMessage],
                        totalChildrenBorn: state.totalChildrenBorn + numberOfChildren, // Increment totalChildrenBorn
                    };
                }
            }}
        ]
    },
    // End of Life
    {
        id: 'milestone_mourning',
        isMilestone: true,
        isTriggerOnly: true,
        applyEffectToAll: true,
        titleKey: 'milestone_mourning_title',
        descriptionKey: 'milestone_mourning_desc',
        phases: [LifePhase.Newborn, LifePhase.Elementary, LifePhase.MiddleSchool, LifePhase.HighSchool, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            {
                textKey: 'milestone_mourning_choice_1',
                effect: {
                    fundChange: -100,
                    statChanges: { happiness: -15 },
                    logKey: 'log_milestone_mourning_choice_1',
                }
            },
            {
                textKey: 'milestone_mourning_choice_2',
                effect: {
                    fundChange: -500,
                    statChanges: { happiness: -5 },
                    logKey: 'log_milestone_mourning_choice_2',
                }
            },
            {
                textKey: 'milestone_mourning_choice_3',
                effect: {
                    fundChange: -10000,
                    statChanges: { happiness: 10 },
                    logKey: 'log_milestone_mourning_choice_3',
                }
            }
        ]
    },
    {
        id: 'milestone_death_old_age',
        isMilestone: true,
        titleKey: 'milestone_death_old_age_title',
        descriptionKey: 'milestone_death_old_age_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.age > 85 && Math.random() < ((char.age - 85) * 0.02),
        choices: [
            { textKey: 'milestone_death_old_age_ok', effect: {
                logKey: 'log_milestone_death_old_age_ok',
                action: (state, charId) => {
                    const familyMembers: Record<string, Character> = { ...state.familyMembers };
                    const deceasedChar = { ...familyMembers[charId] };
                    deceasedChar.isAlive = false;
                    deceasedChar.deathDate = { ...state.currentDate };
                    familyMembers[charId] = deceasedChar;

                    const mourningEvent = MILESTONE_EVENTS.find(e => e.id === 'milestone_mourning');
                    if (mourningEvent) {
                        const livingMembers = Object.values(familyMembers).filter((m: Character) => m.isAlive && m.id !== charId);
                        if (livingMembers.length > 0) {
                            const newEventQueue = livingMembers.map(member => ({
                                characterId: member.id,
                                event: mourningEvent,
                                replacements: {
                                    deceasedName: getCharacterDisplayName(deceasedChar, state.lang),
                                    causeOfDeath: t('death_cause_old_age', state.lang)
                                }
                            }));
                            state.eventQueue.push(...newEventQueue);
                        }
                    }
                    
                    return { familyMembers };
                }
            }}
        ]
    }
];
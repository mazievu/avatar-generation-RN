import { GameEvent, LifePhase, CharacterStatus, RelationshipStatus, Gender, GameState, Character, GameLogEntry } from '../types';
import { handleBirth, generateName, assignNpcCareer, generateRandomAvatar, addDays } from '../utils';
import { exampleManifest } from '../components/AvatarBuilder';

export const MILESTONE_EVENTS: GameEvent[] = [
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
                action: (state, charId) => {
                    const char1 = state.familyMembers[charId];
                    const partnerGender = char1.gender === Gender.Male ? Gender.Female : Gender.Male;
                    
                    let partner: Character = {
                        id: crypto.randomUUID(),
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
                            confidence: Math.max(0, Math.min(100, char1.stats.confidence + (Math.floor(Math.random() * 31) - 15))),
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
                        avatarState: generateRandomAvatar(exampleManifest, char1.age, partnerGender),
                    };
                    partner = { ...partner, ...assignNpcCareer(partner) };
                    
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
                    const success = Math.random() < 0.7;
                    if (success) {
                        return {
                            statChanges: { happiness: 20 },
                            logKey: 'log_milestone_children_try_success',
                            triggers: [{ eventId: 'milestone_child_conceived', chance: 1.0 }]
                        }
                    } else {
                        return {
                            statChanges: { happiness: -20 },
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
                action: (state, charId) => {
                    const parent1 = state.familyMembers[charId];
                    if (!parent1.partnerId) return {};
                    const parent2 = state.familyMembers[parent1.partnerId];

                    const roll = Math.random();
                    let numberOfChildren = 1;
                    // 5% chance of twins, 1% chance of triplets
                    if (roll < 0.01) { 
                        numberOfChildren = 3;
                    } else if (roll < 0.06) {
                        numberOfChildren = 2;
                    }

                    const children: Character[] = [];
                    for (let i = 0; i < numberOfChildren; i++) {
                        children.push(handleBirth(parent1, parent2, state.currentDate, state.lang));
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
                    };
                }
            }}
        ]
    },
    // End of Life
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
                    const familyMembers = { ...state.familyMembers };
                    const char = { ...familyMembers[charId] };
                    char.isAlive = false;
                    char.deathDate = { ...state.currentDate };
                    familyMembers[charId] = char;

                    Object.values(familyMembers).forEach(m => {
                        if (m.isAlive && m.id !== charId) {
                            const updatedMember = { ...m, 
                                mourningUntilYear: state.currentDate.year + 2,
                                stats: { ...m.stats, happiness: Math.max(0, m.stats.happiness - 20) }
                            };
                            familyMembers[m.id] = updatedMember;
                        }
                    });
                    
                    return { familyMembers };
                }
            }}
        ]
    }
];
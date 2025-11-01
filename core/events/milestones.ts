import { EventDraft, LifePhase, RelationshipStatus, Character, Gender, CharacterStatus, GameState, GameLogEntry } from '../types';
import { getCharacterDisplayName, handleBirth } from '../utils';
import { createSpouse } from '../gameBuilders';
import { EventIdByKey } from '../generated/eventIds';
import { TWIN_BIRTH_UNLOCK_CHILDREN_COUNT, TRIPLET_BIRTH_UNLOCK_CHILDREN_COUNT } from '../constants';

export const milestone_marriage: EventDraft = {
    id: 'milestone_marriage',
    titleKey: 'milestone_marriage_title',
    descriptionKey: 'milestone_marriage_desc',
    phases: [LifePhase.PostGraduation],
    isMilestone: true,
    allowedRelationshipStatuses: [RelationshipStatus.Single],
    getDynamicProps: (state: GameState, char: Character) => {
        const potentialSpouse = createSpouse(char, state.currentDate.year, state.lang);
        return {
            replacements: {
                potentialSpouseName: potentialSpouse.name,
            },
            potentialSpouse,
        };
    },
    choices: [
        { 
            textKey: 'milestone_marriage_yes', 
            effect: { 
                action: (state, charId, _manifest, event) => {
                    const playerChar = state.familyMembers[charId];
                    const spouse = event.potentialSpouse as Character;
                    if (!spouse) return {};

                    const newFamilyMembers = { ...state.familyMembers, [spouse.id]: spouse };
                    
                    newFamilyMembers[charId] = {
                        ...playerChar,
                        relationshipStatus: RelationshipStatus.Married,
                        partnerId: spouse.id,
                    };

                    return { 
                        familyMembers: newFamilyMembers,
                        gameLog: [...state.gameLog, {
                            year: state.currentDate.year,
                            messageKey: 'log_milestone_marriage_yes',
                            replacements: { name: getCharacterDisplayName(playerChar, state.lang), spouseName: getCharacterDisplayName(spouse, state.lang) },
                            characterId: charId,
                            eventTitleKey: 'event_marriage_title'
                        }]
                    };
                },
                logKey: 'log_milestone_marriage_yes',
            }
        },
        { textKey: 'milestone_marriage_no', effect: { statChanges: { happiness: -10 }, logKey: 'log_milestone_marriage_no' }}
    ],
    condition: (state, char) => {
        return char.age >= 25 && char.age <= 40 && !char.partnerId;
    }
};

export const decision_children: EventDraft = {
    id: 'decision_children',
    isMilestone: false,
    titleKey: 'milestone_children_title',
    descriptionKey: 'milestone_children_desc',
    phases: [LifePhase.PostGraduation],
    condition: (state, char) => {
        return char.relationshipStatus === RelationshipStatus.Married &&
               char.gender === Gender.Female &&
               char.age >= 23 &&
               char.age <= 45 &&
               (char.childrenIds?.length || 0) < 6;
    },
    choices: [
        { textKey: 'milestone_children_yes', effect: { 
            logKey: 'log_milestone_children_decision',
            getDynamicEffect: () => {
                const randomValue = Math.random();
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
                        triggers: [{eventId: EventIdByKey.milestone_children_fail, chance: 1.0}]
                    }
                }
            }
        }},
        { textKey: 'milestone_children_no', effect: { statChanges: { happiness: -5 }, logKey: 'log_milestone_children_no' }}
    ]
};

export const milestone_children_fail: EventDraft = {
    id: 'milestone_children_fail',
    isTriggerOnly: true,
    titleKey: 'milestone_children_fail_title',
    descriptionKey: 'milestone_children_fail_desc',
    phases: [LifePhase.PostGraduation],
    choices: [
        {
            textKey: 'milestone_children_fail_ok',
            effect: {
                statChanges: { happiness: -10 },
                logKey: 'log_milestone_children_try_fail'
            }
        }
    ]
};

export const milestone_child_conceived: EventDraft = {
    id: 'milestone_child_conceived',
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
                    totalChildrenBorn: state.totalChildrenBorn + numberOfChildren,
                };
            }
        }}
    ]
};

export const milestone_death_old_age: EventDraft = {
    id: 'milestone_death_old_age',
    titleKey: 'milestone_death_old_age_title',
    descriptionKey: 'milestone_death_old_age_desc',
    phases: Object.values(LifePhase),
    isMilestone: true,
    choices: [
        { textKey: 'ok', effect: { logKey: 'log_milestone_death_old_age' } }
    ]
};

export const milestone_phase_change: EventDraft = {
    id: 'milestone_phase_change',
    titleKey: 'milestone_phase_change_title',
    descriptionKey: 'milestone_phase_change_desc',
    phases: Object.values(LifePhase),
    isMilestone: true,
    choices: [
        { textKey: 'ok', effect: { logKey: 'log_milestone_phase_change' } }
    ]
};

export const milestone_mourning: EventDraft = {
    id: 'milestone_mourning',
    titleKey: 'milestone_mourning_title',
    descriptionKey: 'milestone_mourning_desc',
    phases: Object.values(LifePhase),
    isMilestone: true,
    choices: [
        { textKey: 'ok', effect: { logKey: 'log_milestone_mourning' } }
    ]
};

export const MILESTONE_EVENTS: EventDraft[] = [
    milestone_marriage,
    milestone_death_old_age,
    milestone_phase_change,
    milestone_mourning,
    milestone_child_conceived,
    decision_children,
    milestone_children_fail,
];

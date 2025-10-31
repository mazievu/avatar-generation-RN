import { EventDraft, LifePhase, RelationshipStatus, Character, Gender, CharacterStatus, GameState } from '../types';
import { getCharacterDisplayName } from '../utils';
import { createSpouse } from '../gameBuilders';

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

export const milestone_child_conceived: EventDraft = {
    id: 'milestone_child_conceived',
    titleKey: 'milestone_child_conceived_title',
    descriptionKey: 'milestone_child_conceived_desc',
    phases: Object.values(LifePhase),
    isMilestone: true,
    choices: [
        { textKey: 'ok', effect: { logKey: 'log_milestone_child_conceived' } }
    ]
};

export const MILESTONE_EVENTS: EventDraft[] = [
    milestone_marriage,
    milestone_death_old_age,
    milestone_phase_change,
    milestone_mourning,
    milestone_child_conceived,
];
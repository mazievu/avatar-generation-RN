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
        const potentialSpouse = createSpouse(char, state.currentDate.year);
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
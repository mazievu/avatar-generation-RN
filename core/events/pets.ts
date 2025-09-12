import { EventDraft, LifePhase, Pet, PetType, Stats, Character } from '../types';
import { PET_DATA } from '../constants';
import { randomUUID } from 'expo-crypto';
import { EventIdByKey } from '../../src/generated/eventIds';
// Helper for pet name generation
const PET_NAMES: Record<PetType, string[]> = {
    [PetType.Dog]: ['Buddy', 'Lucy', 'Max', 'Bella', 'Charlie', 'Daisy'],
    [PetType.Cat]: ['Oliver', 'Luna', 'Leo', 'Chloe', 'Milo', 'Lily'],
    [PetType.Parrot]: ['Kiwi', 'Mango', 'Zazu', 'Polly', 'Echo'],
    [PetType.Horse]: ['Spirit', 'Storm', 'Midnight', 'Blaze', 'Willow'],
    [PetType.Fish]: ['Nemo', 'Goldie', 'Bubbles', 'Finny', 'Coral'],
};

const getRandomPetName = (type: PetType): string => {
    const names = PET_NAMES[type];
    return names[Math.floor(Math.random() * names.length)];
}

const removePetFromOwner = (state: any, charId: string) => {
    const familyMembers = { ...state.familyMembers };
    const char = { ...familyMembers[charId] };
    const petId = char.petId;

    if (!petId) return { familyMembers };

    const familyPets = { ...state.familyPets };
    const pet = familyPets[petId];
    if (pet) {
        const petData = PET_DATA[pet.type];
        const effects = petData.effects;
        if (effects) {
            const newStats = { ...char.stats };
            for (const stat in effects) {
                if (Object.prototype.hasOwnProperty.call(effects, stat)) {
                    const key = stat as keyof Stats;
                    const value = effects[key];
                    if (typeof value === 'number') {
                        newStats[key] = Math.max(0, newStats[key] - value);
                    }
                }
            }
            char.stats = newStats;
        }
    }
    delete familyPets[petId];
    char.petId = null;
    familyMembers[charId] = char;

    return { familyMembers, familyPets };
};


export const PET_EVENTS: EventDraft[] = [
    {
        id: 'pet_adoption',
        titleKey: 'event_pet_adoption_title',
        descriptionKey: 'event_pet_adoption_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !char.petId,
        choices: [
            { 
                textKey: 'choice_pet_adoption_1', 
                effect: { 
                    fundChange: -50, 
                    logKey: 'log_pet_adoption_1',
                    action: (state, charId, manifest) => {
                        const char = state.familyMembers[charId];

                        if (char.petId) {
                            return { gameLog: [...state.gameLog, { year: state.currentDate.year, messageKey: 'log_pet_already_owned', replacements: { name: char.name } }] };
                        }

                        const petTypes = Object.values(PetType);
                        const randomPetType = petTypes[Math.floor(Math.random() * petTypes.length)];
                        const petName = getRandomPetName(randomPetType);
                        
                        const newPet: Pet = {
                            id: randomUUID(),
                            name: petName,
                            type: randomPetType,
                            ownerId: charId,
                            age: 0,
                        };

                        const newFamilyPets = { ...state.familyPets, [newPet.id]: newPet };
                        const updatedChar = { ...char, petId: newPet.id };
                        
                        // Apply stat buffs
                        const petData = PET_DATA[newPet.type];
                        if (petData.effects) {
                            const newStats = { ...updatedChar.stats };
                            for (const [stat, value] of Object.entries(petData.effects)) {
                                const key = stat as keyof Stats;
                                newStats[key] = Math.min(100, newStats[key] + (value || 0));
                            }
                            updatedChar.stats = newStats;
                        }

                        return {
                            familyPets: newFamilyPets,
                            familyMembers: { ...state.familyMembers, [charId]: updatedChar },
                            gameLog: [...state.gameLog, { 
                                year: state.currentDate.year, 
                                messageKey: 'log_pet_adopted', 
                                replacements: { name: char.name, petType: randomPetType.toString().toLowerCase(), petName: petName },
                                characterId: char.id,
                                eventTitleKey: 'event_pet_adoption_log_title',
                            }]
                        };
                    }
                } 
            },
            { textKey: 'choice_pet_adoption_2', effect: { logKey: 'log_pet_adoption_2' } },
        ]
    },
    {
        id: 'pet_sick',
        titleKey: 'event_pet_sick_title',
        descriptionKey: 'event_pet_sick_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !!char.petId,
        choices: [
            { textKey: 'choice_pet_sick_1', effect: { fundChange: -100, logKey: 'log_pet_sick_1' } },
            { textKey: 'choice_pet_sick_2', effect: { logKey: 'log_pet_sick_2', triggers: [{ eventId: EventIdByKey.pet_sickness_worsens, chance: 0.5 }] } },
        ]
    },
    {
        id: 'pet_damages_item',
        titleKey: 'event_pet_damages_item_title',
        descriptionKey: 'event_pet_damages_item_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !!char.petId,
        choices: [
            { textKey: 'choice_pet_damages_item_1', effect: { statChanges: { happiness: -1 }, logKey: 'log_pet_damages_item_1' } },
            { textKey: 'choice_pet_damages_item_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_pet_damages_item_2' } },
        ]
    },
    {
        id: 'pet_lost',
        titleKey: 'event_pet_lost_title',
        descriptionKey: 'event_pet_lost_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !!char.petId,
        choices: [
            { textKey: 'choice_pet_lost_1', effect: { fundChange: -50, logKey: 'log_pet_lost_1', triggers: [{ eventId: EventIdByKey.pet_found, chance: 0.7 }, { eventId: 'pet_lost_forever', chance: 0.3 }] } },
            { textKey: 'choice_pet_lost_2', effect: { logKey: 'log_pet_lost_2', triggers: [{ eventId: EventIdByKey.pet_lost_forever, chance: 0.8 }] } },
        ]
    },
    {
        id: 'pet_contest',
        titleKey: 'event_pet_contest_title',
        descriptionKey: 'event_pet_contest_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !!char.petId,
        choices: [
            { textKey: 'choice_pet_contest_1', effect: { fundChange: -20, logKey: 'log_pet_contest_1', triggers: [{ eventId: EventIdByKey.pet_contest_win, chance: 0.4 }, { eventId: 'pet_contest_lose', chance: 0.6 }] } },
            { textKey: 'choice_pet_contest_2', effect: { logKey: 'log_pet_contest_2' } },
        ]
    },
    {
        id: 'pet_gets_old',
        titleKey: 'event_pet_gets_old_title',
        descriptionKey: 'event_pet_gets_old_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state, char: Character) => !!char.petId,
        choices: [
            { textKey: 'choice_pet_gets_old_1', effect: { fundChange: -200, logKey: 'log_pet_gets_old_1' } },
            { 
                textKey: 'choice_pet_gets_old_2', 
                effect: { 
                    statChanges: { happiness: -2 },
                    logKey: 'log_pet_gets_old_2',
                    action: (state, charId, manifest) => removePetFromOwner(state, charId)
                } 
            },
        ]
    },

    // Trigger-only events
    {
        id: 'pet_sickness_worsens',
        titleKey: 'event_pet_sickness_worsens_title',
        descriptionKey: 'event_pet_sickness_worsens_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_pet_sickness_worsens_1', effect: { fundChange: -500, logKey: 'log_pet_sickness_worsens_1' } },
            { textKey: 'choice_pet_sickness_worsens_2', effect: { logKey: 'log_pet_sickness_worsens_2', triggers: [{ eventId: EventIdByKey.pet_dies, chance: 0.8 }] } },
        ]
    },
    {
        id: 'pet_found',
        titleKey: 'event_pet_found_title',
        descriptionKey: 'event_pet_found_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_pet_found_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_pet_found_1' } },
        ]
    },
    {
        id: 'pet_lost_forever',
        titleKey: 'event_pet_lost_forever_title',
        descriptionKey: 'event_pet_lost_forever_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_pet_lost_forever_1', effect: { 
                statChanges: { happiness: -2 }, 
                logKey: 'log_pet_lost_forever_1', 
                action: (state, charId, manifest) => removePetFromOwner(state, charId)
            }}
        ]
    },
    {
        id: 'pet_contest_win',
        titleKey: 'event_pet_contest_win_title',
        descriptionKey: 'event_pet_contest_win_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_pet_contest_win_1', effect: { fundChange: 500, statChanges: { happiness: 2 }, logKey: 'log_pet_contest_win_1' } },
        ]
    },
    {
        id: 'pet_contest_lose',
        titleKey: 'event_pet_contest_lose_title',
        descriptionKey: 'event_pet_contest_lose_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_pet_contest_lose_1', effect: { statChanges: { happiness: -1 }, logKey: 'log_pet_contest_lose_1' } },
        ]
    },
    {
        id: 'pet_dies',
        titleKey: 'event_pet_dies_title',
        descriptionKey: 'event_pet_dies_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
             { textKey: 'choice_pet_dies_1', effect: { 
                statChanges: { happiness: -4 }, 
                logKey: 'log_pet_dies_1', 
                action: (state, charId, manifest) => removePetFromOwner(state, charId)
            }}
        ]
    }
];
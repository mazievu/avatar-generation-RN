import { EventDraft, GameEvent, EventChoice, EventEffect, ClubEventDraft, ClubEvent, Language, Character, Gender, LifePhase, CharacterStatus, RelationshipStatus, AvatarState, Manifest, LayerKey } from './types';
import { EventIdByKey, ChoiceIdByKey } from './generated/eventIds';
import { t } from './localization';
import { exampleManifest } from './types';

// Helper to ensure effect is properly typed
function ensureEventEffect(effect: unknown): EventEffect {
    // In a real scenario, you might want more robust validation or transformation
    // For now, we'll cast it, assuming the draft's effect is compatible.
    return effect as EventEffect;
}

export function buildEvent(draft: EventDraft, lang: Language): GameEvent {
    const eventId = EventIdByKey[draft.id];
    if (!eventId) {
        // Fallback to draft.id if no stable ID is found, though this defeats the purpose
        // In a production environment, you might want to throw an error or handle this more strictly.
        // For now, we'll use the draft.id as a fallback.
        // Or, if we want to force stable IDs, we could return null/undefined and filter later.
        // For this exercise, we'll assume all IDs are found or fall back to draft.id.
        return {
            ...draft,
            id: draft.id, // Use draft.id as fallback
            title: t(draft.titleKey, lang),
            choices: draft.choices.map(choiceDraft => {
                const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
                const choiceId = ChoiceIdByKey[choiceLockKey] || choiceLockKey; // Fallback for choice ID
                return {
                    ...choiceDraft,
                    id: choiceId,
                    label: t(choiceDraft.textKey, lang),
                    effect: ensureEventEffect(choiceDraft.effect),
                };
            }),
        };
    }

    const builtChoices: EventChoice[] = draft.choices.map(choiceDraft => {
        const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
        const choiceId = ChoiceIdByKey[choiceLockKey];

        if (!choiceId) {
            // Fallback to choiceLockKey if no stable ID is found
            return {
                ...choiceDraft,
                id: choiceLockKey, // Use lockKey as fallback
                label: t(choiceDraft.textKey, lang),
                effect: ensureEventEffect(choiceDraft.effect),
            };
        }

        return {
            ...choiceDraft,
            id: choiceId,
            label: t(choiceDraft.textKey, lang),
            effect: ensureEventEffect(choiceDraft.effect),
        };
    });

    return {
        ...draft,
        id: eventId,
        title: t(draft.titleKey, lang),
        choices: builtChoices,
    };
}

export function buildClubEvent(draft: ClubEventDraft, lang: Language): ClubEvent {
    const eventId = draft.id; // Club events use their draft ID directly for now.

    const builtChoices: EventChoice[] = draft.choices.map(choiceDraft => {
        // For club events, we can construct a unique key for choices as well.
        const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
        // We assume club event choices also have stable IDs generated.
        const choiceId = ChoiceIdByKey[choiceLockKey];

        if (!choiceId) {
            return {
                ...choiceDraft,
                id: choiceLockKey, // Fallback
                label: t(choiceDraft.textKey, lang),
                effect: ensureEventEffect(choiceDraft.effect),
            };
        }

        return {
            ...choiceDraft,
            id: choiceId,
            label: t(choiceDraft.textKey, lang),
            effect: ensureEventEffect(choiceDraft.effect),
        };
    });

    return {
        ...draft,
        id: eventId,
        title: t(draft.titleKey, lang),
        choices: builtChoices,
    };
}

export function generateRandomAvatar(manifest: Manifest, gender: Gender): AvatarState {
    const avatarState: AvatarState = {};
    manifest.forEach(layer => {
        if (layer.required) {
            const options = layer.options.filter(o => !o.ageCategory || o.ageCategory === 'normal');
            if (options.length > 0) {
                avatarState[layer.key] = options[Math.floor(Math.random() * options.length)].id;
            }
        }
    });
    return avatarState;
}

export const createSpouse = (char: Character, currentYear: number): Character => {
    const spouseGender = char.gender === Gender.Male ? Gender.Female : Gender.Male;
    const age = 18 + Math.floor(Math.random() * (char.age - 17));
    const birthYear = currentYear - age;

    const spouse: Character = {
        id: `spouse-${char.id}-${currentYear}`,
        name: spouseGender === Gender.Female ? 'Random Woman' : 'Random Man', // Placeholder name
        gender: spouseGender,
        generation: char.generation,
        birthDate: { day: 1, year: birthYear },
        age: age,
        isAlive: true,
        deathDate: null,
        stats: {
            iq: 80 + Math.floor(Math.random() * 40), // 80-120
            happiness: 60 + Math.floor(Math.random() * 20), // 60-80
            eq: 60 + Math.floor(Math.random() * 30), // 60-90
            health: 70 + Math.floor(Math.random() * 20), // 70-90
            skill: 40 + Math.floor(Math.random() * 30), // 40-70
        },
        phase: LifePhase.PostGraduation,
        education: 'High School',
        major: null,
        careerTrack: null,
        careerLevel: 0,
        status: CharacterStatus.Idle,
        statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married,
        partnerId: char.id,
        childrenIds: [],
        parentsIds: [],
        isPlayerCharacter: false,
        mourningUntilYear: null,
        monthlyNetIncome: 0,
        eventsThisYear: 0,
        petId: null,
        completedOneTimeEvents: [],
        currentClubs: [],
        completedClubEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(exampleManifest, spouseGender),
        progressionPenalty: 0,
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };
    return spouse;
};
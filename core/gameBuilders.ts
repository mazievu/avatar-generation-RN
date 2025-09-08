import { EventDraft, GameEvent, EventChoice, EventChoiceDraft, EventEffect, GameState, Character, ClubEventDraft, ClubEvent } from './types';
import { EventIdByKey, ChoiceIdByKey } from '../src/generated/eventIds';

// Helper to ensure effect is properly typed
function ensureEventEffect(effect: unknown): EventEffect {
    // In a real scenario, you might want more robust validation or transformation
    // For now, we'll cast it, assuming the draft's effect is compatible.
    return effect as EventEffect;
}

export function buildEvent(draft: EventDraft): GameEvent {
    const eventId = EventIdByKey[draft.id];
    if (!eventId) {
        console.warn(`Warning: No stable ID found for event draft ID: ${draft.id}. This event might not be properly linked.`);
        // Fallback to draft.id if no stable ID is found, though this defeats the purpose
        // In a production environment, you might want to throw an error or handle this more strictly.
        // For now, we'll use the draft.id as a fallback.
        // Or, if we want to force stable IDs, we could return null/undefined and filter later.
        // For this exercise, we'll assume all IDs are found or fall back to draft.id.
        return {
            ...draft,
            id: draft.id, // Use draft.id as fallback
            choices: draft.choices.map(choiceDraft => {
                const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
                const choiceId = ChoiceIdByKey[choiceLockKey] || choiceLockKey; // Fallback for choice ID
                return {
                    ...choiceDraft,
                    id: choiceId,
                    labelKey: choiceDraft.textKey,
                    effect: ensureEventEffect(choiceDraft.effect),
                };
            }),
        };
    }

    const builtChoices: EventChoice[] = draft.choices.map(choiceDraft => {
        const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
        const choiceId = ChoiceIdByKey[choiceLockKey];

        if (!choiceId) {
            console.warn(`Warning: No stable ID found for choice lock key: ${choiceLockKey}. This choice might not be properly linked.`);
            // Fallback to choiceLockKey if no stable ID is found
            return {
                ...choiceDraft,
                id: choiceLockKey, // Use lockKey as fallback
                labelKey: choiceDraft.textKey,
                effect: ensureEventEffect(choiceDraft.effect),
            };
        }

        return {
            ...choiceDraft,
            id: choiceId,
            labelKey: choiceDraft.textKey,
            effect: ensureEventEffect(choiceDraft.effect),
        };
    });

    return {
        ...draft,
        id: eventId,
        choices: builtChoices,
    };
}

export function buildClubEvent(draft: ClubEventDraft): ClubEvent {
    const eventId = draft.id; // Club events use their draft ID directly for now.

    const builtChoices: EventChoice[] = draft.choices.map(choiceDraft => {
        // For club events, we can construct a unique key for choices as well.
        const choiceLockKey = `${draft.id}|${choiceDraft.textKey}`;
        // We assume club event choices also have stable IDs generated.
        const choiceId = ChoiceIdByKey[choiceLockKey];

        if (!choiceId) {
            console.warn(`Warning: No stable ID found for club choice lock key: ${choiceLockKey}. This choice might not be properly linked.`);
            return {
                ...choiceDraft,
                id: choiceLockKey, // Fallback
                labelKey: choiceDraft.textKey,
                effect: ensureEventEffect(choiceDraft.effect),
            };
        }

        return {
            ...choiceDraft,
            id: choiceId,
            labelKey: choiceDraft.textKey,
            effect: ensureEventEffect(choiceDraft.effect),
        };
    });

    return {
        ...draft,
        id: eventId,
        choices: builtChoices,
    };
}

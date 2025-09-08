import { ALL_EVENT_DRAFTS } from './events';
import { buildEvent } from './gameBuilders';
import { GameEvent } from './types';

let ALL_EVENTS: GameEvent[] = [];

export function initializeAllGameData(): void {
    ALL_EVENTS = ALL_EVENT_DRAFTS.map(draft => buildEvent(draft));
    console.log(`Initialized ${ALL_EVENTS.length} game events.`);
}

export function getAllEvents(): GameEvent[] {
    return ALL_EVENTS;
}

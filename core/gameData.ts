import { ALL_EVENT_DRAFTS } from './events';
import { CLUB_EVENT_DRAFTS } from './clubsAndEventsData';
import { buildEvent, buildClubEvent } from './gameBuilders';
import { GameEvent, ClubEvent } from './types';

let ALL_EVENTS: GameEvent[] = [];
let ALL_CLUB_EVENTS: ClubEvent[] = [];

export function initializeAllGameData(): void {
    ALL_EVENTS = ALL_EVENT_DRAFTS.map(draft => buildEvent(draft));
    ALL_CLUB_EVENTS = CLUB_EVENT_DRAFTS.map(draft => buildClubEvent(draft));
    console.log(`Initialized ${ALL_EVENTS.length} game events.`);
    console.log(`Initialized ${ALL_CLUB_EVENTS.length} club events.`);
}

export function getAllEvents(): GameEvent[] {
    return ALL_EVENTS;
}

export function getAllClubEvents(): ClubEvent[] {
    return ALL_CLUB_EVENTS;
}

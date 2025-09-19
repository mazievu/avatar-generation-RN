import { ALL_EVENT_DRAFTS } from './events';
import { CLUB_EVENT_DRAFTS } from './clubsAndEventsData';
import { buildEvent, buildClubEvent } from './gameBuilders';
import { GameEvent, ClubEvent, Language } from './types';

let ALL_EVENTS: GameEvent[] = [];
let ALL_CLUB_EVENTS: ClubEvent[] = [];
let isInitialized = false;

export function initializeAllGameData(lang: Language): void {
    if (isInitialized) {
        return;
    }
    ALL_EVENTS = ALL_EVENT_DRAFTS.map(draft => buildEvent(draft, lang));
    ALL_CLUB_EVENTS = CLUB_EVENT_DRAFTS.map(draft => buildClubEvent(draft, lang));
    isInitialized = true;
}

export function reinitializeAllGameData(lang: Language): void {
    isInitialized = false;
    initializeAllGameData(lang);
}

export function getAllEvents(): GameEvent[] {
    return ALL_EVENTS;
}

export function getAllClubEvents(): ClubEvent[] {
    return ALL_CLUB_EVENTS;
}
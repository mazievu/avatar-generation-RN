import { EventDraft } from '../types';
import { ELEMENTARY_SCHOOL_EVENTS } from './elementary';
import { MIDDLE_SCHOOL_EVENTS } from './middleschool';
import { HIGH_SCHOOL_EVENTS } from './highschool';
import { UNIVERSITY_EVENTS } from './university';
import { WORKING_LIFE_EVENTS } from './workinglife';
import { RELATIONSHIP_EVENTS } from './relationships';
import { LIFE_EVENTS } from './life';
import { RETIRED_EVENTS } from './retired';
import { NEWBORN_EVENTS } from './newborn';
import { PET_EVENTS } from './pets';
import { MILESTONE_EVENTS } from './milestones';

// Deduplicate events by ID, as some events can exist in multiple files (e.g., 'school_exam')
const allEventDrafts: EventDraft[] = [
    ...NEWBORN_EVENTS,
    ...ELEMENTARY_SCHOOL_EVENTS,
    ...MIDDLE_SCHOOL_EVENTS,
    ...HIGH_SCHOOL_EVENTS,
    ...UNIVERSITY_EVENTS,
    ...WORKING_LIFE_EVENTS,
    ...RETIRED_EVENTS,
    ...RELATIONSHIP_EVENTS,
    ...LIFE_EVENTS,
    ...PET_EVENTS,
    ...MILESTONE_EVENTS,
];

export const ALL_EVENT_DRAFTS: EventDraft[] = Array.from(new Map(allEventDrafts.map(event => [event.id, event])).values());
import { GameEvent, LifePhase } from '../types';

export const RETIRED_EVENTS: GameEvent[] = [
    // 10 Main Events (with triggers)
    {
        id: 'retired_official_retirement_day',
        titleKey: 'event_retired_official_retirement_day_title',
        descriptionKey: 'event_retired_official_retirement_day_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.age === 60,
        choices: [
            { textKey: 'choice_retired_official_retirement_day_1', effect: { statChanges: { happiness: 3 }, fundChange: -200, logKey: 'log_retired_official_retirement_day_1' } },
            { textKey: 'choice_retired_official_retirement_day_2', effect: { statChanges: { happiness: 2 }, fundChange: -500, logKey: 'log_retired_official_retirement_day_2' } },
            { textKey: 'choice_retired_official_retirement_day_3', effect: { statChanges: { health: -2, happiness: -1 }, logKey: 'log_retired_official_retirement_day_3', triggers: [{ eventId: 'retired_feeling_empty', chance: 0.6 }] } },
        ]
    },
    {
        id: 'retired_first_pension',
        titleKey: 'event_retired_first_pension_title',
        descriptionKey: 'event_retired_first_pension_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => !char.completedOneTimeEvents.includes('retired_first_pension'),
        choices: [
            { textKey: 'choice_retired_first_pension_1', effect: { statChanges: { eq: 2 }, logKey: 'log_retired_first_pension_1' } },
            { textKey: 'choice_retired_first_pension_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_first_pension_2' } },
            { textKey: 'choice_retired_first_pension_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_first_pension_3', triggers: [{ eventId: 'retired_insufficient_funds', chance: 0.5 }] } },
        ]
    },
    {
        id: 'retired_health_checkup',
        titleKey: 'event_retired_health_checkup_title',
        descriptionKey: 'event_retired_health_checkup_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_health_checkup_1', effect: { statChanges: { health: 2 }, fundChange: -500, logKey: 'log_retired_health_checkup_1' } },
            { textKey: 'choice_retired_health_checkup_2', effect: { statChanges: { health: -1 }, fundChange: -200, logKey: 'log_retired_health_checkup_2' } },
            { textKey: 'choice_retired_health_checkup_3', effect: { statChanges: { health: -3 }, logKey: 'log_retired_health_checkup_3', triggers: [{ eventId: 'retired_illness_discovered', chance: 0.4 }] } },
        ]
    },
    {
        id: 'retired_volunteering',
        titleKey: 'event_retired_volunteering_title',
        descriptionKey: 'event_retired_volunteering_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_volunteering_1', effect: { statChanges: { happiness: 2, iq: 1 }, logKey: 'log_retired_volunteering_1' } },
            { textKey: 'choice_retired_volunteering_2', effect: { statChanges: { happiness: 3, eq: 1 }, logKey: 'log_retired_volunteering_2' } },
            { textKey: 'choice_retired_volunteering_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_volunteering_3', triggers: [{ eventId: 'retired_cant_keep_up_volunteer', chance: 0.3 }] } },
        ]
    },
    {
        id: 'retired_long_trip',
        titleKey: 'event_retired_long_trip_title',
        descriptionKey: 'event_retired_long_trip_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => !char.completedOneTimeEvents.includes('retired_long_trip'),
        choices: [
            { textKey: 'choice_retired_long_trip_1', effect: { statChanges: { happiness: 3 }, fundChange: -3000, logKey: 'log_retired_long_trip_1' } },
            { textKey: 'choice_retired_long_trip_2', effect: { statChanges: { happiness: 3 }, fundChange: -5000, logKey: 'log_retired_long_trip_2' } },
            { textKey: 'choice_retired_long_trip_3', effect: { statChanges: { happiness: 3 }, fundChange: -8000, logKey: 'log_retired_long_trip_3', triggers: [{ eventId: 'retired_travel_fatigue', chance: 0.5 }] } },
        ]
    },
    {
        id: 'retired_amusement_park',
        titleKey: 'event_retired_amusement_park_title',
        descriptionKey: 'event_retired_amusement_park_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.childrenIds.some(childId => state.familyMembers[childId]?.childrenIds.length > 0),
        choices: [
            { textKey: 'choice_retired_amusement_park_1', effect: { statChanges: { happiness: 4, health: -3 }, logKey: 'log_retired_amusement_park_1' } },
            { textKey: 'choice_retired_amusement_park_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_amusement_park_2' } },
            { textKey: 'choice_retired_amusement_park_3', effect: { statChanges: { happiness: 1, health: -2 }, logKey: 'log_retired_amusement_park_3', triggers: [{ eventId: 'retired_heatstroke', chance: 0.4 }] } },
        ]
    },
    {
        id: 'retired_seniors_club',
        titleKey: 'event_retired_seniors_club_title',
        descriptionKey: 'event_retired_seniors_club_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_seniors_club_1', effect: { statChanges: { happiness: 3, health: 1 }, logKey: 'log_retired_seniors_club_1' } },
            { textKey: 'choice_retired_seniors_club_2', effect: { statChanges: { happiness: 2, iq: 1 }, logKey: 'log_retired_seniors_club_2' } },
            { textKey: 'choice_retired_seniors_club_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_retired_seniors_club_3', triggers: [{ eventId: 'retired_difficulty_integrating', chance: 0.5 }] } },
        ]
    },
    {
        id: 'retired_supermarket_sale',
        titleKey: 'event_retired_supermarket_sale_title',
        descriptionKey: 'event_retired_supermarket_sale_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_supermarket_sale_1', effect: { statChanges: { happiness: 2 }, fundChange: -100, logKey: 'log_retired_supermarket_sale_1' } },
            { textKey: 'choice_retired_supermarket_sale_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_supermarket_sale_2' } },
            { textKey: 'choice_retired_supermarket_sale_3', effect: { statChanges: { health: -1 }, logKey: 'log_retired_supermarket_sale_3', triggers: [{ eventId: 'retired_missed_promotions', chance: 0.6 }] } },
        ]
    },
    {
        id: 'retired_class_reunion',
        titleKey: 'event_retired_class_reunion_title',
        descriptionKey: 'event_retired_class_reunion_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_class_reunion_1', effect: { statChanges: { happiness: 4 }, logKey: 'log_retired_class_reunion_1' } },
            { textKey: 'choice_retired_class_reunion_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_class_reunion_2' } },
            { textKey: 'choice_retired_class_reunion_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_retired_class_reunion_3', triggers: [{ eventId: 'retired_loneliness_after_reunion', chance: 0.5 }] } },
        ]
    },
    {
        id: 'retired_family_dinner',
        titleKey: 'event_retired_family_dinner_title',
        descriptionKey: 'event_retired_family_dinner_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_family_dinner_1', effect: { statChanges: { happiness: 2, skill: 1 }, logKey: 'log_retired_family_dinner_1' } },
            { textKey: 'choice_retired_family_dinner_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_family_dinner_2' } },
            { textKey: 'choice_retired_family_dinner_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_family_dinner_3', triggers: [{ eventId: 'retired_lose_central_role', chance: 0.4 }] } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'retired_feeling_empty',
        titleKey: 'event_retired_feeling_empty_title',
        descriptionKey: 'event_retired_feeling_empty_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_feeling_empty_1', effect: { statChanges: { happiness: 1, health: 1 }, logKey: 'log_retired_feeling_empty_1' } },
            { textKey: 'choice_retired_feeling_empty_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_feeling_empty_2' } },
            { textKey: 'choice_retired_feeling_empty_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_retired_feeling_empty_3' } },
        ]
    },
    {
        id: 'retired_insufficient_funds',
        titleKey: 'event_retired_insufficient_funds_title',
        descriptionKey: 'event_retired_insufficient_funds_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_insufficient_funds_1', effect: { statChanges: { eq: -1 }, logKey: 'log_retired_insufficient_funds_1' } },
            { textKey: 'choice_retired_insufficient_funds_2', effect: { statChanges: { iq: 1 }, logKey: 'log_retired_insufficient_funds_2' } },
            { textKey: 'choice_retired_insufficient_funds_3', effect: { statChanges: { happiness: -2, health: -1 }, logKey: 'log_retired_insufficient_funds_3' } },
        ]
    },
    {
        id: 'retired_illness_discovered',
        titleKey: 'event_retired_illness_discovered_title',
        descriptionKey: 'event_retired_illness_discovered_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_illness_discovered_1', effect: { statChanges: { health: 3, eq: 1 }, logKey: 'log_retired_illness_discovered_1' } },
            { textKey: 'choice_retired_illness_discovered_2', effect: { statChanges: { health: -2, happiness: -2 }, logKey: 'log_retired_illness_discovered_2' } },
            { textKey: 'choice_retired_illness_discovered_3', effect: { statChanges: { health: -3, happiness: -4, eq: -3 }, logKey: 'log_retired_illness_discovered_3' } },
        ]
    },
    {
        id: 'retired_cant_keep_up_volunteer',
        titleKey: 'event_retired_cant_keep_up_volunteer_title',
        descriptionKey: 'event_retired_cant_keep_up_volunteer_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_cant_keep_up_volunteer_1', effect: { statChanges: { happiness: -1 }, logKey: 'log_retired_cant_keep_up_volunteer_1' } },
            { textKey: 'choice_retired_cant_keep_up_volunteer_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_cant_keep_up_volunteer_2' } },
            { textKey: 'choice_retired_cant_keep_up_volunteer_3', effect: { statChanges: { eq: -1 }, logKey: 'log_retired_cant_keep_up_volunteer_3' } },
        ]
    },
    {
        id: 'retired_travel_fatigue',
        titleKey: 'event_retired_travel_fatigue_title',
        descriptionKey: 'event_retired_travel_fatigue_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_travel_fatigue_1', effect: { statChanges: { health: 2, happiness: -1 }, logKey: 'log_retired_travel_fatigue_1' } },
            { textKey: 'choice_retired_travel_fatigue_2', effect: { statChanges: { happiness: -2 }, fundChange: 1000, logKey: 'log_retired_travel_fatigue_2' } },
            { textKey: 'choice_retired_travel_fatigue_3', effect: { statChanges: { happiness: -3, eq: -1 }, fundChange: 2000, logKey: 'log_retired_travel_fatigue_3' } },
        ]
    },
    {
        id: 'retired_heatstroke',
        titleKey: 'event_retired_heatstroke_title',
        descriptionKey: 'event_retired_heatstroke_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_heatstroke_1', effect: { statChanges: { health: 1 }, logKey: 'log_retired_heatstroke_1' } },
            { textKey: 'choice_retired_heatstroke_2', effect: { statChanges: { health: 2 }, logKey: 'log_retired_heatstroke_2' } },
            { textKey: 'choice_retired_heatstroke_3', effect: { statChanges: { health: 3 }, logKey: 'log_retired_heatstroke_3' } },
        ]
    },
    {
        id: 'retired_difficulty_integrating',
        titleKey: 'event_retired_difficulty_integrating_title',
        descriptionKey: 'event_retired_difficulty_integrating_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_difficulty_integrating_1', effect: { statChanges: { eq: 1 }, logKey: 'log_retired_difficulty_integrating_1' } },
            { textKey: 'choice_retired_difficulty_integrating_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_difficulty_integrating_2' } },
            { textKey: 'choice_retired_difficulty_integrating_3', effect: { statChanges: { happiness: -2, eq: -1 }, logKey: 'log_retired_difficulty_integrating_3' } },
        ]
    },
    {
        id: 'retired_missed_promotions',
        titleKey: 'event_retired_missed_promotions_title',
        descriptionKey: 'event_retired_missed_promotions_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_missed_promotions_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_missed_promotions_1' } },
            { textKey: 'choice_retired_missed_promotions_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_missed_promotions_2' } },
            { textKey: 'choice_retired_missed_promotions_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_retired_missed_promotions_3' } },
        ]
    },
    {
        id: 'retired_loneliness_after_reunion',
        titleKey: 'event_retired_loneliness_after_reunion_title',
        descriptionKey: 'event_retired_loneliness_after_reunion_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_loneliness_after_reunion_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_loneliness_after_reunion_1' } },
            { textKey: 'choice_retired_loneliness_after_reunion_2', effect: { statChanges: { eq: 1 }, logKey: 'log_retired_loneliness_after_reunion_2' } },
            { textKey: 'choice_retired_loneliness_after_reunion_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_retired_loneliness_after_reunion_3' } },
        ]
    },
    {
        id: 'retired_lose_central_role',
        titleKey: 'event_retired_lose_central_role_title',
        descriptionKey: 'event_retired_lose_central_role_desc',
        phases: [LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_retired_lose_central_role_1', effect: { statChanges: { eq: 1, happiness: 1 }, logKey: 'log_retired_lose_central_role_1' } },
            { textKey: 'choice_retired_lose_central_role_2', effect: { statChanges: { iq: 1 }, logKey: 'log_retired_lose_central_role_2' } },
            { textKey: 'choice_retired_lose_central_role_3', effect: { statChanges: { happiness: -2, eq: -1 }, logKey: 'log_retired_lose_central_role_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'retired_morning_routine',
        titleKey: 'event_retired_morning_routine_title',
        descriptionKey: 'event_retired_morning_routine_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_morning_routine_1', effect: { statChanges: { health: 2 }, logKey: 'log_retired_morning_routine_1' } },
            { textKey: 'choice_retired_morning_routine_2', effect: { statChanges: { iq: 1 }, logKey: 'log_retired_morning_routine_2' } },
            { textKey: 'choice_retired_morning_routine_3', effect: { statChanges: { health: -1 }, logKey: 'log_retired_morning_routine_3' } },
        ]
    },
    {
        id: 'retired_watching_tv',
        titleKey: 'event_retired_watching_tv_title',
        descriptionKey: 'event_retired_watching_tv_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_watching_tv_1', effect: { statChanges: { iq: 1 }, logKey: 'log_retired_watching_tv_1' } },
            { textKey: 'choice_retired_watching_tv_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_watching_tv_2' } },
            { textKey: 'choice_retired_watching_tv_3', effect: { statChanges: { health: -1 }, logKey: 'log_retired_watching_tv_3' } },
        ]
    },
    {
        id: 'retired_playing_with_grandkids',
        titleKey: 'event_retired_playing_with_grandkids_title',
        descriptionKey: 'event_retired_playing_with_grandkids_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.childrenIds.some(childId => state.familyMembers[childId]?.childrenIds.length > 0),
        choices: [
            { textKey: 'choice_retired_playing_with_grandkids_1', effect: { statChanges: { happiness: 3, health: 1 }, logKey: 'log_retired_playing_with_grandkids_1' } },
            { textKey: 'choice_retired_playing_with_grandkids_2', effect: { statChanges: { happiness: 2, iq: 1 }, logKey: 'log_retired_playing_with_grandkids_2' } },
            { textKey: 'choice_retired_playing_with_grandkids_3', effect: { statChanges: { happiness: 1, health: -1 }, logKey: 'log_retired_playing_with_grandkids_3' } },
        ]
    },
    {
        id: 'retired_meet_old_friend',
        titleKey: 'event_retired_meet_old_friend_title',
        descriptionKey: 'event_retired_meet_old_friend_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_meet_old_friend_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_meet_old_friend_1' } },
            { textKey: 'choice_retired_meet_old_friend_2', effect: { statChanges: { happiness: 2, health: 1 }, logKey: 'log_retired_meet_old_friend_2' } },
            { textKey: 'choice_retired_meet_old_friend_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_meet_old_friend_3' } },
        ]
    },
    {
        id: 'retired_grocery_shopping',
        titleKey: 'event_retired_grocery_shopping_title',
        descriptionKey: 'event_retired_grocery_shopping_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_grocery_shopping_1', effect: { statChanges: { health: 1 }, fundChange: -50, logKey: 'log_retired_grocery_shopping_1' } },
            { textKey: 'choice_retired_grocery_shopping_2', effect: { fundChange: -20, logKey: 'log_retired_grocery_shopping_2' } },
            { textKey: 'choice_retired_grocery_shopping_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_grocery_shopping_3' } },
        ]
    },
    {
        id: 'retired_visiting_temple',
        titleKey: 'event_retired_visiting_temple_title',
        descriptionKey: 'event_retired_visiting_temple_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_visiting_temple_1', effect: { statChanges: { happiness: 2, eq: 1 }, logKey: 'log_retired_visiting_temple_1' } },
            { textKey: 'choice_retired_visiting_temple_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_visiting_temple_2' } },
            { textKey: 'choice_retired_visiting_temple_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_visiting_temple_3' } },
        ]
    },
    {
        id: 'retired_grandchild_birthday',
        titleKey: 'event_retired_grandchild_birthday_title',
        descriptionKey: 'event_retired_grandchild_birthday_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.childrenIds.some(childId => state.familyMembers[childId]?.childrenIds.length > 0),
        choices: [
            { textKey: 'choice_retired_grandchild_birthday_1', effect: { statChanges: { happiness: 2 }, fundChange: -50, logKey: 'log_retired_grandchild_birthday_1' } },
            { textKey: 'choice_retired_grandchild_birthday_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_grandchild_birthday_2' } },
            { textKey: 'choice_retired_grandchild_birthday_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_grandchild_birthday_3' } },
        ]
    },
    {
        id: 'retired_visit_children',
        titleKey: 'event_retired_visit_children_title',
        descriptionKey: 'event_retired_visit_children_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_visit_children_1', effect: { statChanges: { happiness: 3 }, fundChange: -100, logKey: 'log_retired_visit_children_1' } },
            { textKey: 'choice_retired_visit_children_2', effect: { statChanges: { happiness: 4 }, fundChange: -500, logKey: 'log_retired_visit_children_2' } },
            { textKey: 'choice_retired_visit_children_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_retired_visit_children_3' } },
        ]
    },
    {
        id: 'retired_hot_afternoon',
        titleKey: 'event_retired_hot_afternoon_title',
        descriptionKey: 'event_retired_hot_afternoon_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_hot_afternoon_1', effect: { statChanges: { health: 1 }, logKey: 'log_retired_hot_afternoon_1' } },
            { textKey: 'choice_retired_hot_afternoon_2', effect: { statChanges: { health: 2 }, logKey: 'log_retired_hot_afternoon_2' } },
            { textKey: 'choice_retired_hot_afternoon_3', effect: { statChanges: { health: 1 }, logKey: 'log_retired_hot_afternoon_3' } },
        ]
    },
    {
        id: 'retired_park_visit',
        titleKey: 'event_retired_park_visit_title',
        descriptionKey: 'event_retired_park_visit_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_park_visit_1', effect: { statChanges: { health: 2 }, logKey: 'log_retired_park_visit_1' } },
            { textKey: 'choice_retired_park_visit_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_park_visit_2' } },
            { textKey: 'choice_retired_park_visit_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_park_visit_3' } },
        ]
    },
    {
        id: 'retired_village_festival',
        titleKey: 'event_retired_village_festival_title',
        descriptionKey: 'event_retired_village_festival_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_village_festival_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_village_festival_1' } },
            { textKey: 'choice_retired_village_festival_2', effect: { statChanges: { happiness: 1 }, fundChange: -20, logKey: 'log_retired_village_festival_2' } },
            { textKey: 'choice_retired_village_festival_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_village_festival_3' } },
        ]
    },
    {
        id: 'retired_new_class',
        titleKey: 'event_retired_new_class_title',
        descriptionKey: 'event_retired_new_class_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_new_class_1', effect: { statChanges: { iq: 2, skill: 1 }, logKey: 'log_retired_new_class_1' } },
            { textKey: 'choice_retired_new_class_2', effect: { statChanges: { iq: 1 }, logKey: 'log_retired_new_class_2' } },
            { textKey: 'choice_retired_new_class_3', effect: { statChanges: { eq: -1 }, logKey: 'log_retired_new_class_3' } },
        ]
    },
    {
        id: 'retired_periodic_checkup',
        titleKey: 'event_retired_periodic_checkup_title',
        descriptionKey: 'event_retired_periodic_checkup_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_periodic_checkup_1', effect: { statChanges: { health: 3 }, logKey: 'log_retired_periodic_checkup_1' } },
            { textKey: 'choice_retired_periodic_checkup_2', effect: { statChanges: { health: 1 }, logKey: 'log_retired_periodic_checkup_2' } },
            { textKey: 'choice_retired_periodic_checkup_3', effect: { statChanges: { health: -2 }, logKey: 'log_retired_periodic_checkup_3' } },
        ]
    },
    {
        id: 'retired_rainy_day',
        titleKey: 'event_retired_rainy_day_title',
        descriptionKey: 'event_retired_rainy_day_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_rainy_day_1', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_retired_rainy_day_1' } },
            { textKey: 'choice_retired_rainy_day_2', effect: { statChanges: { health: 1 }, logKey: 'log_retired_rainy_day_2' } },
            { textKey: 'choice_retired_rainy_day_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_rainy_day_3' } },
        ]
    },
    {
        id: 'retired_visit_relatives',
        titleKey: 'event_retired_visit_relatives_title',
        descriptionKey: 'event_retired_visit_relatives_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_visit_relatives_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_visit_relatives_1' } },
            { textKey: 'choice_retired_visit_relatives_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_visit_relatives_2' } },
            { textKey: 'choice_retired_visit_relatives_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_visit_relatives_3' } },
        ]
    },
    {
        id: 'retired_watching_sports',
        titleKey: 'event_retired_watching_sports_title',
        descriptionKey: 'event_retired_watching_sports_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_watching_sports_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_watching_sports_1' } },
            { textKey: 'choice_retired_watching_sports_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_watching_sports_2' } },
            { textKey: 'choice_retired_watching_sports_3', effect: { statChanges: { health: -1 }, logKey: 'log_retired_watching_sports_3' } },
        ]
    },
    {
        id: 'retired_insomnia',
        titleKey: 'event_retired_insomnia_title',
        descriptionKey: 'event_retired_insomnia_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_insomnia_1', effect: { statChanges: { health: -1 }, logKey: 'log_retired_insomnia_1' } },
            { textKey: 'choice_retired_insomnia_2', effect: { statChanges: { health: 1 }, logKey: 'log_retired_insomnia_2' } },
            { textKey: 'choice_retired_insomnia_3', effect: { statChanges: { health: -2, happiness: -1 }, logKey: 'log_retired_insomnia_3' } },
        ]
    },
    {
        id: 'retired_community_festival',
        titleKey: 'event_retired_community_festival_title',
        descriptionKey: 'event_retired_community_festival_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_community_festival_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_community_festival_1' } },
            { textKey: 'choice_retired_community_festival_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_community_festival_2' } },
            { textKey: 'choice_retired_community_festival_3', effect: { statChanges: { happiness: 1, health: -1 }, logKey: 'log_retired_community_festival_3' } },
        ]
    },
    {
        id: 'retired_surprise_gift',
        titleKey: 'event_retired_surprise_gift_title',
        descriptionKey: 'event_retired_surprise_gift_desc',
        phases: [LifePhase.Retired],
        choices: [
            { textKey: 'choice_retired_surprise_gift_1', effect: { statChanges: { happiness: 4 }, fundChange: 100, logKey: 'log_retired_surprise_gift_1' } },
            { textKey: 'choice_retired_surprise_gift_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_retired_surprise_gift_2' } },
            { textKey: 'choice_retired_surprise_gift_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_surprise_gift_3' } },
        ]
    },
    {
        id: 'retired_sharing_with_grandkids',
        titleKey: 'event_retired_sharing_with_grandkids_title',
        descriptionKey: 'event_retired_sharing_with_grandkids_desc',
        phases: [LifePhase.Retired],
        condition: (state, char) => char.childrenIds.some(childId => state.familyMembers[childId]?.childrenIds.length > 0),
        choices: [
            { textKey: 'choice_retired_sharing_with_grandkids_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_retired_sharing_with_grandkids_1' } },
            { textKey: 'choice_retired_sharing_with_grandkids_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_retired_sharing_with_grandkids_2' } },
            { textKey: 'choice_retired_sharing_with_grandkids_3', effect: { statChanges: { eq: -1 }, logKey: 'log_retired_sharing_with_grandkids_3' } },
        ]
    },
];
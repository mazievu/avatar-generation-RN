
import { GameEvent, LifePhase, RelationshipStatus } from '../types';

export const RELATIONSHIP_EVENTS: GameEvent[] = [
    // 10 MAIN EVENTS
    {
        id: 'relationship_first_date',
        titleKey: 'event_relationship_first_date_title',
        descriptionKey: 'event_relationship_first_date_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        allowedRelationshipStatuses: [RelationshipStatus.Single],
        choices: [
            { textKey: 'choice_relationship_first_date_1', effect: { statChanges: { happiness: 5, confidence: 2 }, logKey: 'log_relationship_first_date_1' } },
            { textKey: 'choice_relationship_first_date_2', effect: { statChanges: { happiness: 4 }, fundChange: -150, logKey: 'log_relationship_first_date_2' } },
            { textKey: 'choice_relationship_first_date_3', effect: { statChanges: { happiness: 4, health: 1 }, logKey: 'log_relationship_first_date_3', triggers: [{ eventId: 'relationship_forgot_socks', chance: 0.4 }] } },
        ]
    },
    {
        id: 'relationship_prom_night',
        titleKey: 'event_relationship_prom_night_title',
        descriptionKey: 'event_relationship_prom_night_desc',
        phases: [LifePhase.HighSchool],
        condition: (state, char) => char.age >= 17,
        choices: [
            { textKey: 'choice_relationship_prom_night_1', effect: { statChanges: { happiness: 10, confidence: 5 }, fundChange: -250, logKey: 'log_relationship_prom_night_1' } },
            { textKey: 'choice_relationship_prom_night_2', effect: { statChanges: { happiness: 8, confidence: 3 }, logKey: 'log_relationship_prom_night_2' } },
            { textKey: 'choice_relationship_prom_night_3', effect: { statChanges: { happiness: 7 }, fundChange: -50, logKey: 'log_relationship_prom_night_3', triggers: [{ eventId: 'relationship_pancake_accident', chance: 0.5 }] } },
        ]
    },
    {
        id: 'relationship_sending_text',
        titleKey: 'event_relationship_sending_text_title',
        descriptionKey: 'event_relationship_sending_text_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_sending_text_1', effect: { statChanges: { confidence: 2, happiness: 1 }, logKey: 'log_relationship_sending_text_1' } },
            { textKey: 'choice_relationship_sending_text_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_sending_text_2' } },
            { textKey: 'choice_relationship_sending_text_3', effect: { statChanges: { confidence: -1 }, logKey: 'log_relationship_sending_text_3', triggers: [{ eventId: 'relationship_misunderstood_silence', chance: 0.6 }] } },
        ]
    },
    {
        id: 'relationship_anniversary',
        titleKey: 'event_relationship_anniversary_title',
        descriptionKey: 'event_relationship_anniversary_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        allowedRelationshipStatuses: [RelationshipStatus.Married],
        choices: [
            { textKey: 'choice_relationship_anniversary_1', effect: { statChanges: { happiness: 5 }, fundChange: -50, logKey: 'log_relationship_anniversary_1' } },
            { textKey: 'choice_relationship_anniversary_2', effect: { statChanges: { happiness: 4 }, fundChange: -40, logKey: 'log_relationship_anniversary_2' } },
            { textKey: 'choice_relationship_anniversary_3', effect: { statChanges: { happiness: -5 }, logKey: 'log_relationship_anniversary_3', triggers: [{ eventId: 'relationship_silent_treatment', chance: 0.7 }] } },
        ]
    },
    {
        id: 'relationship_meeting_friends',
        titleKey: 'event_relationship_meeting_friends_title',
        descriptionKey: 'event_relationship_meeting_friends_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_meeting_friends_1', effect: { statChanges: { confidence: 2, happiness: 2 }, logKey: 'log_relationship_meeting_friends_1' } },
            { textKey: 'choice_relationship_meeting_friends_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_relationship_meeting_friends_2' } },
            { textKey: 'choice_relationship_meeting_friends_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_meeting_friends_3', triggers: [{ eventId: 'relationship_endless_teasing', chance: 0.5 }] } },
        ]
    },
    {
        id: 'relationship_amusement_park',
        titleKey: 'event_relationship_amusement_park_title',
        descriptionKey: 'event_relationship_amusement_park_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_amusement_park_1', effect: { statChanges: { happiness: 5 }, fundChange: -60, logKey: 'log_relationship_amusement_park_1' } },
            { textKey: 'choice_relationship_amusement_park_2', effect: { statChanges: { happiness: 3, health: -1 }, fundChange: -60, logKey: 'log_relationship_amusement_park_2', triggers: [{ eventId: 'relationship_unexpected_scream', chance: 0.6 }] } },
            { textKey: 'choice_relationship_amusement_park_3', effect: { statChanges: { happiness: 2 }, fundChange: -20, logKey: 'log_relationship_amusement_park_3' } },
        ]
    },
    {
        id: 'relationship_first_argument',
        titleKey: 'event_relationship_first_argument_title',
        descriptionKey: 'event_relationship_first_argument_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        allowedRelationshipStatuses: [RelationshipStatus.Married],
        choices: [
            { textKey: 'choice_relationship_first_argument_1', effect: { statChanges: { happiness: 1, confidence: 1 }, logKey: 'log_relationship_first_argument_1' } },
            { textKey: 'choice_relationship_first_argument_2', effect: { statChanges: { happiness: -4 }, logKey: 'log_relationship_first_argument_2', triggers: [{ eventId: 'relationship_cold_war', chance: 0.7 }] } },
            { textKey: 'choice_relationship_first_argument_3', effect: { 
                statChanges: { happiness: -5, confidence: -2 }, 
                logKey: 'log_relationship_first_argument_3',
                action: (state, charId) => {
                    const char = state.familyMembers[charId];
                    if (char.partnerId && state.familyMembers[char.partnerId]) {
                        const partner = state.familyMembers[char.partnerId];
                        const updatedPartner = { ...partner, stats: { ...partner.stats, happiness: Math.max(0, partner.stats.happiness - 5) } };
                        return { 
                            familyMembers: { 
                                ...state.familyMembers, 
                                [partner.id]: updatedPartner 
                            } 
                        };
                    }
                    return {};
                }
            }},
        ]
    },
    {
        id: 'relationship_fancy_dinner',
        titleKey: 'event_relationship_fancy_dinner_title',
        descriptionKey: 'event_relationship_fancy_dinner_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_fancy_dinner_1', effect: { statChanges: { confidence: 1, happiness: 2 }, logKey: 'log_relationship_fancy_dinner_1' } },
            { textKey: 'choice_relationship_fancy_dinner_2', effect: { statChanges: { confidence: -2 }, fundChange: -20, logKey: 'log_relationship_fancy_dinner_2', triggers: [{ eventId: 'relationship_everyone_staring', chance: 0.5 }] } },
            { textKey: 'choice_relationship_fancy_dinner_3', effect: { statChanges: { happiness: 3 }, fundChange: -250, logKey: 'log_relationship_fancy_dinner_3' } },
        ]
    },
    {
        id: 'relationship_road_trip',
        titleKey: 'event_relationship_road_trip_title',
        descriptionKey: 'event_relationship_road_trip_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_road_trip_1', effect: { statChanges: { happiness: 4, iq: 1 }, fundChange: -200, logKey: 'log_relationship_road_trip_1' } },
            { textKey: 'choice_relationship_road_trip_2', effect: { statChanges: { happiness: 5 }, fundChange: -300, logKey: 'log_relationship_road_trip_2', triggers: [{ eventId: 'relationship_getting_lost', chance: 0.6 }] } },
            { textKey: 'choice_relationship_road_trip_3', effect: { statChanges: { happiness: 2, health: -1 }, fundChange: -150, logKey: 'log_relationship_road_trip_3' } },
        ]
    },
    {
        id: 'relationship_talk_future',
        titleKey: 'event_relationship_talk_future_title',
        descriptionKey: 'event_relationship_talk_future_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_talk_future_1', effect: { statChanges: { confidence: 2, happiness: 2 }, logKey: 'log_relationship_talk_future_1' } },
            { textKey: 'choice_relationship_talk_future_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_talk_future_2' } },
            { textKey: 'choice_relationship_talk_future_3', effect: { statChanges: { confidence: -1, happiness: -2 }, logKey: 'log_relationship_talk_future_3', triggers: [{ eventId: 'relationship_doubt_arises', chance: 0.5 }] } },
        ]
    },

    // 10 TRIGGER-BASED EVENTS
    {
        id: 'relationship_forgot_socks',
        titleKey: 'event_relationship_forgot_socks_title',
        descriptionKey: 'event_relationship_forgot_socks_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_forgot_socks_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_forgot_socks_1' } },
            { textKey: 'choice_relationship_forgot_socks_2', effect: { statChanges: { confidence: 1, happiness: 1 }, logKey: 'log_relationship_forgot_socks_2' } },
            { textKey: 'choice_relationship_forgot_socks_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_forgot_socks_3' } },
        ]
    },
    {
        id: 'relationship_pancake_accident',
        titleKey: 'event_relationship_pancake_accident_title',
        descriptionKey: 'event_relationship_pancake_accident_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_pancake_accident_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_pancake_accident_1' } },
            { textKey: 'choice_relationship_pancake_accident_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_pancake_accident_2' } },
            { textKey: 'choice_relationship_pancake_accident_3', effect: { statChanges: { confidence: 1, happiness: 1 }, logKey: 'log_relationship_pancake_accident_3' } },
        ]
    },
    {
        id: 'relationship_misunderstood_silence',
        titleKey: 'event_relationship_misunderstood_silence_title',
        descriptionKey: 'event_relationship_misunderstood_silence_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_misunderstood_silence_1', effect: { statChanges: { confidence: 1 }, logKey: 'log_relationship_misunderstood_silence_1' } },
            { textKey: 'choice_relationship_misunderstood_silence_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_relationship_misunderstood_silence_2' } },
            { textKey: 'choice_relationship_misunderstood_silence_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_misunderstood_silence_3' } },
        ]
    },
    {
        id: 'relationship_silent_treatment',
        titleKey: 'event_relationship_silent_treatment_title',
        descriptionKey: 'event_relationship_silent_treatment_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_silent_treatment_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_silent_treatment_1' } },
            { textKey: 'choice_relationship_silent_treatment_2', effect: { statChanges: { happiness: 1, confidence: 1 }, logKey: 'log_relationship_silent_treatment_2' } },
            { textKey: 'choice_relationship_silent_treatment_3', effect: { statChanges: { happiness: -3, health: -1 }, logKey: 'log_relationship_silent_treatment_3' } },
        ]
    },
    {
        id: 'relationship_endless_teasing',
        titleKey: 'event_relationship_endless_teasing_title',
        descriptionKey: 'event_relationship_endless_teasing_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_endless_teasing_1', effect: { statChanges: { happiness: 1, confidence: 1 }, logKey: 'log_relationship_endless_teasing_1' } },
            { textKey: 'choice_relationship_endless_teasing_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_relationship_endless_teasing_2' } },
            { textKey: 'choice_relationship_endless_teasing_3', effect: { statChanges: { confidence: -1, happiness: 1 }, logKey: 'log_relationship_endless_teasing_3' } },
        ]
    },
    {
        id: 'relationship_unexpected_scream',
        titleKey: 'event_relationship_unexpected_scream_title',
        descriptionKey: 'event_relationship_unexpected_scream_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_unexpected_scream_1', effect: { statChanges: { confidence: -1, happiness: 1 }, logKey: 'log_relationship_unexpected_scream_1' } },
            { textKey: 'choice_relationship_unexpected_scream_2', effect: { statChanges: { confidence: -2 }, logKey: 'log_relationship_unexpected_scream_2' } },
            { textKey: 'choice_relationship_unexpected_scream_3', effect: { statChanges: { confidence: 1 }, logKey: 'log_relationship_unexpected_scream_3' } },
        ]
    },
    {
        id: 'relationship_cold_war',
        titleKey: 'event_relationship_cold_war_title',
        descriptionKey: 'event_relationship_cold_war_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_cold_war_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_cold_war_1' } },
            { textKey: 'choice_relationship_cold_war_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_relationship_cold_war_2' } },
            { textKey: 'choice_relationship_cold_war_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_cold_war_3' } },
        ]
    },
    {
        id: 'relationship_everyone_staring',
        titleKey: 'event_relationship_everyone_staring_title',
        descriptionKey: 'event_relationship_everyone_staring_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_everyone_staring_1', effect: { statChanges: { confidence: 1 }, logKey: 'log_relationship_everyone_staring_1' } },
            { textKey: 'choice_relationship_everyone_staring_2', effect: { statChanges: { confidence: 2 }, logKey: 'log_relationship_everyone_staring_2' } },
            { textKey: 'choice_relationship_everyone_staring_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_relationship_everyone_staring_3' } },
        ]
    },
    {
        id: 'relationship_getting_lost',
        titleKey: 'event_relationship_getting_lost_title',
        descriptionKey: 'event_relationship_getting_lost_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_getting_lost_1', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_relationship_getting_lost_1' } },
            { textKey: 'choice_relationship_getting_lost_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_getting_lost_2' } },
            { textKey: 'choice_relationship_getting_lost_3', effect: { statChanges: { iq: -1 }, logKey: 'log_relationship_getting_lost_3' } },
        ]
    },
    {
        id: 'relationship_doubt_arises',
        titleKey: 'event_relationship_doubt_arises_title',
        descriptionKey: 'event_relationship_doubt_arises_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_relationship_doubt_arises_1', effect: { statChanges: { confidence: 1, happiness: 2 }, logKey: 'log_relationship_doubt_arises_1' } },
            { textKey: 'choice_relationship_doubt_arises_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_doubt_arises_2' } },
            { textKey: 'choice_relationship_doubt_arises_3', effect: { statChanges: { happiness: -3 }, logKey: 'log_relationship_doubt_arises_3' } },
        ]
    },

    // 20 INDEPENDENT EVENTS
    {
        id: 'relationship_netflix_chill',
        titleKey: 'event_relationship_netflix_chill_title',
        descriptionKey: 'event_relationship_netflix_chill_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_netflix_chill_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_netflix_chill_1' } },
            { textKey: 'choice_relationship_netflix_chill_2', effect: { statChanges: { happiness: 2, health: 1 }, logKey: 'log_relationship_netflix_chill_2' } },
            { textKey: 'choice_relationship_netflix_chill_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_relationship_netflix_chill_3' } },
        ]
    },
    {
        id: 'relationship_house_party',
        titleKey: 'event_relationship_house_party_title',
        descriptionKey: 'event_relationship_house_party_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_house_party_1', effect: { statChanges: { happiness: 3, confidence: 1 }, logKey: 'log_relationship_house_party_1' } },
            { textKey: 'choice_relationship_house_party_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_house_party_2' } },
            { textKey: 'choice_relationship_house_party_3', effect: { statChanges: { confidence: -1, happiness: 1 }, logKey: 'log_relationship_house_party_3' } },
        ]
    },
    {
        id: 'relationship_bbq_cookout',
        titleKey: 'event_relationship_bbq_cookout_title',
        descriptionKey: 'event_relationship_bbq_cookout_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_bbq_cookout_1', effect: { statChanges: { skill: 1, happiness: 2 }, logKey: 'log_relationship_bbq_cookout_1' } },
            { textKey: 'choice_relationship_bbq_cookout_2', effect: { statChanges: { skill: -1, happiness: 1 }, logKey: 'log_relationship_bbq_cookout_2' } },
            { textKey: 'choice_relationship_bbq_cookout_3', effect: { statChanges: { health: 1, happiness: 1 }, logKey: 'log_relationship_bbq_cookout_3' } },
        ]
    },
    {
        id: 'relationship_drive_in_movie',
        titleKey: 'event_relationship_drive_in_movie_title',
        descriptionKey: 'event_relationship_drive_in_movie_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_drive_in_movie_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_drive_in_movie_1' } },
            { textKey: 'choice_relationship_drive_in_movie_2', effect: { statChanges: { health: -1, happiness: -1 }, logKey: 'log_relationship_drive_in_movie_2' } },
            { textKey: 'choice_relationship_drive_in_movie_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_drive_in_movie_3' } },
        ]
    },
    {
        id: 'relationship_super_bowl',
        titleKey: 'event_relationship_super_bowl_title',
        descriptionKey: 'event_relationship_super_bowl_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_super_bowl_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_super_bowl_1' } },
            { textKey: 'choice_relationship_super_bowl_2', effect: { statChanges: { happiness: 1, health: 1 }, logKey: 'log_relationship_super_bowl_2' } },
            { textKey: 'choice_relationship_super_bowl_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_relationship_super_bowl_3' } },
        ]
    },
    {
        id: 'relationship_thanksgiving',
        titleKey: 'event_relationship_thanksgiving_title',
        descriptionKey: 'event_relationship_thanksgiving_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_thanksgiving_1', effect: { statChanges: { skill: 1, happiness: 2 }, logKey: 'log_relationship_thanksgiving_1' } },
            { textKey: 'choice_relationship_thanksgiving_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_thanksgiving_2' } },
            { textKey: 'choice_relationship_thanksgiving_3', effect: { statChanges: { health: 1, happiness: 1 }, logKey: 'log_relationship_thanksgiving_3' } },
        ]
    },
    {
        id: 'relationship_valentines',
        titleKey: 'event_relationship_valentines_title',
        descriptionKey: 'event_relationship_valentines_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_valentines_1', effect: { statChanges: { happiness: 5 }, fundChange: -150, logKey: 'log_relationship_valentines_1' } },
            { textKey: 'choice_relationship_valentines_2', effect: { statChanges: { happiness: 4 }, fundChange: -30, logKey: 'log_relationship_valentines_2' } },
            { textKey: 'choice_relationship_valentines_3', effect: { statChanges: { happiness: -5 }, logKey: 'log_relationship_valentines_3' } },
        ]
    },
    {
        id: 'relationship_beach_day',
        titleKey: 'event_relationship_beach_day_title',
        descriptionKey: 'event_relationship_beach_day_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_beach_day_1', effect: { statChanges: { skill: 1, happiness: 2 }, logKey: 'log_relationship_beach_day_1' } },
            { textKey: 'choice_relationship_beach_day_2', effect: { statChanges: { health: 1, happiness: 2 }, logKey: 'log_relationship_beach_day_2' } },
            { textKey: 'choice_relationship_beach_day_3', effect: { statChanges: { health: -2, happiness: 1 }, logKey: 'log_relationship_beach_day_3' } },
        ]
    },
    {
        id: 'relationship_camping_trip',
        titleKey: 'event_relationship_camping_trip_title',
        descriptionKey: 'event_relationship_camping_trip_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_camping_trip_1', effect: { statChanges: { skill: 2, happiness: 3 }, logKey: 'log_relationship_camping_trip_1' } },
            { textKey: 'choice_relationship_camping_trip_2', effect: { statChanges: { happiness: -2, health: -1 }, logKey: 'log_relationship_camping_trip_2' } },
            { textKey: 'choice_relationship_camping_trip_3', effect: { statChanges: { confidence: 1, happiness: 1 }, logKey: 'log_relationship_camping_trip_3' } },
        ]
    },
    {
        id: 'relationship_roadside_diner',
        titleKey: 'event_relationship_roadside_diner_title',
        descriptionKey: 'event_relationship_roadside_diner_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_roadside_diner_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_roadside_diner_1' } },
            { textKey: 'choice_relationship_roadside_diner_2', effect: { statChanges: { health: -1, happiness: 1 }, logKey: 'log_relationship_roadside_diner_2' } },
            { textKey: 'choice_relationship_roadside_diner_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_roadside_diner_3' } },
        ]
    },
    {
        id: 'relationship_hiking',
        titleKey: 'event_relationship_hiking_title',
        descriptionKey: 'event_relationship_hiking_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_hiking_1', effect: { statChanges: { health: 3, happiness: 3 }, logKey: 'log_relationship_hiking_1' } },
            { textKey: 'choice_relationship_hiking_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_hiking_2' } },
            { textKey: 'choice_relationship_hiking_3', effect: { statChanges: { health: 1, happiness: 1 }, logKey: 'log_relationship_hiking_3' } },
        ]
    },
    {
        id: 'relationship_mini_golf',
        titleKey: 'event_relationship_mini_golf_title',
        descriptionKey: 'event_relationship_mini_golf_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_mini_golf_1', effect: { statChanges: { skill: 1, happiness: 2 }, logKey: 'log_relationship_mini_golf_1' } },
            { textKey: 'choice_relationship_mini_golf_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_mini_golf_2' } },
            { textKey: 'choice_relationship_mini_golf_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_mini_golf_3' } },
        ]
    },
    {
        id: 'relationship_ice_cream_run',
        titleKey: 'event_relationship_ice_cream_run_title',
        descriptionKey: 'event_relationship_ice_cream_run_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_ice_cream_run_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_ice_cream_run_1' } },
            { textKey: 'choice_relationship_ice_cream_run_2', effect: { statChanges: { happiness: 1, confidence: 1 }, logKey: 'log_relationship_ice_cream_run_2' } },
            { textKey: 'choice_relationship_ice_cream_run_3', effect: { statChanges: { happiness: 3, health: -1 }, logKey: 'log_relationship_ice_cream_run_3' } },
        ]
    },
    {
        id: 'relationship_arcade_night',
        titleKey: 'event_relationship_arcade_night_title',
        descriptionKey: 'event_relationship_arcade_night_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_arcade_night_1', effect: { statChanges: { happiness: 3, confidence: 1 }, logKey: 'log_relationship_arcade_night_1' } },
            { textKey: 'choice_relationship_arcade_night_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_arcade_night_2' } },
            { textKey: 'choice_relationship_arcade_night_3', effect: { statChanges: { skill: 1, happiness: 2 }, logKey: 'log_relationship_arcade_night_3' } },
        ]
    },
    {
        id: 'relationship_picnic',
        titleKey: 'event_relationship_picnic_title',
        descriptionKey: 'event_relationship_picnic_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_picnic_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_picnic_1' } },
            { textKey: 'choice_relationship_picnic_2', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_relationship_picnic_2' } },
            { textKey: 'choice_relationship_picnic_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_relationship_picnic_3' } },
        ]
    },
    {
        id: 'relationship_concert_night',
        titleKey: 'event_relationship_concert_night_title',
        descriptionKey: 'event_relationship_concert_night_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_relationship_concert_night_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_concert_night_1' } },
            { textKey: 'choice_relationship_concert_night_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_concert_night_2' } },
            { textKey: 'choice_relationship_concert_night_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_concert_night_3' } },
        ]
    },
    {
        id: 'relationship_holiday_shopping',
        titleKey: 'event_relationship_holiday_shopping_title',
        descriptionKey: 'event_relationship_holiday_shopping_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_holiday_shopping_1', effect: { statChanges: { happiness: 2 }, fundChange: -100, logKey: 'log_relationship_holiday_shopping_1' } },
            { textKey: 'choice_relationship_holiday_shopping_2', effect: { statChanges: { happiness: 1 }, fundChange: -300, logKey: 'log_relationship_holiday_shopping_2' } },
            { textKey: 'choice_relationship_holiday_shopping_3', effect: { statChanges: { iq: -1, happiness: 1 }, logKey: 'log_relationship_holiday_shopping_3' } },
        ]
    },
    {
        id: 'relationship_coffee_run',
        titleKey: 'event_relationship_coffee_run_title',
        descriptionKey: 'event_relationship_coffee_run_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_coffee_run_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_relationship_coffee_run_1' } },
            { textKey: 'choice_relationship_coffee_run_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_coffee_run_2' } },
            { textKey: 'choice_relationship_coffee_run_3', effect: { statChanges: { confidence: -1 }, fundChange: -10, logKey: 'log_relationship_coffee_run_3' } },
        ]
    },
    {
        id: 'relationship_pet_adoption',
        titleKey: 'event_relationship_pet_adoption_title',
        descriptionKey: 'event_relationship_pet_adoption_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_pet_adoption_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_pet_adoption_1' } },
            { textKey: 'choice_relationship_pet_adoption_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_relationship_pet_adoption_2' } },
            { textKey: 'choice_relationship_pet_adoption_3', effect: { statChanges: { confidence: 1 }, logKey: 'log_relationship_pet_adoption_3' } },
        ]
    },
    {
        id: 'relationship_fireworks',
        titleKey: 'event_relationship_fireworks_title',
        descriptionKey: 'event_relationship_fireworks_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relationship_fireworks_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_relationship_fireworks_1' } },
            { textKey: 'choice_relationship_fireworks_2', effect: { statChanges: { happiness: 2, health: -1 }, logKey: 'log_relationship_fireworks_2' } },
            { textKey: 'choice_relationship_fireworks_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_relationship_fireworks_3' } },
        ]
    },
];

import { EventDraft, LifePhase, Business, GameState, CharacterStatus } from '../types';
import { BUSINESS_DEFINITIONS } from '../constants';

export const LIFE_EVENTS: EventDraft[] = [
    {
        id: 'flu',
        titleKey: 'event_flu_title',
        descriptionKey: 'event_flu_desc',
        phases: [LifePhase.Newborn, LifePhase.Elementary, LifePhase.MiddleSchool, LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_flu_1', effect: { statChanges: { health: 3 }, fundChange: -50, logKey: 'log_flu_1' } },
            { textKey: 'choice_flu_2', effect: { statChanges: { health: 2 }, logKey: 'log_flu_2', triggers: [{ eventId: 'sickness_worsens', chance: 0.3 }] } },
            { textKey: 'choice_flu_3', effect: { statChanges: { happiness: -2, health: -2 }, logKey: 'log_flu_3', triggers: [{ eventId: 'sickness_worsens', chance: 0.5 }] } },
        ]
    },
    {
        id: 'sickness_worsens',
        titleKey: 'event_sickness_worsens_title',
        descriptionKey: 'event_sickness_worsens_desc',
        phases: [LifePhase.Newborn, LifePhase.Elementary, LifePhase.MiddleSchool, LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_sickness_worsens_1', effect: { fundChange: -500, statChanges: { health: 3 }, logKey: 'log_sickness_worsens_1' } },
            { textKey: 'choice_sickness_worsens_2', effect: { statChanges: { health: -3 }, logKey: 'log_sickness_worsens_2', triggers: [{ eventId: 'chronic_illness', chance: 0.3 }] } },
            { textKey: 'choice_sickness_worsens_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_sickness_worsens_3' } },
        ]
    },
    {
        id: 'chronic_illness',
        titleKey: 'event_chronic_illness_title',
        descriptionKey: 'event_chronic_illness_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_chronic_illness_1', effect: { fundChange: -1000, statChanges: { health: 3 }, logKey: 'log_chronic_illness_1' } },
            { textKey: 'choice_chronic_illness_2', effect: { statChanges: { health: -3, happiness: -3 }, logKey: 'log_chronic_illness_2' } },
            { textKey: 'choice_chronic_illness_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_chronic_illness_3' } },
        ]
    },
    {
        id: 'traffic_accident',
        titleKey: 'event_traffic_accident_title',
        descriptionKey: 'event_traffic_accident_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_traffic_accident_1', effect: { statChanges: { health: -3 }, fundChange: -2000, logKey: 'log_traffic_accident_1' } },
            { textKey: 'choice_traffic_accident_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_traffic_accident_2', triggers: [{ eventId: 'sued', chance: 0.7 }] } },
            { textKey: 'choice_traffic_accident_3', effect: { statChanges: { iq: 2 }, logKey: 'log_traffic_accident_3' } },
        ]
    },
    {
        id: 'sued',
        titleKey: 'event_sued_title',
        descriptionKey: 'event_sued_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_sued_1', effect: { fundChange: -5000, logKey: 'log_sued_1' } },
            { textKey: 'choice_sued_2', effect: { statChanges: { eq: 3 }, fundChange: -10000, logKey: 'log_sued_2' } },
            { textKey: 'choice_sued_3', effect: { statChanges: { happiness: -3, eq: -3 }, logKey: 'log_sued_3' } },
        ]
    },
    {
        id: 'lottery_win',
        titleKey: 'event_lottery_win_title',
        descriptionKey: 'event_lottery_win_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_lottery_win_1', effect: { fundChange: 100000, statChanges: { happiness: 3 }, logKey: 'log_lottery_win_1' } },
            { textKey: 'choice_lottery_win_2', effect: { fundChange: 100000, statChanges: { happiness: 3 }, logKey: 'log_lottery_win_2', triggers: [{ eventId: 'friends_exploit', chance: 0.6 }] } },
            { textKey: 'choice_lottery_win_3', effect: { fundChange: 100000, logKey: 'log_lottery_win_3' } },
        ]
    },
    {
        id: 'friends_exploit',
        titleKey: 'event_friends_exploit_title',
        descriptionKey: 'event_friends_exploit_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_friends_exploit_1', effect: { fundChange: -5000, logKey: 'log_friends_exploit_1' } },
            { textKey: 'choice_friends_exploit_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_friends_exploit_2', triggers: [{ eventId: 'lose_friend', chance: 0.4 }] } },
            { textKey: 'choice_friends_exploit_3', effect: { fundChange: -15000, statChanges: { happiness: -3 }, logKey: 'log_friends_exploit_3' } },
        ]
    },
    {
        id: 'lose_friend',
        titleKey: 'event_lose_friend_title',
        descriptionKey: 'event_lose_friend_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_lose_friend_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_lose_friend_1' } },
            { textKey: 'choice_lose_friend_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_lose_friend_2' } },
            { textKey: 'choice_lose_friend_3', effect: { statChanges: { eq: -3 }, logKey: 'log_lose_friend_3' } },
        ]
    },
    {
        id: 'lost_wallet',
        titleKey: 'event_lost_wallet_title',
        descriptionKey: 'event_lost_wallet_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_lost_wallet_1', effect: { fundChange: -200, logKey: 'log_lost_wallet_1' } },
            { textKey: 'choice_lost_wallet_2', effect: { fundChange: -300, statChanges: { eq: -2 }, logKey: 'log_lost_wallet_2' } },
            { textKey: 'choice_lost_wallet_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_lost_wallet_3' } },
        ]
    },
    {
        id: 'burglary',
        titleKey: 'event_burglary_title',
        descriptionKey: 'event_burglary_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_burglary_1', effect: { fundChange: -1000, logKey: 'log_burglary_1' } },
            { textKey: 'choice_burglary_2', effect: { statChanges: { eq: 3, health: -3 }, logKey: 'log_burglary_2' } },
            { textKey: 'choice_burglary_3', effect: { statChanges: { eq: 3, happiness: 2 }, logKey: 'log_burglary_3' } },
        ]
    },
    {
        id: 'online_scam',
        titleKey: 'event_online_scam_title',
        descriptionKey: 'event_online_scam_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_online_scam_1', effect: { fundChange: -2000, statChanges: { happiness: -3 }, logKey: 'log_online_scam_1' } },
            { textKey: 'choice_online_scam_2', effect: { statChanges: { eq: 2 }, logKey: 'log_online_scam_2' } },
            { textKey: 'choice_online_scam_3', effect: { statChanges: { iq: 3 }, logKey: 'log_online_scam_3' } },
        ]
    },
    {
        id: 'charity_donation',
        titleKey: 'event_charity_donation_title',
        descriptionKey: 'event_charity_donation_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_charity_donation_1', effect: { fundChange: -1000, statChanges: { happiness: 3 }, logKey: 'log_charity_donation_1' } },
            { textKey: 'choice_charity_donation_2', effect: { fundChange: -100, statChanges: { happiness: 2 }, logKey: 'log_charity_donation_2' } },
            { textKey: 'choice_charity_donation_3', effect: { logKey: 'log_charity_donation_3' } },
        ]
    },
    {
        id: 'job_loss_social_crisis',
        titleKey: 'event_job_loss_social_crisis_title',
        descriptionKey: 'event_job_loss_social_crisis_desc',
        phases: [LifePhase.PostGraduation],
        condition: (state, char) => char.status === CharacterStatus.Working,
        choices: [
            { textKey: 'choice_job_loss_social_crisis_1', effect: { logKey: 'log_job_loss_social_crisis_1', action: (state, charId, manifest) => {
                const char = state.familyMembers[charId];
                const updatedChar = { ...char, status: CharacterStatus.Unemployed, careerTrack: null, careerLevel: 0 };
                return { familyMembers: { ...state.familyMembers, [charId]: updatedChar }};
            }}},
            { textKey: 'choice_job_loss_social_crisis_2', effect: { logKey: 'log_job_loss_social_crisis_2', action: (state, charId, manifest) => {
                const char = state.familyMembers[charId];
                const updatedChar = { ...char, status: CharacterStatus.Unemployed, careerTrack: null, careerLevel: 0 };
                return { familyMembers: { ...state.familyMembers, [charId]: updatedChar }};
            }}},
            { textKey: 'choice_job_loss_social_crisis_3', effect: { statChanges: { skill: 3, eq: 3}, logKey: 'log_job_loss_social_crisis_3' } },
        ]
    },
    {
        id: 'natural_disaster',
        titleKey: 'event_natural_disaster_title',
        descriptionKey: 'event_natural_disaster_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_natural_disaster_1', effect: { statChanges: { health: -3 }, logKey: 'log_natural_disaster_1' } },
            { textKey: 'choice_natural_disaster_2', effect: { statChanges: { eq: 3, health: -3 }, logKey: 'log_natural_disaster_2' } },
            { textKey: 'choice_natural_disaster_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_natural_disaster_3' } },
        ]
    },
    {
        id: 'street_assault',
        titleKey: 'event_street_assault_title',
        descriptionKey: 'event_street_assault_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_street_assault_1', effect: { statChanges: { health: -2, eq: 2 }, logKey: 'log_street_assault_1' } },
            { textKey: 'choice_street_assault_2', effect: { 
                statChanges: { health: -3, happiness: -3, eq: -3 }, 
                fundChange: -500,
                logKey: 'log_street_assault_2', 
                triggers: [{ eventId: 'sickness_worsens', chance: 0.5 }]
            }},
            { textKey: 'choice_street_assault_3', effect: { statChanges: { iq: 3, eq: 3 }, logKey: 'log_street_assault_3' } },
        ]
    },
    {
        id: 'getting_lost',
        titleKey: 'event_getting_lost_title',
        descriptionKey: 'event_getting_lost_desc',
        phases: [LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_getting_lost_1', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_getting_lost_1' } },
            { textKey: 'choice_getting_lost_2', effect: { logKey: 'log_getting_lost_2', triggers: [{ eventId: 'street_assault', chance: 0.3 }] } },
            { textKey: 'choice_getting_lost_3', effect: { statChanges: { iq: 3 }, logKey: 'log_getting_lost_3' } },
        ]
    },
    {
        id: 'unpaid_debt',
        titleKey: 'event_unpaid_debt_title',
        descriptionKey: 'event_unpaid_debt_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_unpaid_debt_1', effect: { statChanges: { happiness: -3 }, fundChange: -500, logKey: 'log_unpaid_debt_1' } },
            { textKey: 'choice_unpaid_debt_2', effect: { logKey: 'log_unpaid_debt_2', triggers: [{ eventId: 'sued', chance: 1.0 }] } },
            { textKey: 'choice_unpaid_debt_3', effect: { fundChange: -250, statChanges: { eq: 2 }, logKey: 'log_unpaid_debt_3' } },
        ]
    },
    {
        id: 'tax_evasion_discovered',
        titleKey: 'event_tax_evasion_discovered_title',
        descriptionKey: 'event_tax_evasion_discovered_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_tax_evasion_discovered_1', effect: { fundChange: -15000, statChanges: { happiness: -3 }, logKey: 'log_tax_evasion_discovered_1' } },
            { textKey: 'choice_tax_evasion_discovered_2', effect: { statChanges: { eq: 3 }, logKey: 'log_tax_evasion_discovered_2', triggers: [{ eventId: 'sued', chance: 1.0 }] } },
            { textKey: 'choice_tax_evasion_discovered_3', effect: { fundChange: -7500, statChanges: { iq: 3 }, logKey: 'log_tax_evasion_discovered_3' } },
        ]
    },
    {
        id: 'investment_opportunity',
        titleKey: 'event_investment_opportunity_title',
        descriptionKey: 'event_investment_opportunity_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        condition: (state) => state.familyFund >= 5000,
        choices: [
            { textKey: 'choice_investment_opportunity_1', effect: { fundChange: -20000, logKey: 'log_investment_opportunity_1', triggers: [{ eventId: 'investment_success_large', chance: 0.5 }, { eventId: 'investment_failure', chance: 0.5 }] } },
            { textKey: 'choice_investment_opportunity_2', effect: { fundChange: -5000, logKey: 'log_investment_opportunity_2', triggers: [{ eventId: 'investment_success_small', chance: 0.5 }, { eventId: 'investment_failure', chance: 0.5 }] } },
            { textKey: 'choice_investment_opportunity_3', effect: { logKey: 'log_investment_opportunity_3' } },
        ]
    },
    {
        id: 'investment_failure',
        titleKey: 'event_investment_failure_title',
        descriptionKey: 'event_investment_failure_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_investment_failure_1', effect: { statChanges: { happiness: -3, eq: -3 }, logKey: 'log_investment_failure_1' } },
            { textKey: 'choice_investment_failure_2', effect: { logKey: 'log_investment_failure_2' } },
            { textKey: 'choice_investment_failure_3', effect: { statChanges: { iq: 3 }, logKey: 'log_investment_failure_3' } },
        ]
    },
    {
        id: 'small_lottery',
        titleKey: 'event_small_lottery_title',
        descriptionKey: 'event_small_lottery_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_small_lottery_1', effect: { fundChange: 500, logKey: 'log_small_lottery_1' } },
            { textKey: 'choice_small_lottery_2', effect: { fundChange: -10, statChanges: { happiness: -2 }, logKey: 'log_small_lottery_2' } },
            { textKey: 'choice_small_lottery_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_small_lottery_3' } },
        ]
    },
    {
        id: 'get_a_pet',
        titleKey: 'event_get_a_pet_title',
        descriptionKey: 'event_get_a_pet_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_get_a_pet_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_get_a_pet_1' } },
            { textKey: 'choice_get_a_pet_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_get_a_pet_2', triggers: [{ eventId: 'pet_dies', chance: 0.8 }] } },
            { textKey: 'choice_get_a_pet_3', effect: { statChanges: { health: 3 }, logKey: 'log_get_a_pet_3' } },
        ]
    },
    {
        id: 'loan_shark',
        titleKey: 'event_loan_shark_title',
        descriptionKey: 'event_loan_shark_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_loan_shark_1', effect: { fundChange: -1000, statChanges: { eq: 2 }, logKey: 'log_loan_shark_1' } },
            { textKey: 'choice_loan_shark_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_loan_shark_2', triggers: [{ eventId: 'loan_shark_enforcers', chance: 1.0 }] } },
            { textKey: 'choice_loan_shark_3', effect: { statChanges: { iq: 3 }, logKey: 'log_loan_shark_3' } },
        ]
    },
    {
        id: 'loan_shark_enforcers',
        titleKey: 'event_loan_shark_enforcers_title',
        descriptionKey: 'event_loan_shark_enforcers_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_loan_shark_enforcers_1', effect: { fundChange: -5000, logKey: 'log_loan_shark_enforcers_1' } },
            { textKey: 'choice_loan_shark_enforcers_2', effect: { statChanges: { health: -3 }, logKey: 'log_loan_shark_enforcers_2', triggers: [{ eventId: 'sickness_worsens', chance: 0.6 }] } },
            { textKey: 'choice_loan_shark_enforcers_3', effect: { statChanges: { iq: 3, eq: 3 }, logKey: 'log_loan_shark_enforcers_3' } },
        ]
    },
    {
        id: 'relative_is_sick',
        titleKey: 'event_relative_is_sick_title',
        descriptionKey: 'event_relative_is_sick_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relative_is_sick_1', effect: { fundChange: -3000, statChanges: { happiness: -3 }, logKey: 'log_relative_is_sick_1' } },
            { textKey: 'choice_relative_is_sick_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_relative_is_sick_2', triggers: [{ eventId: 'lose_friend', chance: 0.8 }] } },
            { textKey: 'choice_relative_is_sick_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_relative_is_sick_3' } },
        ]
    },
    {
        id: 'self_development_seminar',
        titleKey: 'event_self_development_seminar_title',
        descriptionKey: 'event_self_development_seminar_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_self_development_seminar_1', effect: { statChanges: { eq: 3 }, logKey: 'log_self_development_seminar_1' } },
            { textKey: 'choice_self_development_seminar_2', effect: { logKey: 'log_self_development_seminar_2' } },
            { textKey: 'choice_self_development_seminar_3', effect: { statChanges: { iq: 3, skill: 2 }, logKey: 'log_self_development_seminar_3' } },
        ]
    },
    {
        id: 'minor_accident',
        titleKey: 'event_minor_accident_title',
        descriptionKey: 'event_minor_accident_desc',
        phases: [LifePhase.Newborn, LifePhase.Elementary, LifePhase.MiddleSchool, LifePhase.HighSchool, LifePhase.University, LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_minor_accident_1', effect: { fundChange: -100, statChanges: { health: 2 }, logKey: 'log_minor_accident_1' } },
            { textKey: 'choice_minor_accident_2', effect: { statChanges: { health: -2 }, logKey: 'log_minor_accident_2' } },
            { textKey: 'choice_minor_accident_3', effect: { fundChange: 500, logKey: 'log_minor_accident_3' } },
        ]
    },
    {
        id: 'pyramid_scheme',
        titleKey: 'event_pyramid_scheme_title',
        descriptionKey: 'event_pyramid_scheme_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_pyramid_scheme_1', effect: { logKey: 'log_pyramid_scheme_1', triggers: [{ eventId: 'investment_failure', chance: 1.0 }] } },
            { textKey: 'choice_pyramid_scheme_2', effect: { logKey: 'log_pyramid_scheme_2' } },
            { textKey: 'choice_pyramid_scheme_3', effect: { fundChange: 5000, logKey: 'log_pyramid_scheme_3', triggers: [{ eventId: 'investment_success_small', chance: 0.2 }] } },
        ]
    },
    {
        id: 'relative_death',
        titleKey: 'event_relative_death_title',
        descriptionKey: 'event_relative_death_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_relative_death_1', effect: { fundChange: -3000, statChanges: { happiness: -3 }, logKey: 'log_relative_death_1' } },
            { textKey: 'choice_relative_death_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_relative_death_2', triggers: [{ eventId: 'lose_friend', chance: 0.9 }] } },
            { textKey: 'choice_relative_death_3', effect: { statChanges: { eq: 3 }, logKey: 'log_relative_death_3' } },
        ]
    },
    {
        id: 'large_gift',
        titleKey: 'event_large_gift_title',
        descriptionKey: 'event_large_gift_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_large_gift_1', effect: { fundChange: 2000, statChanges: { happiness: 3 }, logKey: 'log_large_gift_1' } },
            { textKey: 'choice_large_gift_2', effect: { statChanges: { eq: 3, happiness: 2 }, logKey: 'log_large_gift_2' } },
            { textKey: 'choice_large_gift_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_large_gift_3' } },
        ]
    },
    {
        id: 'stranger_asks_for_help',
        titleKey: 'event_stranger_asks_for_help_title',
        descriptionKey: 'event_stranger_asks_for_help_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_stranger_asks_for_help_1', effect: { statChanges: { eq: 3, happiness: 3 }, logKey: 'log_stranger_asks_for_help_1', triggers: [{ eventId: 'unpaid_debt', chance: 0.3 }] } },
            { textKey: 'choice_stranger_asks_for_help_2', effect: { logKey: 'log_stranger_asks_for_help_2' } },
            { textKey: 'choice_stranger_asks_for_help_3', effect: { statChanges: { iq: 2 }, logKey: 'log_stranger_asks_for_help_3' } },
        ]
    },
    {
        id: 'social_movement',
        titleKey: 'event_social_movement_title',
        descriptionKey: 'event_social_movement_desc',
        phases: [LifePhase.University, LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_social_movement_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_social_movement_1' } },
            { textKey: 'choice_social_movement_2', effect: { logKey: 'log_social_movement_2' } },
            { textKey: 'choice_social_movement_3', effect: { fundChange: -100, statChanges: { eq: 3 }, logKey: 'log_social_movement_3' } },
        ]
    },
    {
        id: 'homeless_person',
        titleKey: 'event_homeless_person_title',
        descriptionKey: 'event_homeless_person_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_homeless_person_1', effect: { statChanges: { happiness: 3 }, fundChange: -20, logKey: 'log_homeless_person_1' } },
            { textKey: 'choice_homeless_person_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_homeless_person_2' } },
            { textKey: 'choice_homeless_person_3', effect: { statChanges: { iq: 2 }, logKey: 'log_homeless_person_3' } },
        ]
    },
    {
        id: 'lost_valuable_item',
        titleKey: 'event_lost_valuable_item_title',
        descriptionKey: 'event_lost_valuable_item_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_lost_valuable_item_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_lost_valuable_item_1' } },
            { textKey: 'choice_lost_valuable_item_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_lost_valuable_item_2' } },
            { textKey: 'choice_lost_valuable_item_3', effect: { fundChange: -200, logKey: 'log_lost_valuable_item_3' } },
        ]
    },
    {
        id: 'rescued_from_accident',
        titleKey: 'event_rescued_from_accident_title',
        descriptionKey: 'event_rescued_from_accident_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_rescued_from_accident_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_rescued_from_accident_1' } },
            { textKey: 'choice_rescued_from_accident_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_rescued_from_accident_2' } },
            { textKey: 'choice_rescued_from_accident_3', effect: { fundChange: 1000, statChanges: { eq: 3 }, logKey: 'log_rescued_from_accident_3' } },
        ]
    },
    {
        id: 'falsely_accused',
        titleKey: 'event_falsely_accused_title',
        descriptionKey: 'event_falsely_accused_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_falsely_accused_1', effect: { statChanges: { eq: 3 }, logKey: 'log_falsely_accused_1' } },
            { textKey: 'choice_falsely_accused_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_falsely_accused_2' } },
            { textKey: 'choice_falsely_accused_3', effect: { statChanges: { eq: 3 }, logKey: 'log_falsely_accused_3' } },
        ]
    },
    {
        id: 'surprise_gift',
        titleKey: 'event_surprise_gift_title',
        descriptionKey: 'event_surprise_gift_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired],
        choices: [
            { textKey: 'choice_surprise_gift_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_surprise_gift_1' } },
            { textKey: 'choice_surprise_gift_2', effect: { statChanges: { eq: 3 }, logKey: 'log_surprise_gift_2' } },
            { textKey: 'choice_surprise_gift_3', effect: { fundChange: 500, logKey: 'log_surprise_gift_3' } },
        ]
    },
    // Trigger-only events
    { id: 'investment_success_large', titleKey: 'event_investment_success_large_title', descriptionKey: 'event_investment_success_large_desc', phases: [LifePhase.PostGraduation, LifePhase.Retired], isTriggerOnly: true, choices: [{ textKey: 'choice_investment_success_large_1', effect: { fundChange: 50000, logKey: 'log_investment_success_large_1' } }, {textKey: 'choice_investment_success_large_2', effect: { logKey: 'log_investment_success_large_2'} }, { textKey: 'choice_investment_success_large_3', effect: { fundChange: 50000, statChanges: { happiness: 3 }, logKey: 'log_investment_success_large_3'} }] },
    { id: 'investment_success_small', titleKey: 'event_investment_success_small_title', descriptionKey: 'event_investment_success_small_desc', phases: [LifePhase.PostGraduation, LifePhase.Retired], isTriggerOnly: true, choices: [{ textKey: 'choice_investment_success_small_1', effect: { fundChange: 10000, logKey: 'log_investment_success_small_1' } }, { textKey: 'choice_investment_success_small_2', effect: { fundChange: 10000, statChanges: { happiness: 3 }, logKey: 'log_investment_success_small_2'} }, { textKey: 'choice_investment_success_small_3', effect: { fundChange: 15000, logKey: 'log_investment_success_small_3'} }] },
];
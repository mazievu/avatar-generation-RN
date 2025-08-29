
import { GameEvent, LifePhase, CharacterStatus } from '../types';

export const WORKING_LIFE_EVENTS: GameEvent[] = [
    // 10 Main Events (with triggers)
    {
        id: 'workinglife_first_day',
        titleKey: 'event_workinglife_first_day_title',
        descriptionKey: 'event_workinglife_first_day_desc',
        phases: [LifePhase.PostGraduation],
        condition: (state, char) => char.careerLevel === 0 && !char.completedOneTimeEvents.includes('workinglife_first_day'),
        choices: [
            { textKey: 'choice_workinglife_first_day_1', effect: { statChanges: { confidence: 2, skill: 1 }, logKey: 'log_workinglife_first_day_1' } },
            { textKey: 'choice_workinglife_first_day_2', effect: { statChanges: { confidence: -2 }, logKey: 'log_workinglife_first_day_2', triggers: [{ eventId: 'workinglife_boss_notices', chance: 0.6 }] } },
            { textKey: 'choice_workinglife_first_day_3', effect: { statChanges: { confidence: -1, happiness: -1 }, logKey: 'log_workinglife_first_day_3' } },
        ]
    },
    {
        id: 'workinglife_team_meeting',
        titleKey: 'event_workinglife_team_meeting_title',
        descriptionKey: 'event_workinglife_team_meeting_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_team_meeting_1', effect: { statChanges: { iq: 1, confidence: 1 }, logKey: 'log_workinglife_team_meeting_1' } },
            { textKey: 'choice_workinglife_team_meeting_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_team_meeting_2', triggers: [{ eventId: 'workinglife_boss_reprimand', chance: 0.5 }] } },
            { textKey: 'choice_workinglife_team_meeting_3', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_team_meeting_3' } },
        ]
    },
    {
        id: 'workinglife_forgot_laptop',
        titleKey: 'event_workinglife_forgot_laptop_title',
        descriptionKey: 'event_workinglife_forgot_laptop_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_forgot_laptop_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_forgot_laptop_1' } },
            { textKey: 'choice_workinglife_forgot_laptop_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_forgot_laptop_2', triggers: [{ eventId: 'workinglife_missed_deadline', chance: 0.7 }] } },
            { textKey: 'choice_workinglife_forgot_laptop_3', effect: { statChanges: { skill: -1, iq: -1 }, logKey: 'log_workinglife_forgot_laptop_3' } },
        ]
    },
    {
        id: 'workinglife_urgent_deadline',
        titleKey: 'event_workinglife_urgent_deadline_title',
        descriptionKey: 'event_workinglife_urgent_deadline_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_urgent_deadline_1', effect: { statChanges: { skill: 2, health: -2 }, logKey: 'log_workinglife_urgent_deadline_1' } },
            { textKey: 'choice_workinglife_urgent_deadline_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_urgent_deadline_2', triggers: [{ eventId: 'workinglife_client_complaint', chance: 0.6 }] } },
            { textKey: 'choice_workinglife_urgent_deadline_3', effect: { statChanges: { skill: -2, confidence: -2 }, logKey: 'log_workinglife_urgent_deadline_3' } },
        ]
    },
    {
        id: 'workinglife_difficult_task',
        titleKey: 'event_workinglife_difficult_task_title',
        descriptionKey: 'event_workinglife_difficult_task_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_difficult_task_1', effect: { statChanges: { skill: 3, confidence: 2 }, logKey: 'log_workinglife_difficult_task_1' } },
            { textKey: 'choice_workinglife_difficult_task_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_difficult_task_2', triggers: [{ eventId: 'workinglife_boss_disappointed', chance: 0.7 }] } },
            { textKey: 'choice_workinglife_difficult_task_3', effect: { statChanges: { skill: 1, happiness: 1 }, logKey: 'log_workinglife_difficult_task_3' } },
        ]
    },
    {
        id: 'workinglife_late_after_lunch',
        titleKey: 'event_workinglife_late_after_lunch_title',
        descriptionKey: 'event_workinglife_late_after_lunch_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_late_after_lunch_1', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_late_after_lunch_1' } },
            { textKey: 'choice_workinglife_late_after_lunch_2', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_late_after_lunch_2', triggers: [{ eventId: 'workinglife_colleagues_laugh', chance: 0.5 }] } },
            { textKey: 'choice_workinglife_late_after_lunch_3', effect: { statChanges: { iq: -1 }, logKey: 'log_workinglife_late_after_lunch_3' } },
        ]
    },
    {
        id: 'workinglife_company_presentation',
        titleKey: 'event_workinglife_company_presentation_title',
        descriptionKey: 'event_workinglife_company_presentation_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_company_presentation_1', effect: { statChanges: { confidence: 3, skill: 2 }, logKey: 'log_workinglife_company_presentation_1' } },
            { textKey: 'choice_workinglife_company_presentation_2', effect: { statChanges: { confidence: -3 }, logKey: 'log_workinglife_company_presentation_2', triggers: [{ eventId: 'workinglife_lose_points_with_boss', chance: 0.8 }] } },
            { textKey: 'choice_workinglife_company_presentation_3', effect: { statChanges: { confidence: -2, skill: -1 }, logKey: 'log_workinglife_company_presentation_3' } },
        ]
    },
    {
        id: 'workinglife_team_building',
        titleKey: 'event_workinglife_team_building_title',
        descriptionKey: 'event_workinglife_team_building_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_team_building_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_workinglife_team_building_1' } },
            { textKey: 'choice_workinglife_team_building_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_team_building_2', triggers: [{ eventId: 'workinglife_feel_isolated', chance: 0.7 }] } },
            { textKey: 'choice_workinglife_team_building_3', effect: { statChanges: { happiness: 1, confidence: -1 }, logKey: 'log_workinglife_team_building_3' } },
        ]
    },
    {
        id: 'workinglife_delayed_salary',
        titleKey: 'event_workinglife_delayed_salary_title',
        descriptionKey: 'event_workinglife_delayed_salary_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_delayed_salary_1', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_delayed_salary_1' } },
            { textKey: 'choice_workinglife_delayed_salary_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_delayed_salary_2', triggers: [{ eventId: 'workinglife_financial_trouble', chance: 0.6 }] } },
            { textKey: 'choice_workinglife_delayed_salary_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_delayed_salary_3' } },
        ]
    },
    {
        id: 'workinglife_difficult_client',
        titleKey: 'event_workinglife_difficult_client_title',
        descriptionKey: 'event_workinglife_difficult_client_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_difficult_client_1', effect: { statChanges: { skill: 2, confidence: 1 }, logKey: 'log_workinglife_difficult_client_1' } },
            { textKey: 'choice_workinglife_difficult_client_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_difficult_client_2', triggers: [{ eventId: 'workinglife_client_unhappy', chance: 0.7 }] } },
            { textKey: 'choice_workinglife_difficult_client_3', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_difficult_client_3' } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'workinglife_boss_notices',
        titleKey: 'event_workinglife_boss_notices_title',
        descriptionKey: 'event_workinglife_boss_notices_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_boss_notices_1', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_boss_notices_1' } },
            { textKey: 'choice_workinglife_boss_notices_2', effect: { statChanges: { iq: -1 }, logKey: 'log_workinglife_boss_notices_2' } },
            { textKey: 'choice_workinglife_boss_notices_3', effect: { statChanges: { confidence: -2, happiness: -1 }, logKey: 'log_workinglife_boss_notices_3' } },
        ]
    },
    {
        id: 'workinglife_boss_reprimand',
        titleKey: 'event_workinglife_boss_reprimand_title',
        descriptionKey: 'event_workinglife_boss_reprimand_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_boss_reprimand_1', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_boss_reprimand_1' } },
            { textKey: 'choice_workinglife_boss_reprimand_2', effect: { statChanges: { confidence: -1, happiness: -1 }, logKey: 'log_workinglife_boss_reprimand_2' } },
            { textKey: 'choice_workinglife_boss_reprimand_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_workinglife_boss_reprimand_3' } },
        ]
    },
    {
        id: 'workinglife_missed_deadline',
        titleKey: 'event_workinglife_missed_deadline_title',
        descriptionKey: 'event_workinglife_missed_deadline_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_missed_deadline_1', effect: { statChanges: { iq: -2, happiness: -1 }, logKey: 'log_workinglife_missed_deadline_1' } },
            { textKey: 'choice_workinglife_missed_deadline_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_missed_deadline_2' } },
            { textKey: 'choice_workinglife_missed_deadline_3', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_missed_deadline_3' } },
        ]
    },
    {
        id: 'workinglife_client_complaint',
        titleKey: 'event_workinglife_client_complaint_title',
        descriptionKey: 'event_workinglife_client_complaint_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_client_complaint_1', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_client_complaint_1' } },
            { textKey: 'choice_workinglife_client_complaint_2', effect: { statChanges: { confidence: 1, iq: -1 }, logKey: 'log_workinglife_client_complaint_2' } },
            { textKey: 'choice_workinglife_client_complaint_3', effect: { statChanges: { happiness: -5 }, logKey: 'log_workinglife_client_complaint_3' } },
        ]
    },
    {
        id: 'workinglife_boss_disappointed',
        titleKey: 'event_workinglife_boss_disappointed_title',
        descriptionKey: 'event_workinglife_boss_disappointed_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_boss_disappointed_1', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_boss_disappointed_1' } },
            { textKey: 'choice_workinglife_boss_disappointed_2', effect: { statChanges: { skill: 2 }, logKey: 'log_workinglife_boss_disappointed_2' } },
            { textKey: 'choice_workinglife_boss_disappointed_3', effect: { statChanges: { skill: -1 }, logKey: 'log_workinglife_boss_disappointed_3' } },
        ]
    },
    {
        id: 'workinglife_colleagues_laugh',
        titleKey: 'event_workinglife_colleagues_laugh_title',
        descriptionKey: 'event_workinglife_colleagues_laugh_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_colleagues_laugh_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_colleagues_laugh_1' } },
            { textKey: 'choice_workinglife_colleagues_laugh_2', effect: { statChanges: { confidence: 1, happiness: -1 }, logKey: 'log_workinglife_colleagues_laugh_2' } },
            { textKey: 'choice_workinglife_colleagues_laugh_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_colleagues_laugh_3' } },
        ]
    },
    {
        id: 'workinglife_lose_points_with_boss',
        titleKey: 'event_workinglife_lose_points_with_boss_title',
        descriptionKey: 'event_workinglife_lose_points_with_boss_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_lose_points_with_boss_1', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_lose_points_with_boss_1' } },
            { textKey: 'choice_workinglife_lose_points_with_boss_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_lose_points_with_boss_2' } },
            { textKey: 'choice_workinglife_lose_points_with_boss_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_lose_points_with_boss_3' } },
        ]
    },
    {
        id: 'workinglife_feel_isolated',
        titleKey: 'event_workinglife_feel_isolated_title',
        descriptionKey: 'event_workinglife_feel_isolated_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_feel_isolated_1', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_feel_isolated_1' } },
            { textKey: 'choice_workinglife_feel_isolated_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_workinglife_feel_isolated_2' } },
            { textKey: 'choice_workinglife_feel_isolated_3', effect: { statChanges: { confidence: 1, happiness: 1 }, logKey: 'log_workinglife_feel_isolated_3' } },
        ]
    },
    {
        id: 'workinglife_financial_trouble',
        titleKey: 'event_workinglife_financial_trouble_title',
        descriptionKey: 'event_workinglife_financial_trouble_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_financial_trouble_1', effect: { fundChange: -500, logKey: 'log_workinglife_financial_trouble_1' } },
            { textKey: 'choice_workinglife_financial_trouble_2', effect: { fundChange: 200, logKey: 'log_workinglife_financial_trouble_2' } },
            { textKey: 'choice_workinglife_financial_trouble_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_financial_trouble_3' } },
        ]
    },
    {
        id: 'workinglife_client_unhappy',
        titleKey: 'event_workinglife_client_unhappy_title',
        descriptionKey: 'event_workinglife_client_unhappy_desc',
        phases: [LifePhase.PostGraduation],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_workinglife_client_unhappy_1', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_client_unhappy_1' } },
            { textKey: 'choice_workinglife_client_unhappy_2', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_client_unhappy_2' } },
            { textKey: 'choice_workinglife_client_unhappy_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_client_unhappy_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'workinglife_overtime',
        titleKey: 'event_workinglife_overtime_title',
        descriptionKey: 'event_workinglife_overtime_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_overtime_1', effect: { statChanges: { skill: 1, health: -1 }, logKey: 'log_workinglife_overtime_1' } },
            { textKey: 'choice_workinglife_overtime_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_overtime_2' } },
            { textKey: 'choice_workinglife_overtime_3', effect: { statChanges: { happiness: 1, skill: -1 }, logKey: 'log_workinglife_overtime_3' } },
        ]
    },
    {
        id: 'workinglife_new_project',
        titleKey: 'event_workinglife_new_project_title',
        descriptionKey: 'event_workinglife_new_project_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_new_project_1', effect: { 
                statChanges: { skill: 2, confidence: 1 }, 
                logKey: 'log_workinglife_new_project_1',
                action: (state, charId) => {
                    const char = state.familyMembers[charId];
                    if (Math.random() < 0.2) { // 20% chance of a bonus
                        const bonusAmount = 500;
                        return {
                            familyFund: state.familyFund + bonusAmount,
                            gameLog: [...state.gameLog, { year: state.currentDate.year, messageKey: 'log_workinglife_project_bonus', replacements: { name: char.name, amount: bonusAmount } }]
                        }
                    }
                    return {};
                }
            } },
            { textKey: 'choice_workinglife_new_project_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_new_project_2' } },
            { textKey: 'choice_workinglife_new_project_3', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_new_project_3' } },
        ]
    },
    {
        id: 'workinglife_boss_praise',
        titleKey: 'event_workinglife_boss_praise_title',
        descriptionKey: 'event_workinglife_boss_praise_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_boss_praise_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_workinglife_boss_praise_1' } },
            { textKey: 'choice_workinglife_boss_praise_2', effect: { statChanges: { happiness: 1, confidence: -1 }, logKey: 'log_workinglife_boss_praise_2' } },
            { textKey: 'choice_workinglife_boss_praise_3', effect: { statChanges: { confidence: 2, happiness: 2 }, logKey: 'log_workinglife_boss_praise_3' } },
        ]
    },
    {
        id: 'workinglife_boss_criticism',
        titleKey: 'event_workinglife_boss_criticism_title',
        descriptionKey: 'event_workinglife_boss_criticism_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_boss_criticism_1', effect: { statChanges: { confidence: -2, happiness: -1 }, logKey: 'log_workinglife_boss_criticism_1' } },
            { textKey: 'choice_workinglife_boss_criticism_2', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_boss_criticism_2' } },
            { textKey: 'choice_workinglife_boss_criticism_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_boss_criticism_3' } },
        ]
    },
    {
        id: 'workinglife_training_session',
        titleKey: 'event_workinglife_training_session_title',
        descriptionKey: 'event_workinglife_training_session_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_training_session_1', effect: { statChanges: { iq: 2, skill: 1 }, logKey: 'log_workinglife_training_session_1' } },
            { textKey: 'choice_workinglife_training_session_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_training_session_2' } },
            { textKey: 'choice_workinglife_training_session_3', effect: { statChanges: { happiness: -1, iq: -1 }, logKey: 'log_workinglife_training_session_3' } },
        ]
    },
    {
        id: 'workinglife_new_colleague',
        titleKey: 'event_workinglife_new_colleague_title',
        descriptionKey: 'event_workinglife_new_colleague_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_new_colleague_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_workinglife_new_colleague_1' } },
            { textKey: 'choice_workinglife_new_colleague_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_new_colleague_2' } },
            { textKey: 'choice_workinglife_new_colleague_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_new_colleague_3' } },
        ]
    },
    {
        id: 'workinglife_office_lunch',
        titleKey: 'event_workinglife_office_lunch_title',
        descriptionKey: 'event_workinglife_office_lunch_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_office_lunch_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_workinglife_office_lunch_1' } },
            { textKey: 'choice_workinglife_office_lunch_2', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_office_lunch_2' } },
            { textKey: 'choice_workinglife_office_lunch_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_office_lunch_3' } },
        ]
    },
    {
        id: 'workinglife_client_meeting',
        titleKey: 'event_workinglife_client_meeting_title',
        descriptionKey: 'event_workinglife_client_meeting_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_client_meeting_1', effect: { statChanges: { skill: 1, confidence: 1 }, logKey: 'log_workinglife_client_meeting_1' } },
            { textKey: 'choice_workinglife_client_meeting_2', effect: { statChanges: { iq: 1 }, logKey: 'log_workinglife_client_meeting_2' } },
            { textKey: 'choice_workinglife_client_meeting_3', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_client_meeting_3' } },
        ]
    },
    {
        id: 'workinglife_group_work',
        titleKey: 'event_workinglife_group_work_title',
        descriptionKey: 'event_workinglife_group_work_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_group_work_1', effect: { statChanges: { iq: 1, confidence: 1 }, logKey: 'log_workinglife_group_work_1' } },
            { textKey: 'choice_workinglife_group_work_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_group_work_2' } },
            { textKey: 'choice_workinglife_group_work_3', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_group_work_3' } },
        ]
    },
    {
        id: 'workinglife_company_party',
        titleKey: 'event_workinglife_company_party_title',
        descriptionKey: 'event_workinglife_company_party_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_company_party_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_workinglife_company_party_1' } },
            { textKey: 'choice_workinglife_company_party_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_company_party_2' } },
            { textKey: 'choice_workinglife_company_party_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_company_party_3' } },
        ]
    },
    {
        id: 'workinglife_business_trip',
        titleKey: 'event_workinglife_business_trip_title',
        descriptionKey: 'event_workinglife_business_trip_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_business_trip_1', effect: { statChanges: { skill: 2, confidence: 1 }, logKey: 'log_workinglife_business_trip_1' } },
            { textKey: 'choice_workinglife_business_trip_2', effect: { statChanges: { confidence: -2, happiness: -1 }, logKey: 'log_workinglife_business_trip_2' } },
            { textKey: 'choice_workinglife_business_trip_3', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_workinglife_business_trip_3' } },
        ]
    },
    {
        id: 'workinglife_end_of_day',
        titleKey: 'event_workinglife_end_of_day_title',
        descriptionKey: 'event_workinglife_end_of_day_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_end_of_day_1', effect: { statChanges: { health: 1, happiness: 1 }, logKey: 'log_workinglife_end_of_day_1' } },
            { textKey: 'choice_workinglife_end_of_day_2', effect: { statChanges: { skill: 1, health: -1 }, logKey: 'log_workinglife_end_of_day_2' } },
            { textKey: 'choice_workinglife_end_of_day_3', effect: { statChanges: { happiness: 2, iq: -1 }, logKey: 'log_workinglife_end_of_day_3' } },
        ]
    },
    {
        id: 'workinglife_work_delayed',
        titleKey: 'event_workinglife_work_delayed_title',
        descriptionKey: 'event_workinglife_work_delayed_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_work_delayed_1', effect: { statChanges: { skill: 1 }, logKey: 'log_workinglife_work_delayed_1' } },
            { textKey: 'choice_workinglife_work_delayed_2', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_work_delayed_2' } },
            { textKey: 'choice_workinglife_work_delayed_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_work_delayed_3' } },
        ]
    },
    {
        id: 'workinglife_pay_raise',
        titleKey: 'event_workinglife_pay_raise_title',
        descriptionKey: 'event_workinglife_pay_raise_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_pay_raise_1', effect: { statChanges: { happiness: 3 }, fundChange: 1000, logKey: 'log_workinglife_pay_raise_1' } },
            { textKey: 'choice_workinglife_pay_raise_2', effect: { statChanges: { happiness: 2 }, fundChange: 1000, logKey: 'log_workinglife_pay_raise_2' } },
            { textKey: 'choice_workinglife_pay_raise_3', effect: { statChanges: { happiness: 1 }, fundChange: 1000, logKey: 'log_workinglife_pay_raise_3' } },
        ]
    },
    {
        id: 'workinglife_bonus_cut',
        titleKey: 'event_workinglife_bonus_cut_title',
        descriptionKey: 'event_workinglife_bonus_cut_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_bonus_cut_1', effect: { statChanges: { happiness: -2 }, logKey: 'log_workinglife_bonus_cut_1' } },
            { textKey: 'choice_workinglife_bonus_cut_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_bonus_cut_2' } },
            { textKey: 'choice_workinglife_bonus_cut_3', effect: { 
                statChanges: { confidence: -1 }, 
                logKey: 'log_workinglife_bonus_cut_3',
                action: (state, charId) => {
                    const char = state.familyMembers[charId];
                    const updatedChar = { 
                        ...char, 
                        status: CharacterStatus.Unemployed, 
                        careerTrack: null, 
                        careerLevel: 0 
                    };
                    return { 
                        familyMembers: { 
                            ...state.familyMembers, 
                            [charId]: updatedChar 
                        }
                    };
                }
            }},
        ]
    },
    {
        id: 'workinglife_policy_change',
        titleKey: 'event_workinglife_policy_change_title',
        descriptionKey: 'event_workinglife_policy_change_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_policy_change_1', effect: { statChanges: { iq: 1 }, logKey: 'log_workinglife_policy_change_1' } },
            { textKey: 'choice_workinglife_policy_change_2', effect: { statChanges: { confidence: 1 }, logKey: 'log_workinglife_policy_change_2' } },
            { textKey: 'choice_workinglife_policy_change_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_workinglife_policy_change_3' } },
        ]
    },
    {
        id: 'workinglife_computer_broken',
        titleKey: 'event_workinglife_computer_broken_title',
        descriptionKey: 'event_workinglife_computer_broken_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_computer_broken_1', effect: { statChanges: { iq: 1 }, logKey: 'log_workinglife_computer_broken_1' } },
            { textKey: 'choice_workinglife_computer_broken_2', effect: { statChanges: { skill: 1, iq: -1 }, logKey: 'log_workinglife_computer_broken_2' } },
            { textKey: 'choice_workinglife_computer_broken_3', effect: { statChanges: { happiness: 1, skill: -1 }, logKey: 'log_workinglife_computer_broken_3' } },
        ]
    },
    {
        id: 'workinglife_lost_motivation',
        titleKey: 'event_workinglife_lost_motivation_title',
        descriptionKey: 'event_workinglife_lost_motivation_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_lost_motivation_1', effect: { statChanges: { happiness: 2, health: 1 }, logKey: 'log_workinglife_lost_motivation_1' } },
            { textKey: 'choice_workinglife_lost_motivation_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_lost_motivation_2' } },
            { textKey: 'choice_workinglife_lost_motivation_3', effect: { statChanges: { skill: 1, happiness: -1 }, logKey: 'log_workinglife_lost_motivation_3' } },
        ]
    },
    {
        id: 'workinglife_performance_review',
        titleKey: 'event_workinglife_performance_review_title',
        descriptionKey: 'event_workinglife_performance_review_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_performance_review_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_workinglife_performance_review_1' } },
            { textKey: 'choice_workinglife_performance_review_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_performance_review_2' } },
            { textKey: 'choice_workinglife_performance_review_3', effect: { statChanges: { happiness: -2, confidence: -1 }, logKey: 'log_workinglife_performance_review_3' } },
        ]
    },
    {
        id: 'workinglife_share_office_snacks',
        titleKey: 'event_workinglife_share_office_snacks_title',
        descriptionKey: 'event_workinglife_share_office_snacks_desc',
        phases: [LifePhase.PostGraduation],
        choices: [
            { textKey: 'choice_workinglife_share_office_snacks_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_workinglife_share_office_snacks_1' } },
            { textKey: 'choice_workinglife_share_office_snacks_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_workinglife_share_office_snacks_2' } },
            { textKey: 'choice_workinglife_share_office_snacks_3', effect: { statChanges: { confidence: -1 }, logKey: 'log_workinglife_share_office_snacks_3' } },
        ]
    },
];

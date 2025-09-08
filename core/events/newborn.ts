import { EventDraft, LifePhase } from '../types';

export const NEWBORN_EVENTS: EventDraft[] = [
    // 10 Main Events
    {
        id: 'newborn_first_night_crying',
        titleKey: 'event_newborn_first_night_crying_title',
        descriptionKey: 'event_newborn_first_night_crying_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age === 0 && !char.completedOneTimeEvents.includes('newborn_first_night_crying'),
        choices: [
            { textKey: 'choice_newborn_first_night_crying_1', effect: { statChanges: { happiness: 3, health: 2 }, logKey: 'log_newborn_first_night_crying_1' } },
            { textKey: 'choice_newborn_first_night_crying_2', effect: { statChanges: { happiness: 2, health: -2 }, logKey: 'log_newborn_first_night_crying_2' } },
            { textKey: 'choice_newborn_first_night_crying_3', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_first_night_crying_3', triggers: [{ eventId: 'newborn_parents_sleepless', chance: 0.5, reTarget: 'parents' }] } },
        ]
    },
    {
        id: 'newborn_first_bath',
        titleKey: 'event_newborn_first_bath_title',
        descriptionKey: 'event_newborn_first_bath_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age === 0 && !char.completedOneTimeEvents.includes('newborn_first_bath'),
        choices: [
            { textKey: 'choice_newborn_first_bath_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_first_bath_1' } },
            { textKey: 'choice_newborn_first_bath_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_newborn_first_bath_2', triggers: [{ eventId: 'newborn_fear_of_bathing', chance: 0.4 }] } },
            { textKey: 'choice_newborn_first_bath_3', effect: { statChanges: { happiness: 2, iq: 4 }, logKey: 'log_newborn_first_bath_3' } },
        ]
    },
    {
        id: 'newborn_vaccination',
        titleKey: 'event_newborn_vaccination_title',
        descriptionKey: 'event_newborn_vaccination_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_vaccination_1', effect: { statChanges: { happiness: 2, health: -4 }, logKey: 'log_newborn_vaccination_1' } },
            { textKey: 'choice_newborn_vaccination_2', effect: { statChanges: { eq: 2, health: -2 }, logKey: 'log_newborn_vaccination_2' } },
            { textKey: 'choice_newborn_vaccination_3', effect: { statChanges: { eq: -2, health: -2 }, logKey: 'log_newborn_vaccination_3', triggers: [{ eventId: 'newborn_fever_after_shot', chance: 0.6 }] } },
        ]
    },
    {
        id: 'newborn_learning_to_roll_over',
        titleKey: 'event_newborn_learning_to_roll_over_title',
        descriptionKey: 'event_newborn_learning_to_roll_over_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age <= 1 && !char.completedOneTimeEvents.includes('newborn_learning_to_roll_over'),
        choices: [
            { textKey: 'choice_newborn_learning_to_roll_over_1', effect: { statChanges: { health: 2, happiness: 2 }, logKey: 'log_newborn_learning_to_roll_over_1' } },
            { textKey: 'choice_newborn_learning_to_roll_over_2', effect: { statChanges: { health: 2, iq: 2 }, logKey: 'log_newborn_learning_to_roll_over_2' } },
            { textKey: 'choice_newborn_learning_to_roll_over_3', effect: { statChanges: { health: 4 }, logKey: 'log_newborn_learning_to_roll_over_3', triggers: [{ eventId: 'newborn_minor_scratch', chance: 0.3 }] } },
        ]
    },
    {
        id: 'newborn_learning_to_crawl',
        titleKey: 'event_newborn_learning_to_crawl_title',
        descriptionKey: 'event_newborn_learning_to_crawl_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age <= 2 && !char.completedOneTimeEvents.includes('newborn_learning_to_crawl'),
        choices: [
            { textKey: 'choice_newborn_learning_to_crawl_1', effect: { statChanges: { health: 2, iq: 2 }, logKey: 'log_newborn_learning_to_crawl_1' } },
            { textKey: 'choice_newborn_learning_to_crawl_2', effect: { statChanges: { health: 2, happiness: 2 }, logKey: 'log_newborn_learning_to_crawl_2' } },
            { textKey: 'choice_newborn_learning_to_crawl_3', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_learning_to_crawl_3', triggers: [{ eventId: 'newborn_parents_baby_proofing', chance: 0.5 }] } },
        ]
    },
    {
        id: 'newborn_first_steps',
        titleKey: 'event_newborn_first_steps_title',
        descriptionKey: 'event_newborn_first_steps_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1 && !char.completedOneTimeEvents.includes('newborn_first_steps'),
        choices: [
            { textKey: 'choice_newborn_first_steps_1', effect: { statChanges: { health: 3, eq: 2 }, logKey: 'log_newborn_first_steps_1' } },
            { textKey: 'choice_newborn_first_steps_2', effect: { statChanges: { health: 2, eq: 3 }, logKey: 'log_newborn_first_steps_2' } },
            { textKey: 'choice_newborn_first_steps_3', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_first_steps_3', triggers: [{ eventId: 'newborn_scraped_knee', chance: 0.4 }] } },
        ]
    },
    {
        id: 'newborn_first_day_daycare',
        titleKey: 'event_newborn_first_day_daycare_title',
        descriptionKey: 'event_newborn_first_day_daycare_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2 && !char.completedOneTimeEvents.includes('newborn_first_day_daycare'),
        choices: [
            { textKey: 'choice_newborn_first_day_daycare_1', effect: { statChanges: { eq: -3, happiness: -2 }, logKey: 'log_newborn_first_day_daycare_1' } },
            { textKey: 'choice_newborn_first_day_daycare_2', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_first_day_daycare_2' } },
            { textKey: 'choice_newborn_first_day_daycare_3', effect: { statChanges: { eq: -4 }, logKey: 'log_newborn_first_day_daycare_3', triggers: [{ eventId: 'newborn_teacher_comforts', chance: 0.6 }] } },
        ]
    },
    {
        id: 'newborn_first_self_feeding',
        titleKey: 'event_newborn_first_self_feeding_title',
        descriptionKey: 'event_newborn_first_self_feeding_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1 && !char.completedOneTimeEvents.includes('newborn_first_self_feeding'),
        choices: [
            { textKey: 'choice_newborn_first_self_feeding_1', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_first_self_feeding_1' } },
            { textKey: 'choice_newborn_first_self_feeding_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_newborn_first_self_feeding_2', triggers: [{ eventId: 'newborn_food_mess', chance: 0.7 }] } },
            { textKey: 'choice_newborn_first_self_feeding_3', effect: { statChanges: { eq: 2, iq: 2 }, logKey: 'log_newborn_first_self_feeding_3' } },
        ]
    },
    {
        id: 'newborn_snatching_toys',
        titleKey: 'event_newborn_snatching_toys_title',
        descriptionKey: 'event_newborn_snatching_toys_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_snatching_toys_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_newborn_snatching_toys_1' } },
            { textKey: 'choice_newborn_snatching_toys_2', effect: { statChanges: { eq: -2 }, logKey: 'log_newborn_snatching_toys_2' } },
            { textKey: 'choice_newborn_snatching_toys_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_newborn_snatching_toys_3', triggers: [{ eventId: 'newborn_parental_intervention', chance: 0.5 }] } },
        ]
    },
    {
        id: 'newborn_lost_in_store',
        titleKey: 'event_newborn_lost_in_store_title',
        descriptionKey: 'event_newborn_lost_in_store_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_lost_in_store_1', effect: { statChanges: { eq: 2, iq: 2 }, logKey: 'log_newborn_lost_in_store_1' } },
            { textKey: 'choice_newborn_lost_in_store_2', effect: { statChanges: { eq: -3 }, logKey: 'log_newborn_lost_in_store_2' } },
            { textKey: 'choice_newborn_lost_in_store_3', effect: { statChanges: { eq: 3 }, logKey: 'log_newborn_lost_in_store_3', triggers: [{ eventId: 'newborn_staff_assistance', chance: 0.8 }] } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'newborn_parents_sleepless',
        titleKey: 'event_newborn_parents_sleepless_title',
        descriptionKey: 'event_newborn_parents_sleepless_desc',
        phases: [LifePhase.PostGraduation, LifePhase.Retired], // This event is for the parents
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_parents_sleepless_1', effect: { 
                logKey: 'log_newborn_parents_sleepless_1',
                action: (state, parentId, manifest) => {
                    const newState = JSON.parse(JSON.stringify(state));
                    const parent1 = newState.familyMembers[parentId];
                    if (!parent1) return newState;
                    const statChanges = { health: -3, happiness: -2 };
                    parent1.stats.health = Math.max(0, parent1.stats.health + statChanges.health);
                    parent1.stats.happiness = Math.max(0, parent1.stats.happiness + statChanges.happiness);
                    if (parent1.partnerId) {
                        const parent2 = newState.familyMembers[parent1.partnerId];
                        if (parent2 && parent2.isAlive) {
                            parent2.stats.health = Math.max(0, parent2.stats.health + statChanges.health);
                            parent2.stats.happiness = Math.max(0, parent2.stats.happiness + statChanges.happiness);
                        }
                    }
                    return newState;
                }
            } },
            { textKey: 'choice_newborn_parents_sleepless_2', effect: { 
                logKey: 'log_newborn_parents_sleepless_2',
                action: (state, parentId, manifest) => {
                    const newState = JSON.parse(JSON.stringify(state));
                    const parent1 = newState.familyMembers[parentId];
                    if (!parent1) return newState;
                    const statChanges = { health: -4, happiness: 2 };
                    parent1.stats.health = Math.max(0, parent1.stats.health + statChanges.health);
                    parent1.stats.happiness = Math.min(100, parent1.stats.happiness + statChanges.happiness);
                    if (parent1.partnerId) {
                        const parent2 = newState.familyMembers[parent1.partnerId];
                        if (parent2 && parent2.isAlive) {
                            parent2.stats.health = Math.max(0, parent2.stats.health + statChanges.health);
                            parent2.stats.happiness = Math.min(100, parent2.stats.happiness + statChanges.happiness);
                        }
                    }
                    return newState;
                }
            } },
            { textKey: 'choice_newborn_parents_sleepless_3', effect: { 
                logKey: 'log_newborn_parents_sleepless_3',
                action: (state, parentId, manifest) => {
                    const newState = JSON.parse(JSON.stringify(state));
                    const parent1 = newState.familyMembers[parentId];
                    if (!parent1) return newState;
                    const statChanges = { health: 0, happiness: 3 };
                    parent1.stats.happiness = Math.min(100, parent1.stats.happiness + statChanges.happiness);
                    if (parent1.partnerId) {
                        const parent2 = newState.familyMembers[parent1.partnerId];
                        if (parent2 && parent2.isAlive) {
                            parent2.stats.happiness = Math.min(100, parent2.stats.happiness + statChanges.happiness);
                        }
                    }
                    return newState;
                }
            } },
        ]
    },
    {
        id: 'newborn_fear_of_bathing',
        titleKey: 'event_newborn_fear_of_bathing_title',
        descriptionKey: 'event_newborn_fear_of_bathing_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_fear_of_bathing_1', effect: { statChanges: { happiness: 3, eq: 2 }, logKey: 'log_newborn_fear_of_bathing_1' } },
            { textKey: 'choice_newborn_fear_of_bathing_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_newborn_fear_of_bathing_2' } },
            { textKey: 'choice_newborn_fear_of_bathing_3', effect: { statChanges: { happiness: -4 }, logKey: 'log_newborn_fear_of_bathing_3' } },
        ]
    },
    {
        id: 'newborn_fever_after_shot',
        titleKey: 'event_newborn_fever_after_shot_title',
        descriptionKey: 'event_newborn_fever_after_shot_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_fever_after_shot_1', effect: { statChanges: { health: 3 }, logKey: 'log_newborn_fever_after_shot_1' } },
            { textKey: 'choice_newborn_fever_after_shot_2', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_fever_after_shot_2' } },
            { textKey: 'choice_newborn_fever_after_shot_3', effect: { statChanges: { health: -2, happiness: -3 }, logKey: 'log_newborn_fever_after_shot_3' } },
        ]
    },
    {
        id: 'newborn_minor_scratch',
        titleKey: 'event_newborn_minor_scratch_title',
        descriptionKey: 'event_newborn_minor_scratch_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_minor_scratch_1', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_minor_scratch_1' } },
            { textKey: 'choice_newborn_minor_scratch_2', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_minor_scratch_2' } },
            { textKey: 'choice_newborn_minor_scratch_3', effect: { statChanges: { happiness: -3 }, logKey: 'log_newborn_minor_scratch_3' } },
        ]
    },
    {
        id: 'newborn_parents_baby_proofing',
        titleKey: 'event_newborn_parents_baby_proofing_title',
        descriptionKey: 'event_newborn_parents_baby_proofing_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_parents_baby_proofing_1', effect: { statChanges: { health: 3 }, logKey: 'log_newborn_parents_baby_proofing_1' } },
            { textKey: 'choice_newborn_parents_baby_proofing_2', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_parents_baby_proofing_2' } },
            { textKey: 'choice_newborn_parents_baby_proofing_3', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_parents_baby_proofing_3' } },
        ]
    },
    {
        id: 'newborn_scraped_knee',
        titleKey: 'event_newborn_scraped_knee_title',
        descriptionKey: 'event_newborn_scraped_knee_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_scraped_knee_1', effect: { statChanges: { health: 4 }, logKey: 'log_newborn_scraped_knee_1' } },
            { textKey: 'choice_newborn_scraped_knee_2', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_scraped_knee_2' } },
            { textKey: 'choice_newborn_scraped_knee_3', effect: { statChanges: { health: 3 }, logKey: 'log_newborn_scraped_knee_3' } },
        ]
    },
    {
        id: 'newborn_teacher_comforts',
        titleKey: 'event_newborn_teacher_comforts_title',
        descriptionKey: 'event_newborn_teacher_comforts_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_teacher_comforts_1', effect: { statChanges: { happiness: 3, eq: 2 }, logKey: 'log_newborn_teacher_comforts_1' } },
            { textKey: 'choice_newborn_teacher_comforts_2', effect: { statChanges: { happiness: 2, eq: 3 }, logKey: 'log_newborn_teacher_comforts_2' } },
            { textKey: 'choice_newborn_teacher_comforts_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_teacher_comforts_3' } },
        ]
    },
    {
        id: 'newborn_food_mess',
        titleKey: 'event_newborn_food_mess_title',
        descriptionKey: 'event_newborn_food_mess_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_food_mess_1', effect: { statChanges: { iq: 4 }, logKey: 'log_newborn_food_mess_1' } },
            { textKey: 'choice_newborn_food_mess_2', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_newborn_food_mess_2' } },
            { textKey: 'choice_newborn_food_mess_3', effect: { statChanges: { happiness: 4, iq: 2 }, logKey: 'log_newborn_food_mess_3' } },
        ]
    },
    {
        id: 'newborn_parental_intervention',
        titleKey: 'event_newborn_parental_intervention_title',
        descriptionKey: 'event_newborn_parental_intervention_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_parental_intervention_1', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_parental_intervention_1' } },
            { textKey: 'choice_newborn_parental_intervention_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_newborn_parental_intervention_2' } },
            { textKey: 'choice_newborn_parental_intervention_3', effect: { statChanges: { happiness: 2, iq: 2 }, logKey: 'log_newborn_parental_intervention_3' } },
        ]
    },
    {
        id: 'newborn_staff_assistance',
        titleKey: 'event_newborn_staff_assistance_title',
        descriptionKey: 'event_newborn_staff_assistance_desc',
        phases: [LifePhase.Newborn],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_newborn_staff_assistance_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_staff_assistance_1' } },
            { textKey: 'choice_newborn_staff_assistance_2', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_staff_assistance_2' } },
            { textKey: 'choice_newborn_staff_assistance_3', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_staff_assistance_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'newborn_off_nap_schedule',
        titleKey: 'event_newborn_off_nap_schedule_title',
        descriptionKey: 'event_newborn_off_nap_schedule_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_off_nap_schedule_1', effect: { statChanges: { health: 2 }, logKey: 'log_newborn_off_nap_schedule_1' } },
            { textKey: 'choice_newborn_off_nap_schedule_2', effect: { statChanges: { health: -4, happiness: 2 }, logKey: 'log_newborn_off_nap_schedule_2' } },
            { textKey: 'choice_newborn_off_nap_schedule_3', effect: { statChanges: { health: -3 }, logKey: 'log_newborn_off_nap_schedule_3' } },
        ]
    },
    {
        id: 'newborn_first_tooth',
        titleKey: 'event_newborn_first_tooth_title',
        descriptionKey: 'event_newborn_first_tooth_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age <= 1 && !char.completedOneTimeEvents.includes('newborn_first_tooth'),
        choices: [
            { textKey: 'choice_newborn_first_tooth_1', effect: { statChanges: { health: -2, happiness: 2 }, logKey: 'log_newborn_first_tooth_1' } },
            { textKey: 'choice_newborn_first_tooth_2', effect: { statChanges: { health: -4 }, logKey: 'log_newborn_first_tooth_2' } },
            { textKey: 'choice_newborn_first_tooth_3', effect: { statChanges: { health: -2, happiness: 3 }, logKey: 'log_newborn_first_tooth_3' } },
        ]
    },
    {
        id: 'newborn_stroller_in_park',
        titleKey: 'event_newborn_stroller_in_park_title',
        descriptionKey: 'event_newborn_stroller_in_park_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_stroller_in_park_1', effect: { statChanges: { health: 2, happiness: 2 }, logKey: 'log_newborn_stroller_in_park_1' } },
            { textKey: 'choice_newborn_stroller_in_park_2', effect: { statChanges: { iq: 2, happiness: 3 }, logKey: 'log_newborn_stroller_in_park_2' } },
            { textKey: 'choice_newborn_stroller_in_park_3', effect: { statChanges: { eq: 2, health: 2 }, logKey: 'log_newborn_stroller_in_park_3' } },
        ]
    },
    {
        id: 'newborn_first_haircut',
        titleKey: 'event_newborn_first_haircut_title',
        descriptionKey: 'event_newborn_first_haircut_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1 && !char.completedOneTimeEvents.includes('newborn_first_haircut'),
        choices: [
            { textKey: 'choice_newborn_first_haircut_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_newborn_first_haircut_1' } },
            { textKey: 'choice_newborn_first_haircut_2', effect: { statChanges: { eq: -3, happiness: -2 }, logKey: 'log_newborn_first_haircut_2' } },
            { textKey: 'choice_newborn_first_haircut_3', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_first_haircut_3' } },
        ]
    },
    {
        id: 'newborn_learning_to_talk',
        titleKey: 'event_newborn_learning_to_talk_title',
        descriptionKey: 'event_newborn_learning_to_talk_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1 && !char.completedOneTimeEvents.includes('newborn_learning_to_talk'),
        choices: [
            { textKey: 'choice_newborn_learning_to_talk_1', effect: { statChanges: { iq: 3, happiness: 3 }, logKey: 'log_newborn_learning_to_talk_1' } },
            { textKey: 'choice_newborn_learning_to_talk_2', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_learning_to_talk_2' } },
            { textKey: 'choice_newborn_learning_to_talk_3', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_newborn_learning_to_talk_3' } },
        ]
    },
    {
        id: 'newborn_bedtime_story',
        titleKey: 'event_newborn_bedtime_story_title',
        descriptionKey: 'event_newborn_bedtime_story_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_bedtime_story_1', effect: { statChanges: { iq: 2, happiness: 3 }, logKey: 'log_newborn_bedtime_story_1' } },
            { textKey: 'choice_newborn_bedtime_story_2', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_bedtime_story_2' } },
            { textKey: 'choice_newborn_bedtime_story_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_newborn_bedtime_story_3' } },
        ]
    },
    {
        id: 'newborn_first_dentist_visit',
        titleKey: 'event_newborn_first_dentist_visit_title',
        descriptionKey: 'event_newborn_first_dentist_visit_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2 && !char.completedOneTimeEvents.includes('newborn_first_dentist_visit'),
        choices: [
            { textKey: 'choice_newborn_first_dentist_visit_1', effect: { statChanges: { health: 3, eq: 2 }, logKey: 'log_newborn_first_dentist_visit_1' } },
            { textKey: 'choice_newborn_first_dentist_visit_2', effect: { statChanges: { health: 2, eq: -2 }, logKey: 'log_newborn_first_dentist_visit_2' } },
            { textKey: 'choice_newborn_first_dentist_visit_3', effect: { statChanges: { health: 4, happiness: 4 }, logKey: 'log_newborn_first_dentist_visit_3' } },
        ]
    },
    {
        id: 'newborn_friend_birthday',
        titleKey: 'event_newborn_friend_birthday_title',
        descriptionKey: 'event_newborn_friend_birthday_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_friend_birthday_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_friend_birthday_1' } },
            { textKey: 'choice_newborn_friend_birthday_2', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_newborn_friend_birthday_2' } },
            { textKey: 'choice_newborn_friend_birthday_3', effect: { statChanges: { happiness: 2, eq: 2 }, logKey: 'log_newborn_friend_birthday_3' } },
        ]
    },
    {
        id: 'newborn_first_swim',
        titleKey: 'event_newborn_first_swim_title',
        descriptionKey: 'event_newborn_first_swim_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1 && !char.completedOneTimeEvents.includes('newborn_first_swim'),
        choices: [
            { textKey: 'choice_newborn_first_swim_1', effect: { statChanges: { health: 3, happiness: 3 }, logKey: 'log_newborn_first_swim_1' } },
            { textKey: 'choice_newborn_first_swim_2', effect: { statChanges: { health: 2, eq: -3 }, logKey: 'log_newborn_first_swim_2' } },
            { textKey: 'choice_newborn_first_swim_3', effect: { statChanges: { health: 2, eq: 2 }, logKey: 'log_newborn_first_swim_3' } },
        ]
    },
    {
        id: 'newborn_mild_allergy',
        titleKey: 'event_newborn_mild_allergy_title',
        descriptionKey: 'event_newborn_mild_allergy_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 1,
        choices: [
            { textKey: 'choice_newborn_mild_allergy_1', effect: { statChanges: { health: -2 }, logKey: 'log_newborn_mild_allergy_1' } },
            { textKey: 'choice_newborn_mild_allergy_2', effect: { statChanges: { health: 4 }, logKey: 'log_newborn_mild_allergy_2' } },
            { textKey: 'choice_newborn_mild_allergy_3', effect: { statChanges: { health: -3 }, logKey: 'log_newborn_mild_allergy_3' } },
        ]
    },
    {
        id: 'newborn_potty_training',
        titleKey: 'event_newborn_potty_training_title',
        descriptionKey: 'event_newborn_potty_training_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2 && !char.completedOneTimeEvents.includes('newborn_potty_training'),
        choices: [
            { textKey: 'choice_newborn_potty_training_1', effect: { statChanges: { happiness: 3, eq: 2 }, logKey: 'log_newborn_potty_training_1' } },
            { textKey: 'choice_newborn_potty_training_2', effect: { statChanges: { happiness: -2, eq: -2 }, logKey: 'log_newborn_potty_training_2' } },
            { textKey: 'choice_newborn_potty_training_3', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_potty_training_3' } },
        ]
    },
    {
        id: 'newborn_rainy_day_inside',
        titleKey: 'event_newborn_rainy_day_inside_title',
        descriptionKey: 'event_newborn_rainy_day_inside_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_rainy_day_inside_1', effect: { statChanges: { iq: 3 }, logKey: 'log_newborn_rainy_day_inside_1' } },
            { textKey: 'choice_newborn_rainy_day_inside_2', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_newborn_rainy_day_inside_2' } },
            { textKey: 'choice_newborn_rainy_day_inside_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_rainy_day_inside_3' } },
        ]
    },
    {
        id: 'newborn_sharing_food',
        titleKey: 'event_newborn_sharing_food_title',
        descriptionKey: 'event_newborn_sharing_food_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_sharing_food_1', effect: { statChanges: { happiness: 3, eq: 2 }, logKey: 'log_newborn_sharing_food_1' } },
            { textKey: 'choice_newborn_sharing_food_2', effect: { statChanges: { iq: 2 }, logKey: 'log_newborn_sharing_food_2' } },
            { textKey: 'choice_newborn_sharing_food_3', effect: { statChanges: { eq: -2 }, logKey: 'log_newborn_sharing_food_3' } },
        ]
    },
    {
        id: 'newborn_scared_of_thunder',
        titleKey: 'event_newborn_scared_of_thunder_title',
        descriptionKey: 'event_newborn_scared_of_thunder_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_scared_of_thunder_1', effect: { statChanges: { eq: 2, happiness: 2 }, logKey: 'log_newborn_scared_of_thunder_1' } },
            { textKey: 'choice_newborn_scared_of_thunder_2', effect: { statChanges: { eq: -3, happiness: -3 }, logKey: 'log_newborn_scared_of_thunder_2' } },
            { textKey: 'choice_newborn_scared_of_thunder_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_scared_of_thunder_3' } },
        ]
    },
    {
        id: 'newborn_breaks_cup_title',
        titleKey: 'event_newborn_breaks_cup_title',
        descriptionKey: 'event_newborn_breaks_cup_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_breaks_cup_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_newborn_breaks_cup_1' } },
            { textKey: 'choice_newborn_breaks_cup_2', effect: { statChanges: { eq: -2 }, logKey: 'log_newborn_breaks_cup_2' } },
            { textKey: 'choice_newborn_breaks_cup_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_newborn_breaks_cup_3' } },
        ]
    },
    {
        id: 'newborn_self_dressing_title',
        titleKey: 'event_newborn_self_dressing_title',
        descriptionKey: 'event_newborn_self_dressing_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2 && !char.completedOneTimeEvents.includes('newborn_self_dressing'),
        choices: [
            { textKey: 'choice_newborn_self_dressing_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_newborn_self_dressing_1' } },
            { textKey: 'choice_newborn_self_dressing_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_newborn_self_dressing_2' } },
            { textKey: 'choice_newborn_self_dressing_3', effect: { statChanges: { iq: 4, happiness: 4 }, logKey: 'log_newborn_self_dressing_3' } },
        ]
    },
    {
        id: 'newborn_unwilling_to_go_to_class_title',
        titleKey: 'event_newborn_unwilling_to_go_to_class_title',
        descriptionKey: 'event_newborn_unwilling_to_go_to_class_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_unwilling_to_go_to_class_1', effect: { statChanges: { eq: -3, happiness: -2 }, logKey: 'log_newborn_unwilling_to_go_to_class_1' } },
            { textKey: 'choice_newborn_unwilling_to_go_to_class_2', effect: { statChanges: { eq: 2 }, logKey: 'log_newborn_unwilling_to_go_to_class_2' } },
            { textKey: 'choice_newborn_unwilling_to_go_to_class_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_unwilling_to_go_to_class_3' } },
        ]
    },
    {
        id: 'newborn_playing_in_sand_title',
        titleKey: 'event_newborn_playing_in_sand_title',
        descriptionKey: 'event_newborn_playing_in_sand_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_playing_in_sand_1', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_newborn_playing_in_sand_1' } },
            { textKey: 'choice_newborn_playing_in_sand_2', effect: { statChanges: { health: -2, happiness: -2 }, logKey: 'log_newborn_playing_in_sand_2' } },
            { textKey: 'choice_newborn_playing_in_sand_3', effect: { statChanges: { happiness: 2, iq: 2 }, logKey: 'log_newborn_playing_in_sand_3' } },
        ]
    },
    {
        id: 'newborn_drops_toy_title',
        titleKey: 'event_newborn_drops_toy_title',
        descriptionKey: 'event_newborn_drops_toy_desc',
        phases: [LifePhase.Newborn],
        choices: [
            { textKey: 'choice_newborn_drops_toy_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_newborn_drops_toy_1' } },
            { textKey: 'choice_newborn_drops_toy_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_newborn_drops_toy_2' } },
            { textKey: 'choice_newborn_drops_toy_3', effect: { statChanges: { happiness: 2, eq: 2 }, logKey: 'log_newborn_drops_toy_3' } },
        ]
    },
    {
        id: 'newborn_school_festival_title',
        titleKey: 'event_newborn_school_festival_title',
        descriptionKey: 'event_newborn_school_festival_desc',
        phases: [LifePhase.Newborn],
        condition: (state, char) => char.age >= 2,
        choices: [
            { textKey: 'choice_newborn_school_festival_1', effect: { statChanges: { happiness: 3, eq: 2 }, logKey: 'log_newborn_school_festival_1' } },
            { textKey: 'choice_newborn_school_festival_2', effect: { statChanges: { eq: -2, happiness: 2 }, logKey: 'log_newborn_school_festival_2' } },
            { textKey: 'choice_newborn_school_festival_3', effect: { statChanges: { iq: 2, happiness: 3 }, logKey: 'log_newborn_school_festival_3' } },
        ]
    }
];
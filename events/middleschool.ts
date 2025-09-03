import { GameEvent, LifePhase } from '../types';

export const MIDDLE_SCHOOL_EVENTS: GameEvent[] = [
    // 10 Main Events (with triggers)
    {
        id: 'middleschool_late_for_school',
        titleKey: 'event_middleschool_late_for_school_title',
        descriptionKey: 'event_middleschool_late_for_school_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_late_for_school_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_late_for_school_1' } },
            { textKey: 'choice_middleschool_late_for_school_2', effect: { statChanges: { confidence: 4, iq: -2 }, logKey: 'log_middleschool_late_for_school_2', triggers: [{ eventId: 'middleschool_late_slip', chance: 0.6 }] } },
            { textKey: 'choice_middleschool_late_for_school_3', effect: { statChanges: { confidence: 2 }, logKey: 'log_middleschool_late_for_school_3' } },
        ]
    },
    {
        id: 'middleschool_locker_trouble',
        titleKey: 'event_middleschool_locker_trouble_title',
        descriptionKey: 'event_middleschool_locker_trouble_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_locker_trouble_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_locker_trouble_1' } },
            { textKey: 'choice_middleschool_locker_trouble_2', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_locker_trouble_2', triggers: [{ eventId: 'middleschool_punished_for_tardiness', chance: 0.5 }] } },
            { textKey: 'choice_middleschool_locker_trouble_3', effect: { statChanges: { iq: -2 }, logKey: 'log_middleschool_locker_trouble_3' } },
        ]
    },
    {
        id: 'middleschool_science_project',
        titleKey: 'event_middleschool_science_project_title',
        descriptionKey: 'event_middleschool_science_project_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_science_project_1', effect: { statChanges: { iq: 3, confidence: 2 }, logKey: 'log_middleschool_science_project_1' } },
            { textKey: 'choice_middleschool_science_project_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_middleschool_science_project_2', triggers: [{ eventId: 'middleschool_group_ostracized', chance: 0.5 }] } },
            { textKey: 'choice_middleschool_science_project_3', effect: { statChanges: { confidence: 2, happiness: -3 }, logKey: 'log_middleschool_science_project_3' } },
        ]
    },
    {
        id: 'middleschool_pe_basketball',
        titleKey: 'event_middleschool_pe_basketball_title',
        descriptionKey: 'event_middleschool_pe_basketball_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_pe_basketball_1', effect: { statChanges: { health: 3, happiness: 2 }, logKey: 'log_middleschool_pe_basketball_1' } },
            { textKey: 'choice_middleschool_pe_basketball_2', effect: { statChanges: { health: -2 }, logKey: 'log_middleschool_pe_basketball_2', triggers: [{ eventId: 'middleschool_teacher_reprimand_pe', chance: 0.4 }] } },
            { textKey: 'choice_middleschool_pe_basketball_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_pe_basketball_3' } },
        ]
    },
    {
        id: 'middleschool_english_presentation',
        titleKey: 'event_middleschool_english_presentation_title',
        descriptionKey: 'event_middleschool_english_presentation_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_english_presentation_1', effect: { statChanges: { iq: 3, confidence: 3 }, logKey: 'log_middleschool_english_presentation_1' } },
            { textKey: 'choice_middleschool_english_presentation_2', effect: { statChanges: { confidence: -3 }, logKey: 'log_middleschool_english_presentation_2', triggers: [{ eventId: 'middleschool_teacher_reprimand_presentation', chance: 0.6 }] } },
            { textKey: 'choice_middleschool_english_presentation_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_english_presentation_3' } },
        ]
    },
    {
        id: 'middleschool_student_council',
        titleKey: 'event_middleschool_student_council_title',
        descriptionKey: 'event_middleschool_student_council_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_student_council_1', effect: { statChanges: { confidence: 3 }, logKey: 'log_middleschool_student_council_1' } },
            { textKey: 'choice_middleschool_student_council_2', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_student_council_2', triggers: [{ eventId: 'middleschool_teased_by_friends_council', chance: 0.5 }] } },
            { textKey: 'choice_middleschool_student_council_3', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_student_council_3' } },
        ]
    },
    {
        id: 'middleschool_cafeteria_lunch',
        titleKey: 'event_middleschool_cafeteria_lunch_title',
        descriptionKey: 'event_middleschool_cafeteria_lunch_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_cafeteria_lunch_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_cafeteria_lunch_1' } },
            { textKey: 'choice_middleschool_cafeteria_lunch_2', effect: { statChanges: { happiness: 2, confidence: -4 }, logKey: 'log_middleschool_cafeteria_lunch_2', triggers: [{ eventId: 'middleschool_teased_by_friends_crush', chance: 0.6 }] } },
            { textKey: 'choice_middleschool_cafeteria_lunch_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_cafeteria_lunch_3' } },
        ]
    },
    {
        id: 'middleschool_school_dance',
        titleKey: 'event_middleschool_school_dance_title',
        descriptionKey: 'event_middleschool_school_dance_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_school_dance_1', effect: { statChanges: { confidence: 3, happiness: 3 }, logKey: 'log_middleschool_school_dance_1' } },
            { textKey: 'choice_middleschool_school_dance_2', effect: { statChanges: { confidence: -3 }, logKey: 'log_middleschool_school_dance_2', triggers: [{ eventId: 'middleschool_dragged_to_dance', chance: 0.7 }] } },
            { textKey: 'choice_middleschool_school_dance_3', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_school_dance_3' } },
        ]
    },
    {
        id: 'middleschool_science_experiment',
        titleKey: 'event_middleschool_science_experiment_title',
        descriptionKey: 'event_middleschool_science_experiment_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_science_experiment_1', effect: { statChanges: { iq: 3, confidence: 2 }, logKey: 'log_middleschool_science_experiment_1' } },
            { textKey: 'choice_middleschool_science_experiment_2', effect: { statChanges: { iq: -2 }, logKey: 'log_middleschool_science_experiment_2', triggers: [{ eventId: 'middleschool_minor_incident', chance: 0.5 }] } },
            { textKey: 'choice_middleschool_science_experiment_3', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_science_experiment_3' } },
        ]
    },
    {
        id: 'middleschool_pop_quiz',
        titleKey: 'event_middleschool_pop_quiz_title',
        descriptionKey: 'event_middleschool_pop_quiz_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_pop_quiz_1', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_pop_quiz_1' } },
            { textKey: 'choice_middleschool_pop_quiz_2', effect: { statChanges: { iq: -2, confidence: -2 }, logKey: 'log_middleschool_pop_quiz_2', triggers: [{ eventId: 'middleschool_invigilator_warning_quiz', chance: 0.6 }] } },
            { textKey: 'choice_middleschool_pop_quiz_3', effect: { statChanges: { iq: -4, happiness: 2 }, logKey: 'log_middleschool_pop_quiz_3' } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'middleschool_late_slip',
        titleKey: 'event_middleschool_late_slip_title',
        descriptionKey: 'event_middleschool_late_slip_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_late_slip_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_late_slip_1' } },
            { textKey: 'choice_middleschool_late_slip_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_middleschool_late_slip_2' } },
            { textKey: 'choice_middleschool_late_slip_3', effect: { statChanges: { iq: -2 }, logKey: 'log_middleschool_late_slip_3' } },
        ]
    },
    {
        id: 'middleschool_punished_for_tardiness',
        titleKey: 'event_middleschool_punished_for_tardiness_title',
        descriptionKey: 'event_middleschool_punished_for_tardiness_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_punished_for_tardiness_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_punished_for_tardiness_1' } },
            { textKey: 'choice_middleschool_punished_for_tardiness_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_middleschool_punished_for_tardiness_2' } },
            { textKey: 'choice_middleschool_punished_for_tardiness_3', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_punished_for_tardiness_3' } },
        ]
    },
    {
        id: 'middleschool_group_ostracized',
        titleKey: 'event_middleschool_group_ostracized_title',
        descriptionKey: 'event_middleschool_group_ostracized_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_group_ostracized_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_group_ostracized_1' } },
            { textKey: 'choice_middleschool_group_ostracized_2', effect: { statChanges: { confidence: -3, happiness: -2 }, logKey: 'log_middleschool_group_ostracized_2' } },
            { textKey: 'choice_middleschool_group_ostracized_3', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_group_ostracized_3' } },
        ]
    },
    {
        id: 'middleschool_teacher_reprimand_pe',
        titleKey: 'event_middleschool_teacher_reprimand_pe_title',
        descriptionKey: 'event_middleschool_teacher_reprimand_pe_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_teacher_reprimand_pe_1', effect: { statChanges: { health: 2 }, logKey: 'log_middleschool_teacher_reprimand_pe_1' } },
            { textKey: 'choice_middleschool_teacher_reprimand_pe_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_middleschool_teacher_reprimand_pe_2' } },
            { textKey: 'choice_middleschool_teacher_reprimand_pe_3', effect: { statChanges: { happiness: -4, health: -4 }, logKey: 'log_middleschool_teacher_reprimand_pe_3' } },
        ]
    },
    {
        id: 'middleschool_teacher_reprimand_presentation',
        titleKey: 'event_middleschool_teacher_reprimand_presentation_title',
        descriptionKey: 'event_middleschool_teacher_reprimand_presentation_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_teacher_reprimand_presentation_1', effect: { statChanges: { confidence: 2, iq: 2 }, logKey: 'log_middleschool_teacher_reprimand_presentation_1' } },
            { textKey: 'choice_middleschool_teacher_reprimand_presentation_2', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_teacher_reprimand_presentation_2' } },
            { textKey: 'choice_middleschool_teacher_reprimand_presentation_3', effect: { statChanges: { confidence: -3, happiness: -2 }, logKey: 'log_middleschool_teacher_reprimand_presentation_3' } },
        ]
    },
    {
        id: 'middleschool_teased_by_friends_council',
        titleKey: 'event_middleschool_teased_by_friends_council_title',
        descriptionKey: 'event_middleschool_teased_by_friends_council_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_teased_by_friends_council_1', effect: { statChanges: { happiness: 4 }, logKey: 'log_middleschool_teased_by_friends_council_1' } },
            { textKey: 'choice_middleschool_teased_by_friends_council_2', effect: { statChanges: { confidence: 2, happiness: -2 }, logKey: 'log_middleschool_teased_by_friends_council_2' } },
            { textKey: 'choice_middleschool_teased_by_friends_council_3', effect: { statChanges: { happiness: -3 }, logKey: 'log_middleschool_teased_by_friends_council_3' } },
        ]
    },
    {
        id: 'middleschool_teased_by_friends_crush',
        titleKey: 'event_middleschool_teased_by_friends_crush_title',
        descriptionKey: 'event_middleschool_teased_by_friends_crush_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_teased_by_friends_crush_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_teased_by_friends_crush_1' } },
            { textKey: 'choice_middleschool_teased_by_friends_crush_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_teased_by_friends_crush_2' } },
            { textKey: 'choice_middleschool_teased_by_friends_crush_3', effect: { statChanges: { confidence: -3, happiness: -2 }, logKey: 'log_middleschool_teased_by_friends_crush_3' } },
        ]
    },
    {
        id: 'middleschool_dragged_to_dance',
        titleKey: 'event_middleschool_dragged_to_dance_title',
        descriptionKey: 'event_middleschool_dragged_to_dance_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_dragged_to_dance_1', effect: { statChanges: { happiness: 3, confidence: 2 }, logKey: 'log_middleschool_dragged_to_dance_1' } },
            { textKey: 'choice_middleschool_dragged_to_dance_2', effect: { statChanges: { confidence: -4 }, logKey: 'log_middleschool_dragged_to_dance_2' } },
            { textKey: 'choice_middleschool_dragged_to_dance_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_dragged_to_dance_3' } },
        ]
    },
    {
        id: 'middleschool_minor_incident',
        titleKey: 'event_middleschool_minor_incident_title',
        descriptionKey: 'event_middleschool_minor_incident_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_minor_incident_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_minor_incident_1' } },
            { textKey: 'choice_middleschool_minor_incident_2', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_minor_incident_2' } },
            { textKey: 'choice_middleschool_minor_incident_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_minor_incident_3' } },
        ]
    },
    {
        id: 'middleschool_invigilator_warning_quiz',
        titleKey: 'event_middleschool_invigilator_warning_quiz_title',
        descriptionKey: 'event_middleschool_invigilator_warning_quiz_desc',
        phases: [LifePhase.MiddleSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_middleschool_invigilator_warning_quiz_1', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_invigilator_warning_quiz_1' } },
            { textKey: 'choice_middleschool_invigilator_warning_quiz_2', effect: { statChanges: { confidence: 2, iq: -3 }, logKey: 'log_middleschool_invigilator_warning_quiz_2' } },
            { textKey: 'choice_middleschool_invigilator_warning_quiz_3', effect: { statChanges: { iq: -3, happiness: -3 }, logKey: 'log_middleschool_invigilator_warning_quiz_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'middleschool_class_debate',
        titleKey: 'event_middleschool_class_debate_title',
        descriptionKey: 'event_middleschool_class_debate_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_class_debate_1', effect: { statChanges: { iq: 2, confidence: 2 }, logKey: 'log_middleschool_class_debate_1' } },
            { textKey: 'choice_middleschool_class_debate_2', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_class_debate_2' } },
            { textKey: 'choice_middleschool_class_debate_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_class_debate_3' } },
        ]
    },
    {
        id: 'middleschool_after_school_sports',
        titleKey: 'event_middleschool_after_school_sports_title',
        descriptionKey: 'event_middleschool_after_school_sports_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_after_school_sports_1', effect: { statChanges: { health: 3 }, logKey: 'log_middleschool_after_school_sports_1' } },
            { textKey: 'choice_middleschool_after_school_sports_2', effect: { statChanges: { health: 2, happiness: 2 }, logKey: 'log_middleschool_after_school_sports_2' } },
            { textKey: 'choice_middleschool_after_school_sports_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_after_school_sports_3' } },
        ]
    },
    {
        id: 'middleschool_bookstore_trip',
        titleKey: 'event_middleschool_bookstore_trip_title',
        descriptionKey: 'event_middleschool_bookstore_trip_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_bookstore_trip_1', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_bookstore_trip_1' } },
            { textKey: 'choice_middleschool_bookstore_trip_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_bookstore_trip_2' } },
            { textKey: 'choice_middleschool_bookstore_trip_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_bookstore_trip_3' } },
        ]
    },
    {
        id: 'middleschool_doing_homework',
        titleKey: 'event_middleschool_doing_homework_title',
        descriptionKey: 'event_middleschool_doing_homework_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_doing_homework_1', effect: { statChanges: { iq: 3 }, logKey: 'log_middleschool_doing_homework_1' } },
            { textKey: 'choice_middleschool_doing_homework_2', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_doing_homework_2' } },
            { textKey: 'choice_middleschool_doing_homework_3', effect: { statChanges: { iq: -2, happiness: -2 }, logKey: 'log_middleschool_doing_homework_3' } },
        ]
    },
    {
        id: 'middleschool_teacher_praise',
        titleKey: 'event_middleschool_teacher_praise_title',
        descriptionKey: 'event_middleschool_teacher_praise_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_teacher_praise_1', effect: { statChanges: { confidence: 3, happiness: 3 }, logKey: 'log_middleschool_teacher_praise_1' } },
            { textKey: 'choice_middleschool_teacher_praise_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_teacher_praise_2' } },
            { textKey: 'choice_middleschool_teacher_praise_3', effect: { statChanges: { confidence: 2 }, logKey: 'log_middleschool_teacher_praise_3' } },
        ]
    },
    {
        id: 'middleschool_teacher_criticism',
        titleKey: 'event_middleschool_teacher_criticism_title',
        descriptionKey: 'event_middleschool_teacher_criticism_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_teacher_criticism_1', effect: { statChanges: { confidence: -3 }, logKey: 'log_middleschool_teacher_criticism_1' } },
            { textKey: 'choice_middleschool_teacher_criticism_2', effect: { statChanges: { confidence: 2, happiness: -2 }, logKey: 'log_middleschool_teacher_criticism_2' } },
            { textKey: 'choice_middleschool_teacher_criticism_3', effect: { statChanges: { happiness: -3 }, logKey: 'log_middleschool_teacher_criticism_3' } },
        ]
    },
    {
        id: 'middleschool_extracurricular_activity',
        titleKey: 'event_middleschool_extracurricular_activity_title',
        descriptionKey: 'event_middleschool_extracurricular_activity_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_extracurricular_activity_1', effect: { statChanges: { confidence: 3, happiness: 2 }, logKey: 'log_middleschool_extracurricular_activity_1' } },
            { textKey: 'choice_middleschool_extracurricular_activity_2', effect: { statChanges: { confidence: 2 }, logKey: 'log_middleschool_extracurricular_activity_2' } },
            { textKey: 'choice_middleschool_extracurricular_activity_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_middleschool_extracurricular_activity_3' } },
        ]
    },
    {
        id: 'middleschool_class_picnic',
        titleKey: 'event_middleschool_class_picnic_title',
        descriptionKey: 'event_middleschool_class_picnic_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_class_picnic_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_class_picnic_1' } },
            { textKey: 'choice_middleschool_class_picnic_2', effect: { statChanges: { happiness: -4 }, logKey: 'log_middleschool_class_picnic_2' } },
            { textKey: 'choice_middleschool_class_picnic_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_class_picnic_3' } },
        ]
    },
    {
        id: 'middleschool_helping_a_friend',
        titleKey: 'event_middleschool_helping_a_friend_title',
        descriptionKey: 'event_middleschool_helping_a_friend_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_helping_a_friend_1', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_middleschool_helping_a_friend_1' } },
            { textKey: 'choice_middleschool_helping_a_friend_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_helping_a_friend_2' } },
            { textKey: 'choice_middleschool_helping_a_friend_3', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_helping_a_friend_3' } },
        ]
    },
    {
        id: 'middleschool_final_exam_day',
        titleKey: 'event_middleschool_final_exam_day_title',
        descriptionKey: 'event_middleschool_final_exam_day_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_final_exam_day_1', effect: { statChanges: { iq: 3 }, logKey: 'log_middleschool_final_exam_day_1' } },
            { textKey: 'choice_middleschool_final_exam_day_2', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_final_exam_day_2' } },
            { textKey: 'choice_middleschool_final_exam_day_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_final_exam_day_3' } },
        ]
    },
    {
        id: 'middleschool_class_meeting',
        titleKey: 'event_middleschool_class_meeting_title',
        descriptionKey: 'event_middleschool_class_meeting_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_class_meeting_1', effect: { statChanges: { confidence: 2 }, logKey: 'log_middleschool_class_meeting_1' } },
            { textKey: 'choice_middleschool_class_meeting_2', effect: { statChanges: { iq: 2 }, logKey: 'log_middleschool_class_meeting_2' } },
            { textKey: 'choice_middleschool_class_meeting_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_class_meeting_3' } },
        ]
    },
    {
        id: 'middleschool_meeting_teacher_outside',
        titleKey: 'event_middleschool_meeting_teacher_outside_title',
        descriptionKey: 'event_middleschool_meeting_teacher_outside_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_meeting_teacher_outside_1', effect: { statChanges: { confidence: 2 }, logKey: 'log_middleschool_meeting_teacher_outside_1' } },
            { textKey: 'choice_middleschool_meeting_teacher_outside_2', effect: { statChanges: { happiness: -4 }, logKey: 'log_middleschool_meeting_teacher_outside_2' } },
            { textKey: 'choice_middleschool_meeting_teacher_outside_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_meeting_teacher_outside_3' } },
        ]
    },
    {
        id: 'middleschool_new_student',
        titleKey: 'event_middleschool_new_student_title',
        descriptionKey: 'event_middleschool_new_student_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_new_student_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_new_student_1' } },
            { textKey: 'choice_middleschool_new_student_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_new_student_2' } },
            { textKey: 'choice_middleschool_new_student_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_new_student_3' } },
        ]
    },
    {
        id: 'middleschool_online_gaming',
        titleKey: 'event_middleschool_online_gaming_title',
        descriptionKey: 'event_middleschool_online_gaming_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_online_gaming_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_online_gaming_1' } },
            { textKey: 'choice_middleschool_online_gaming_2', effect: { statChanges: { happiness: -2, health: -2, iq: -2 }, logKey: 'log_middleschool_online_gaming_2' } },
            { textKey: 'choice_middleschool_online_gaming_3', effect: { logKey: 'log_middleschool_online_gaming_3' } },
        ]
    },
    {
        id: 'middleschool_sports_festival',
        titleKey: 'event_middleschool_sports_festival_title',
        descriptionKey: 'event_middleschool_sports_festival_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_sports_festival_1', effect: { statChanges: { health: 3 }, logKey: 'log_middleschool_sports_festival_1' } },
            { textKey: 'choice_middleschool_sports_festival_2', effect: { statChanges: { health: 2 }, logKey: 'log_middleschool_sports_festival_2' } },
            { textKey: 'choice_middleschool_sports_festival_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_sports_festival_3' } },
        ]
    },
    {
        id: 'middleschool_chemistry_experiment',
        titleKey: 'event_middleschool_chemistry_experiment_title',
        descriptionKey: 'event_middleschool_chemistry_experiment_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_chemistry_experiment_1', effect: { statChanges: { iq: 3 }, logKey: 'log_middleschool_chemistry_experiment_1' } },
            { textKey: 'choice_middleschool_chemistry_experiment_2', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_middleschool_chemistry_experiment_2' } },
            { textKey: 'choice_middleschool_chemistry_experiment_3', effect: { statChanges: { iq: 4 }, logKey: 'log_middleschool_chemistry_experiment_3' } },
        ]
    },
    {
        id: 'middleschool_foreign_visitor',
        titleKey: 'event_middleschool_foreign_visitor_title',
        descriptionKey: 'event_middleschool_foreign_visitor_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_foreign_visitor_1', effect: { statChanges: { confidence: 3, iq: 2 }, logKey: 'log_middleschool_foreign_visitor_1' } },
            { textKey: 'choice_middleschool_foreign_visitor_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_foreign_visitor_2' } },
            { textKey: 'choice_middleschool_foreign_visitor_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_foreign_visitor_3' } },
        ]
    },
    {
        id: 'middleschool_art_class',
        titleKey: 'event_middleschool_art_class_title',
        descriptionKey: 'event_middleschool_art_class_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_art_class_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_art_class_1' } },
            { textKey: 'choice_middleschool_art_class_2', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_middleschool_art_class_2' } },
            { textKey: 'choice_middleschool_art_class_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_middleschool_art_class_3' } },
        ]
    },
    {
        id: 'middleschool_exam_results',
        titleKey: 'event_middleschool_exam_results_title',
        descriptionKey: 'event_middleschool_exam_results_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_exam_results_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_exam_results_1' } },
            { textKey: 'choice_middleschool_exam_results_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_exam_results_2' } },
            { textKey: 'choice_middleschool_exam_results_3', effect: { statChanges: { happiness: -3, confidence: -2 }, logKey: 'log_middleschool_exam_results_3' } },
        ]
    },
    {
        id: 'middleschool_sharing_lunch',
        titleKey: 'event_middleschool_sharing_lunch_title',
        descriptionKey: 'event_middleschool_sharing_lunch_desc',
        phases: [LifePhase.MiddleSchool],
        choices: [
            { textKey: 'choice_middleschool_sharing_lunch_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_middleschool_sharing_lunch_1' } },
            { textKey: 'choice_middleschool_sharing_lunch_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_middleschool_sharing_lunch_2' } },
            { textKey: 'choice_middleschool_sharing_lunch_3', effect: { statChanges: { confidence: -2 }, logKey: 'log_middleschool_sharing_lunch_3' } },
        ]
    },
];
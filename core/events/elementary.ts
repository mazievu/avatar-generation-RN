import { GameEvent, LifePhase } from '../types';

export const ELEMENTARY_SCHOOL_EVENTS: GameEvent[] = [
    // 10 Main Events (with triggers)
    {
        id: 'elementary_first_day',
        titleKey: 'event_elementary_first_day_title',
        descriptionKey: 'event_elementary_first_day_desc',
        phases: [LifePhase.Elementary],
        condition: (state, char) => char.age === 6,
        choices: [
            { textKey: 'choice_elementary_first_day_1', effect: { statChanges: { iq: 2, eq: 4, happiness: -3 }, logKey: 'log_elementary_first_day_1' } },
            { textKey: 'choice_elementary_first_day_2', effect: { statChanges: { happiness: 3, eq: -4 }, logKey: 'log_elementary_first_day_2', triggers: [{ eventId: 'elementary_teacher_reprimand_opening', chance: 0.4 }] } },
            { textKey: 'choice_elementary_first_day_3', effect: { statChanges: { iq: 4, happiness: 2 }, logKey: 'log_elementary_first_day_3' } },
        ]
    },
    {
        id: 'elementary_forgot_notebook',
        titleKey: 'event_elementary_forgot_notebook_title',
        descriptionKey: 'event_elementary_forgot_notebook_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_forgot_notebook_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_forgot_notebook_1' } },
            { textKey: 'choice_elementary_forgot_notebook_2', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_forgot_notebook_2' } },
            { textKey: 'choice_elementary_forgot_notebook_3', effect: { statChanges: { iq: -2 }, logKey: 'log_elementary_forgot_notebook_3', triggers: [{ eventId: 'elementary_teacher_punishment_notebook', chance: 0.5 }] } },
        ]
    },
    {
        id: 'elementary_math_test',
        titleKey: 'event_elementary_math_test_title',
        descriptionKey: 'event_elementary_math_test_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_math_test_1', effect: { statChanges: { iq: 3 }, logKey: 'log_elementary_math_test_1' } },
            { textKey: 'choice_elementary_math_test_2', effect: { statChanges: { iq: -3, eq: -2 }, logKey: 'log_elementary_math_test_2', triggers: [{ eventId: 'elementary_invigilator_warning', chance: 0.6 }] } },
            { textKey: 'choice_elementary_math_test_3', effect: { statChanges: { happiness: 2, eq: -2 }, logKey: 'log_elementary_math_test_3' } },
        ]
    },
    {
        id: 'elementary_fire_alarm',
        titleKey: 'event_elementary_fire_alarm_title',
        descriptionKey: 'event_elementary_fire_alarm_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_fire_alarm_1', effect: { statChanges: { health: 2, eq: 2 }, logKey: 'log_elementary_fire_alarm_1' } },
            { textKey: 'choice_elementary_fire_alarm_2', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_fire_alarm_2', triggers: [{ eventId: 'elementary_lost_from_class', chance: 0.5 }] } },
            { textKey: 'choice_elementary_fire_alarm_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_fire_alarm_3' } },
        ]
    },
    {
        id: 'elementary_oral_exam',
        titleKey: 'event_elementary_oral_exam_title',
        descriptionKey: 'event_elementary_oral_exam_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_oral_exam_1', effect: { statChanges: { iq: 3, eq: 3 }, logKey: 'log_elementary_oral_exam_1' } },
            { textKey: 'choice_elementary_oral_exam_2', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_oral_exam_2', triggers: [{ eventId: 'elementary_punishment_writing', chance: 0.4 }] } },
            { textKey: 'choice_elementary_oral_exam_3', effect: { statChanges: { iq: -2, eq: -2 }, logKey: 'log_elementary_oral_exam_3' } },
        ]
    },
    {
        id: 'elementary_pe_class',
        titleKey: 'event_elementary_pe_class_title',
        descriptionKey: 'event_elementary_pe_class_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_pe_class_1', effect: { statChanges: { health: 3 }, logKey: 'log_elementary_pe_class_1' } },
            { textKey: 'choice_elementary_pe_class_2', effect: { statChanges: { health: -4, happiness: -2 }, logKey: 'log_elementary_pe_class_2', triggers: [{ eventId: 'elementary_teased_by_friends', chance: 0.5 }] } },
            { textKey: 'choice_elementary_pe_class_3', effect: { statChanges: { health: 2, happiness: 2 }, logKey: 'log_elementary_pe_class_3' } },
        ]
    },
    {
        id: 'elementary_recess',
        titleKey: 'event_elementary_recess_title',
        descriptionKey: 'event_elementary_recess_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_recess_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_elementary_recess_1' } },
            { textKey: 'choice_elementary_recess_2', effect: { statChanges: { happiness: -3, eq: -2 }, logKey: 'log_elementary_recess_2', triggers: [{ eventId: 'elementary_called_to_office', chance: 0.6 }] } },
            { textKey: 'choice_elementary_recess_3', effect: { statChanges: { iq: 4, happiness: 4 }, logKey: 'log_elementary_recess_3' } },
        ]
    },
    {
        id: 'elementary_lunchtime',
        titleKey: 'event_elementary_lunchtime_title',
        descriptionKey: 'event_elementary_lunchtime_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_lunchtime_1', effect: { statChanges: { health: 2 }, logKey: 'log_elementary_lunchtime_1' } },
            { textKey: 'choice_elementary_lunchtime_2', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_lunchtime_2', triggers: [{ eventId: 'elementary_clean_up_mess', chance: 0.7 }] } },
            { textKey: 'choice_elementary_lunchtime_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_lunchtime_3' } },
        ]
    },
    {
        id: 'elementary_performance_prep',
        titleKey: 'event_elementary_performance_prep_title',
        descriptionKey: 'event_elementary_performance_prep_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_performance_prep_1', effect: { statChanges: { iq: 2, happiness: 2, eq: 2 }, logKey: 'log_elementary_performance_prep_1' } },
            { textKey: 'choice_elementary_performance_prep_2', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_performance_prep_2', triggers: [{ eventId: 'elementary_role_replaced', chance: 0.5 }] } },
            { textKey: 'choice_elementary_performance_prep_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_elementary_performance_prep_3' } },
        ]
    },
    {
        id: 'elementary_homework',
        titleKey: 'event_elementary_homework_title',
        descriptionKey: 'event_elementary_homework_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_homework_1', effect: { statChanges: { iq: 2 }, logKey: 'log_elementary_homework_1' } },
            { textKey: 'choice_elementary_homework_2', effect: { statChanges: { iq: -2, happiness: -2 }, logKey: 'log_elementary_homework_2', triggers: [{ eventId: 'elementary_teacher_reprimand_homework', chance: 0.6 }] } },
            { textKey: 'choice_elementary_homework_3', effect: { statChanges: { iq: -4 }, logKey: 'log_elementary_homework_3' } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'elementary_teacher_reprimand_opening',
        titleKey: 'event_elementary_teacher_reprimand_opening_title',
        descriptionKey: 'event_elementary_teacher_reprimand_opening_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_teacher_reprimand_opening_1', effect: { statChanges: { eq: -4 }, logKey: 'log_elementary_teacher_reprimand_opening_1' } },
            { textKey: 'choice_elementary_teacher_reprimand_opening_2', effect: { statChanges: { eq: -2, iq: 4 }, logKey: 'log_elementary_teacher_reprimand_opening_2' } },
            { textKey: 'choice_elementary_teacher_reprimand_opening_3', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_teacher_reprimand_opening_3' } },
        ]
    },
    {
        id: 'elementary_teacher_punishment_notebook',
        titleKey: 'event_elementary_teacher_punishment_notebook_title',
        descriptionKey: 'event_elementary_teacher_punishment_notebook_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_teacher_punishment_notebook_1', effect: { statChanges: { happiness: -2 }, logKey: 'log_elementary_teacher_punishment_notebook_1' } },
            { textKey: 'choice_elementary_teacher_punishment_notebook_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_elementary_teacher_punishment_notebook_2' } },
            { textKey: 'choice_elementary_teacher_punishment_notebook_3', effect: { statChanges: { iq: -4, happiness: -2 }, logKey: 'log_elementary_teacher_punishment_notebook_3' } },
        ]
    },
    {
        id: 'elementary_invigilator_warning',
        titleKey: 'event_elementary_invigilator_warning_title',
        descriptionKey: 'event_elementary_invigilator_warning_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_invigilator_warning_1', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_invigilator_warning_1' } },
            { textKey: 'choice_elementary_invigilator_warning_2', effect: { statChanges: { eq: -4 }, logKey: 'log_elementary_invigilator_warning_2' } },
            { textKey: 'choice_elementary_invigilator_warning_3', effect: { statChanges: { eq: -3, happiness: -3 }, logKey: 'log_elementary_invigilator_warning_3' } },
        ]
    },
    {
        id: 'elementary_lost_from_class',
        titleKey: 'event_elementary_lost_from_class_title',
        descriptionKey: 'event_elementary_lost_from_class_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_lost_from_class_1', effect: { statChanges: { eq: 2 }, logKey: 'log_elementary_lost_from_class_1' } },
            { textKey: 'choice_elementary_lost_from_class_2', effect: { statChanges: { happiness: 4 }, logKey: 'log_elementary_lost_from_class_2' } },
            { textKey: 'choice_elementary_lost_from_class_3', effect: { statChanges: { happiness: -3 }, logKey: 'log_elementary_lost_from_class_3' } },
        ]
    },
    {
        id: 'elementary_punishment_writing',
        titleKey: 'event_elementary_punishment_writing_title',
        descriptionKey: 'event_elementary_punishment_writing_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_punishment_writing_1', effect: { statChanges: { iq: 2, happiness: -4 }, logKey: 'log_elementary_punishment_writing_1' } },
            { textKey: 'choice_elementary_punishment_writing_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_elementary_punishment_writing_2' } },
            { textKey: 'choice_elementary_punishment_writing_3', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_punishment_writing_3' } },
        ]
    },
    {
        id: 'elementary_teased_by_friends',
        titleKey: 'event_elementary_teased_by_friends_title',
        descriptionKey: 'event_elementary_teased_by_friends_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_teased_by_friends_1', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_teased_by_friends_1' } },
            { textKey: 'choice_elementary_teased_by_friends_2', effect: { statChanges: { eq: 2, happiness: -4 }, logKey: 'log_elementary_teased_by_friends_2' } },
            { textKey: 'choice_elementary_teased_by_friends_3', effect: { statChanges: { health: 2 }, logKey: 'log_elementary_teased_by_friends_3' } },
        ]
    },
    {
        id: 'elementary_called_to_office',
        titleKey: 'event_elementary_called_to_office_title',
        descriptionKey: 'event_elementary_called_to_office_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_called_to_office_1', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_called_to_office_1' } },
            { textKey: 'choice_elementary_called_to_office_2', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_elementary_called_to_office_2' } },
            { textKey: 'choice_elementary_called_to_office_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_called_to_office_3' } },
        ]
    },
    {
        id: 'elementary_clean_up_mess',
        titleKey: 'event_elementary_clean_up_mess_title',
        descriptionKey: 'event_elementary_clean_up_mess_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_clean_up_mess_1', effect: { statChanges: { eq: 2 }, logKey: 'log_elementary_clean_up_mess_1' } },
            { textKey: 'choice_elementary_clean_up_mess_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_elementary_clean_up_mess_2' } },
            { textKey: 'choice_elementary_clean_up_mess_3', effect: { statChanges: { iq: 4, happiness: 4 }, logKey: 'log_elementary_clean_up_mess_3' } },
        ]
    },
    {
        id: 'elementary_role_replaced',
        titleKey: 'event_elementary_role_replaced_title',
        descriptionKey: 'event_elementary_role_replaced_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_role_replaced_1', effect: { statChanges: { eq: 4 }, logKey: 'log_elementary_role_replaced_1' } },
            { textKey: 'choice_elementary_role_replaced_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_elementary_role_replaced_2' } },
            { textKey: 'choice_elementary_role_replaced_3', effect: { statChanges: { eq: 3, happiness: 2 }, logKey: 'log_elementary_role_replaced_3' } },
        ]
    },
    {
        id: 'elementary_teacher_reprimand_homework',
        titleKey: 'event_elementary_teacher_reprimand_homework_title',
        descriptionKey: 'event_elementary_teacher_reprimand_homework_desc',
        phases: [LifePhase.Elementary],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_elementary_teacher_reprimand_homework_1', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_teacher_reprimand_homework_1' } },
            { textKey: 'choice_elementary_teacher_reprimand_homework_2', effect: { statChanges: { iq: -2 }, logKey: 'log_elementary_teacher_reprimand_homework_2' } },
            { textKey: 'choice_elementary_teacher_reprimand_homework_3', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_elementary_teacher_reprimand_homework_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'elementary_toy_dispute',
        titleKey: 'event_elementary_toy_dispute_title',
        descriptionKey: 'event_elementary_toy_dispute_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_toy_dispute_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_elementary_toy_dispute_1' } },
            { textKey: 'choice_elementary_toy_dispute_2', effect: { statChanges: { happiness: -3 }, logKey: 'log_elementary_toy_dispute_2' } },
            { textKey: 'choice_elementary_toy_dispute_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_toy_dispute_3' } },
        ]
    },
    {
        id: 'elementary_art_class',
        titleKey: 'event_elementary_art_class_title',
        descriptionKey: 'event_elementary_art_class_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_art_class_1', effect: { statChanges: { iq: 4 }, logKey: 'log_elementary_art_class_1' } },
            { textKey: 'choice_elementary_art_class_2', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_elementary_art_class_2' } },
            { textKey: 'choice_elementary_art_class_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_art_class_3' } },
        ]
    },
    {
        id: 'elementary_rainy_recess',
        titleKey: 'event_elementary_rainy_recess_title',
        descriptionKey: 'event_elementary_rainy_recess_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_rainy_recess_1', effect: { statChanges: { iq: 2, happiness: 2 }, logKey: 'log_elementary_rainy_recess_1' } },
            { textKey: 'choice_elementary_rainy_recess_2', effect: { statChanges: { health: -2, happiness: 3 }, logKey: 'log_elementary_rainy_recess_2' } },
            { textKey: 'choice_elementary_rainy_recess_3', effect: { statChanges: { iq: 2 }, logKey: 'log_elementary_rainy_recess_3' } },
        ]
    },
    {
        id: 'elementary_birthday_party',
        titleKey: 'event_elementary_birthday_party_title',
        descriptionKey: 'event_elementary_birthday_party_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_birthday_party_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_birthday_party_1' } },
            { textKey: 'choice_elementary_birthday_party_2', effect: { statChanges: { happiness: 3 }, logKey: 'log_elementary_birthday_party_2' } },
            { textKey: 'choice_elementary_birthday_party_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_elementary_birthday_party_3' } },
        ]
    },
    {
        id: 'elementary_first_speech',
        titleKey: 'event_elementary_first_speech_title',
        descriptionKey: 'event_elementary_first_speech_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_first_speech_1', effect: { statChanges: { eq: 3 }, logKey: 'log_elementary_first_speech_1' } },
            { textKey: 'choice_elementary_first_speech_2', effect: { statChanges: { eq: -3 }, logKey: 'log_elementary_first_speech_2' } },
            { textKey: 'choice_elementary_first_speech_3', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_elementary_first_speech_3' } },
        ]
    },
    {
        id: 'elementary_extracurricular_club',
        titleKey: 'event_elementary_extracurricular_club_title',
        descriptionKey: 'event_elementary_extracurricular_club_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_extracurricular_club_1', effect: { statChanges: { iq: 2, eq: 2, happiness: 2 }, logKey: 'log_elementary_extracurricular_club_1' } },
            { textKey: 'choice_elementary_extracurricular_club_2', effect: { statChanges: { happiness: -4 }, logKey: 'log_elementary_extracurricular_club_2' } },
            { textKey: 'choice_elementary_extracurricular_club_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_extracurricular_club_3' } },
        ]
    },
    {
        id: 'elementary_playing_soccer',
        titleKey: 'event_elementary_playing_soccer_title',
        descriptionKey: 'event_elementary_playing_soccer_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_playing_soccer_1', effect: { statChanges: { health: 3, happiness: 3 }, logKey: 'log_elementary_playing_soccer_1' } },
            { textKey: 'choice_elementary_playing_soccer_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_playing_soccer_2' } },
            { textKey: 'choice_elementary_playing_soccer_3', effect: { statChanges: { health: 2 }, logKey: 'log_elementary_playing_soccer_3' } },
        ]
    },
    {
        id: 'elementary_sports_day',
        titleKey: 'event_elementary_sports_day_title',
        descriptionKey: 'event_elementary_sports_day_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_sports_day_1', effect: { statChanges: { health: 3, eq: 2 }, logKey: 'log_elementary_sports_day_1' } },
            { textKey: 'choice_elementary_sports_day_2', effect: { statChanges: { health: 2, eq: 4 }, logKey: 'log_elementary_sports_day_2' } },
            { textKey: 'choice_elementary_sports_day_3', effect: { statChanges: { happiness: 3 }, logKey: 'log_elementary_sports_day_3' } },
        ]
    },
    {
        id: 'elementary_classroom_game',
        titleKey: 'event_elementary_classroom_game_title',
        descriptionKey: 'event_elementary_classroom_game_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_classroom_game_1', effect: { statChanges: { iq: 2 }, logKey: 'log_elementary_classroom_game_1' } },
            { textKey: 'choice_elementary_classroom_game_2', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_classroom_game_2' } },
            { textKey: 'choice_elementary_classroom_game_3', effect: { statChanges: { happiness: -2 }, logKey: 'log_elementary_classroom_game_3' } },
        ]
    },
    {
        id: 'elementary_museum_trip',
        titleKey: 'event_elementary_museum_trip_title',
        descriptionKey: 'event_elementary_museum_trip_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_museum_trip_1', effect: { statChanges: { iq: 3 }, logKey: 'log_elementary_museum_trip_1' } },
            { textKey: 'choice_elementary_museum_trip_2', effect: { statChanges: { iq: 4, happiness: 2 }, logKey: 'log_elementary_museum_trip_2' } },
            { textKey: 'choice_elementary_museum_trip_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_museum_trip_3' } },
        ]
    },
    {
        id: 'elementary_spelling_test',
        titleKey: 'event_elementary_spelling_test_title',
        descriptionKey: 'event_elementary_spelling_test_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_spelling_test_1', effect: { statChanges: { iq: 2 }, logKey: 'log_elementary_spelling_test_1' } },
            { textKey: 'choice_elementary_spelling_test_2', effect: { statChanges: { iq: -2, eq: -2 }, logKey: 'log_elementary_spelling_test_2' } },
            { textKey: 'choice_elementary_spelling_test_3', effect: { statChanges: { iq: 4 }, logKey: 'log_elementary_spelling_test_3' } },
        ]
    },
    {
        id: 'elementary_good_student_award',
        titleKey: 'event_elementary_good_student_award_title',
        descriptionKey: 'event_elementary_good_student_award_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_good_student_award_1', effect: { statChanges: { happiness: 3, eq: 3 }, logKey: 'log_elementary_good_student_award_1' } },
            { textKey: 'choice_elementary_good_student_award_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_good_student_award_2' } },
            { textKey: 'choice_elementary_good_student_award_3', effect: { statChanges: { eq: 2 }, logKey: 'log_elementary_good_student_award_3' } },
        ]
    },
    {
        id: 'elementary_singing_class',
        titleKey: 'event_elementary_singing_class_title',
        descriptionKey: 'event_elementary_singing_class_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_singing_class_1', effect: { statChanges: { eq: 2 }, logKey: 'log_elementary_singing_class_1' } },
            { textKey: 'choice_elementary_singing_class_2', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_singing_class_2' } },
            { textKey: 'choice_elementary_singing_class_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_elementary_singing_class_3' } },
        ]
    },
    {
        id: 'elementary_praised_by_teacher',
        titleKey: 'event_elementary_praised_by_teacher_title',
        descriptionKey: 'event_elementary_praised_by_teacher_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_praised_by_teacher_1', effect: { statChanges: { eq: -4, happiness: 3 }, logKey: 'log_elementary_praised_by_teacher_1' } },
            { textKey: 'choice_elementary_praised_by_teacher_2', effect: { statChanges: { eq: 3, happiness: 3 }, logKey: 'log_elementary_praised_by_teacher_2' } },
            { textKey: 'choice_elementary_praised_by_teacher_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_praised_by_teacher_3' } },
        ]
    },
    {
        id: 'elementary_talking_in_class',
        titleKey: 'event_elementary_talking_in_class_title',
        descriptionKey: 'event_elementary_talking_in_class_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_talking_in_class_1', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_talking_in_class_1' } },
            { textKey: 'choice_elementary_talking_in_class_2', effect: { statChanges: { eq: 2, happiness: -2 }, logKey: 'log_elementary_talking_in_class_2' } },
            { textKey: 'choice_elementary_talking_in_class_3', effect: { statChanges: { eq: -4, iq: 2 }, logKey: 'log_elementary_talking_in_class_3' } },
        ]
    },
    {
        id: 'elementary_first_bad_grade',
        titleKey: 'event_elementary_first_bad_grade_title',
        descriptionKey: 'event_elementary_first_bad_grade_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_first_bad_grade_1', effect: { statChanges: { happiness: -3, eq: -3 }, logKey: 'log_elementary_first_bad_grade_1' } },
            { textKey: 'choice_elementary_first_bad_grade_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_elementary_first_bad_grade_2' } },
            { textKey: 'choice_elementary_first_bad_grade_3', effect: { statChanges: { iq: 3, happiness: -4 }, logKey: 'log_elementary_first_bad_grade_3' } },
        ]
    },
    {
        id: 'elementary_group_work',
        titleKey: 'event_elementary_group_work_title',
        descriptionKey: 'event_elementary_group_work_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_group_work_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_elementary_group_work_1' } },
            { textKey: 'choice_elementary_group_work_2', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_group_work_2' } },
            { textKey: 'choice_elementary_group_work_3', effect: { statChanges: { iq: 4 }, logKey: 'log_elementary_group_work_3' } },
        ]
    },
    {
        id: 'elementary_found_item',
        titleKey: 'event_elementary_found_item_title',
        descriptionKey: 'event_elementary_found_item_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_found_item_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_elementary_found_item_1' } },
            { textKey: 'choice_elementary_found_item_2', effect: { statChanges: { happiness: 2, iq: 2 }, logKey: 'log_elementary_found_item_2' } },
            { textKey: 'choice_elementary_found_item_3', effect: { statChanges: { iq: -2, happiness: -2 }, fundChange: 10, logKey: 'log_elementary_found_item_3' } },
        ]
    },
    {
        id: 'elementary_class_monitor',
        titleKey: 'event_elementary_class_monitor_title',
        descriptionKey: 'event_elementary_class_monitor_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_class_monitor_1', effect: { statChanges: { eq: 3, iq: 2 }, logKey: 'log_elementary_class_monitor_1' } },
            { textKey: 'choice_elementary_class_monitor_2', effect: { statChanges: { eq: -2 }, logKey: 'log_elementary_class_monitor_2' } },
            { textKey: 'choice_elementary_class_monitor_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_elementary_class_monitor_3' } },
        ]
    },
    {
        id: 'elementary_craft_class',
        titleKey: 'event_elementary_craft_class_title',
        descriptionKey: 'event_elementary_craft_class_desc',
        phases: [LifePhase.Elementary],
        choices: [
            { textKey: 'choice_elementary_craft_class_1', effect: { statChanges: { iq: 2 }, logKey: 'log_elementary_craft_class_1' } },
            { textKey: 'choice_elementary_craft_class_2', effect: { statChanges: { iq: 4, happiness: 2 }, logKey: 'log_elementary_craft_class_2' } },
            { textKey: 'choice_elementary_craft_class_3', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_elementary_craft_class_3' } },
        ]
    },
];
import { GameEvent, LifePhase } from '../types';

export const HIGH_SCHOOL_EVENTS: GameEvent[] = [
    // 10 Main Events (with triggers)
    {
        id: 'highschool_late_for_school',
        titleKey: 'event_highschool_late_for_school_title',
        descriptionKey: 'event_highschool_late_for_school_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_late_for_school_1', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_late_for_school_1' } },
            { textKey: 'choice_highschool_late_for_school_2', effect: { statChanges: { iq: -5 }, logKey: 'log_highschool_late_for_school_2', triggers: [{ eventId: 'highschool_late_slip', chance: 0.5 }] } },
            { textKey: 'choice_highschool_late_for_school_3', effect: { statChanges: { confidence: 5 }, logKey: 'log_highschool_late_for_school_3' } },
        ]
    },
    {
        id: 'highschool_forgot_presentation_book',
        titleKey: 'event_highschool_forgot_presentation_book_title',
        descriptionKey: 'event_highschool_forgot_presentation_book_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_forgot_presentation_book_1', effect: { statChanges: { happiness: 6 }, logKey: 'log_highschool_forgot_presentation_book_1' } },
            { textKey: 'choice_highschool_forgot_presentation_book_2', effect: { statChanges: { confidence: -8 }, logKey: 'log_highschool_forgot_presentation_book_2' } },
            { textKey: 'choice_highschool_forgot_presentation_book_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_forgot_presentation_book_3', triggers: [{ eventId: 'highschool_teacher_discovers_hiding', chance: 0.6 }] } },
        ]
    },
    {
        id: 'highschool_football_practice',
        titleKey: 'event_highschool_football_practice_title',
        descriptionKey: 'event_highschool_football_practice_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_football_practice_1', effect: { statChanges: { health: 10, confidence: 5 }, logKey: 'log_highschool_football_practice_1' } },
            { textKey: 'choice_highschool_football_practice_2', effect: { statChanges: { happiness: -7 }, logKey: 'log_highschool_football_practice_2', triggers: [{ eventId: 'highschool_coach_punishment', chance: 0.7 }] } },
            { textKey: 'choice_highschool_football_practice_3', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_football_practice_3' } },
        ]
    },
    {
        id: 'highschool_college_prep_workshop',
        titleKey: 'event_highschool_college_prep_workshop_title',
        descriptionKey: 'event_highschool_college_prep_workshop_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_college_prep_workshop_1', effect: { statChanges: { iq: 8 }, logKey: 'log_highschool_college_prep_workshop_1' } },
            { textKey: 'choice_highschool_college_prep_workshop_2', effect: { statChanges: { iq: -4 }, logKey: 'log_highschool_college_prep_workshop_2', triggers: [{ eventId: 'highschool_counselor_reprimand', chance: 0.5 }] } },
            { textKey: 'choice_highschool_college_prep_workshop_3', effect: { statChanges: { happiness: 6 }, logKey: 'log_highschool_college_prep_workshop_3' } },
        ]
    },
    {
        id: 'highschool_sat_act_test',
        titleKey: 'event_highschool_sat_act_test_title',
        descriptionKey: 'event_highschool_sat_act_test_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_sat_act_test_1', effect: { statChanges: { iq: 12 }, logKey: 'log_highschool_sat_act_test_1' } },
            { textKey: 'choice_highschool_sat_act_test_2', effect: { statChanges: { confidence: -6 }, logKey: 'log_highschool_sat_act_test_2', triggers: [{ eventId: 'highschool_invigilator_warning_test', chance: 0.4 }] } },
            { textKey: 'choice_highschool_sat_act_test_3', effect: { statChanges: { iq: -8 }, logKey: 'log_highschool_sat_act_test_3' } },
        ]
    },
    {
        id: 'highschool_promposal',
        titleKey: 'event_highschool_promposal_title',
        descriptionKey: 'event_highschool_promposal_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_promposal_1', effect: { statChanges: { confidence: 8, happiness: 10 }, logKey: 'log_highschool_promposal_1' } },
            { textKey: 'choice_highschool_promposal_2', effect: { statChanges: { confidence: -10 }, logKey: 'log_highschool_promposal_2', triggers: [{ eventId: 'highschool_crush_rejects_promposal', chance: 0.5 }] } },
            { textKey: 'choice_highschool_promposal_3', effect: { statChanges: { happiness: 6 }, logKey: 'log_highschool_promposal_3' } },
        ]
    },
    {
        id: 'highschool_prom_cafeteria',
        titleKey: 'event_highschool_prom_cafeteria_title',
        descriptionKey: 'event_highschool_prom_cafeteria_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_prom_cafeteria_1', effect: { statChanges: { happiness: 4 }, logKey: 'log_highschool_prom_cafeteria_1' } },
            { textKey: 'choice_highschool_prom_cafeteria_2', effect: { statChanges: { happiness: 8, confidence: 6 }, logKey: 'log_highschool_prom_cafeteria_2', triggers: [{ eventId: 'highschool_teased_by_friends_crush', chance: 0.6 }] } },
            { textKey: 'choice_highschool_prom_cafeteria_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_prom_cafeteria_3' } },
        ]
    },
    {
        id: 'highschool_homecoming_game',
        titleKey: 'event_highschool_homecoming_game_title',
        descriptionKey: 'event_highschool_homecoming_game_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_homecoming_game_1', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_homecoming_game_1' } },
            { textKey: 'choice_highschool_homecoming_game_2', effect: { statChanges: { happiness: 5, confidence: -4 }, logKey: 'log_highschool_homecoming_game_2', triggers: [{ eventId: 'highschool_caught_skipping', chance: 0.7 }] } },
            { textKey: 'choice_highschool_homecoming_game_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_highschool_homecoming_game_3' } },
        ]
    },
    {
        id: 'highschool_class_test',
        titleKey: 'event_highschool_class_test_title',
        descriptionKey: 'event_highschool_class_test_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_class_test_1', effect: { statChanges: { iq: 8 }, logKey: 'log_highschool_class_test_1' } },
            { textKey: 'choice_highschool_class_test_2', effect: { statChanges: { iq: -6, confidence: -6 }, logKey: 'log_highschool_class_test_2', triggers: [{ eventId: 'highschool_teacher_reprimand_cheating', chance: 0.5 }] } },
            { textKey: 'choice_highschool_class_test_3', effect: { statChanges: { iq: -5 }, logKey: 'log_highschool_class_test_3' } },
        ]
    },
    {
        id: 'highschool_literature_discussion',
        titleKey: 'event_highschool_literature_discussion_title',
        descriptionKey: 'event_highschool_literature_discussion_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_literature_discussion_1', effect: { statChanges: { iq: 5, confidence: 5 }, logKey: 'log_highschool_literature_discussion_1' } },
            { textKey: 'choice_highschool_literature_discussion_2', effect: { statChanges: { iq: 4 }, logKey: 'log_highschool_literature_discussion_2' } },
            { textKey: 'choice_highschool_literature_discussion_3', effect: { statChanges: { confidence: 5, happiness: -6 }, logKey: 'log_highschool_literature_discussion_3', triggers: [{ eventId: 'highschool_argument_with_friend', chance: 0.6 }] } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'highschool_late_slip',
        titleKey: 'event_highschool_late_slip_title',
        descriptionKey: 'event_highschool_late_slip_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_late_slip_1', effect: { statChanges: { confidence: -4 }, logKey: 'log_highschool_late_slip_1' } },
            { textKey: 'choice_highschool_late_slip_2', effect: { statChanges: { happiness: -8 }, logKey: 'log_highschool_late_slip_2' } },
            { textKey: 'choice_highschool_late_slip_3', effect: { statChanges: { confidence: 4 }, logKey: 'log_highschool_late_slip_3' } },
        ]
    },
    {
        id: 'highschool_teacher_discovers_hiding',
        titleKey: 'event_highschool_teacher_discovers_hiding_title',
        descriptionKey: 'event_highschool_teacher_discovers_hiding_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_teacher_discovers_hiding_1', effect: { statChanges: { confidence: -8 }, logKey: 'log_highschool_teacher_discovers_hiding_1' } },
            { textKey: 'choice_highschool_teacher_discovers_hiding_2', effect: { statChanges: { iq: -4, confidence: 5 }, logKey: 'log_highschool_teacher_discovers_hiding_2' } },
            { textKey: 'choice_highschool_teacher_discovers_hiding_3', effect: { statChanges: { iq: -5, happiness: -8 }, logKey: 'log_highschool_teacher_discovers_hiding_3' } },
        ]
    },
    {
        id: 'highschool_coach_punishment',
        titleKey: 'event_highschool_coach_punishment_title',
        descriptionKey: 'event_highschool_coach_punishment_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_coach_punishment_1', effect: { statChanges: { health: 8, happiness: -5 }, logKey: 'log_highschool_coach_punishment_1' } },
            { textKey: 'choice_highschool_coach_punishment_2', effect: { statChanges: { happiness: -9 }, logKey: 'log_highschool_coach_punishment_2' } },
            { textKey: 'choice_highschool_coach_punishment_3', effect: { statChanges: { health: 5 }, logKey: 'log_highschool_coach_punishment_3' } },
        ]
    },
    {
        id: 'highschool_counselor_reprimand',
        titleKey: 'event_highschool_counselor_reprimand_title',
        descriptionKey: 'event_highschool_counselor_reprimand_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_counselor_reprimand_1', effect: { statChanges: { iq: 5 }, logKey: 'log_highschool_counselor_reprimand_1' } },
            { textKey: 'choice_highschool_counselor_reprimand_2', effect: { statChanges: { iq: 4 }, logKey: 'log_highschool_counselor_reprimand_2' } },
            { textKey: 'choice_highschool_counselor_reprimand_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_counselor_reprimand_3' } },
        ]
    },
    {
        id: 'highschool_invigilator_warning_test',
        titleKey: 'event_highschool_invigilator_warning_test_title',
        descriptionKey: 'event_highschool_invigilator_warning_test_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_invigilator_warning_test_1', effect: { statChanges: { confidence: -6 }, logKey: 'log_highschool_invigilator_warning_test_1' } },
            { textKey: 'choice_highschool_invigilator_warning_test_2', effect: { statChanges: { confidence: 5, iq: -8 }, logKey: 'log_highschool_invigilator_warning_test_2' } },
            { textKey: 'choice_highschool_invigilator_warning_test_3', effect: { statChanges: { iq: -5 }, logKey: 'log_highschool_invigilator_warning_test_3' } },
        ]
    },
    {
        id: 'highschool_crush_rejects_promposal',
        titleKey: 'event_highschool_crush_rejects_promposal_title',
        descriptionKey: 'event_highschool_crush_rejects_promposal_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_crush_rejects_promposal_1', effect: { statChanges: { happiness: 4 }, logKey: 'log_highschool_crush_rejects_promposal_1' } },
            { textKey: 'choice_highschool_crush_rejects_promposal_2', effect: { statChanges: { confidence: -8, happiness: -6 }, logKey: 'log_highschool_crush_rejects_promposal_2' } },
            { textKey: 'choice_highschool_crush_rejects_promposal_3', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_crush_rejects_promposal_3' } },
        ]
    },
    {
        id: 'highschool_teased_by_friends_crush',
        titleKey: 'event_highschool_teased_by_friends_crush_title',
        descriptionKey: 'event_highschool_teased_by_friends_crush_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_teased_by_friends_crush_1', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_teased_by_friends_crush_1' } },
            { textKey: 'choice_highschool_teased_by_friends_crush_2', effect: { statChanges: { confidence: -8, happiness: -5 }, logKey: 'log_highschool_teased_by_friends_crush_2' } },
            { textKey: 'choice_highschool_teased_by_friends_crush_3', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_teased_by_friends_crush_3' } },
        ]
    },
    {
        id: 'highschool_caught_skipping',
        titleKey: 'event_highschool_caught_skipping_title',
        descriptionKey: 'event_highschool_caught_skipping_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_caught_skipping_1', effect: { statChanges: { iq: -4 }, logKey: 'log_highschool_caught_skipping_1' } },
            { textKey: 'choice_highschool_caught_skipping_2', effect: { statChanges: { happiness: -9 }, logKey: 'log_highschool_caught_skipping_2' } },
            { textKey: 'choice_highschool_caught_skipping_3', effect: { statChanges: { confidence: -6 }, logKey: 'log_highschool_caught_skipping_3' } },
        ]
    },
    {
        id: 'highschool_teacher_reprimand_cheating',
        titleKey: 'event_highschool_teacher_reprimand_cheating_title',
        descriptionKey: 'event_highschool_teacher_reprimand_cheating_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_teacher_reprimand_cheating_1', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_teacher_reprimand_cheating_1' } },
            { textKey: 'choice_highschool_teacher_reprimand_cheating_2', effect: { statChanges: { iq: -6 }, logKey: 'log_highschool_teacher_reprimand_cheating_2' } },
            { textKey: 'choice_highschool_teacher_reprimand_cheating_3', effect: { statChanges: { iq: -8, happiness: -8 }, logKey: 'log_highschool_teacher_reprimand_cheating_3' } },
        ]
    },
    {
        id: 'highschool_argument_with_friend',
        titleKey: 'event_highschool_argument_with_friend_title',
        descriptionKey: 'event_highschool_argument_with_friend_desc',
        phases: [LifePhase.HighSchool],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_highschool_argument_with_friend_1', effect: { statChanges: { confidence: -4, happiness: 5 }, logKey: 'log_highschool_argument_with_friend_1' } },
            { textKey: 'choice_highschool_argument_with_friend_2', effect: { statChanges: { confidence: 5, happiness: -5 }, logKey: 'log_highschool_argument_with_friend_2' } },
            { textKey: 'choice_highschool_argument_with_friend_3', effect: { statChanges: { happiness: -9 }, logKey: 'log_highschool_argument_with_friend_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'highschool_club_activity',
        titleKey: 'event_highschool_club_activity_title',
        descriptionKey: 'event_highschool_club_activity_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_club_activity_1', effect: { statChanges: { happiness: 8, confidence: 5 }, logKey: 'log_highschool_club_activity_1' } },
            { textKey: 'choice_highschool_club_activity_2', effect: { statChanges: { iq: 5 }, logKey: 'log_highschool_club_activity_2' } },
            { textKey: 'choice_highschool_club_activity_3', effect: { statChanges: { happiness: -4 }, logKey: 'log_highschool_club_activity_3' } },
        ]
    },
    {
        id: 'highschool_playing_sports',
        titleKey: 'event_highschool_playing_sports_title',
        descriptionKey: 'event_highschool_playing_sports_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_playing_sports_1', effect: { statChanges: { health: 8 }, logKey: 'log_highschool_playing_sports_1' } },
            { textKey: 'choice_highschool_playing_sports_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_playing_sports_2' } },
            { textKey: 'choice_highschool_playing_sports_3', effect: { statChanges: { health: -4, happiness: 6 }, logKey: 'log_highschool_playing_sports_3' } },
        ]
    },
    {
        id: 'highschool_lunchtime',
        titleKey: 'event_highschool_lunchtime_title',
        descriptionKey: 'event_highschool_lunchtime_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_lunchtime_1', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_lunchtime_1' } },
            { textKey: 'choice_highschool_lunchtime_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_lunchtime_2' } },
            { textKey: 'choice_highschool_lunchtime_3', effect: { statChanges: { health: 4 }, logKey: 'log_highschool_lunchtime_3' } },
        ]
    },
    {
        id: 'highschool_surprise_oral_exam',
        titleKey: 'event_highschool_surprise_oral_exam_title',
        descriptionKey: 'event_highschool_surprise_oral_exam_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_surprise_oral_exam_1', effect: { statChanges: { iq: 8, confidence: 5 }, logKey: 'log_highschool_surprise_oral_exam_1' } },
            { textKey: 'choice_highschool_surprise_oral_exam_2', effect: { statChanges: { confidence: -8 }, logKey: 'log_highschool_surprise_oral_exam_2' } },
            { textKey: 'choice_highschool_surprise_oral_exam_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_surprise_oral_exam_3' } },
        ]
    },
    {
        id: 'highschool_library_study_group',
        titleKey: 'event_highschool_library_study_group_title',
        descriptionKey: 'event_highschool_library_study_group_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_library_study_group_1', effect: { statChanges: { iq: 8 }, logKey: 'log_highschool_library_study_group_1' } },
            { textKey: 'choice_highschool_library_study_group_2', effect: { statChanges: { iq: 4, happiness: 5 }, logKey: 'log_highschool_library_study_group_2' } },
            { textKey: 'choice_highschool_library_study_group_3', effect: { statChanges: { iq: 5 }, logKey: 'log_highschool_library_study_group_3' } },
        ]
    },
    {
        id: 'highschool_teacher_praise',
        titleKey: 'event_highschool_teacher_praise_title',
        descriptionKey: 'event_highschool_teacher_praise_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_teacher_praise_1', effect: { statChanges: { confidence: -4, happiness: 8 }, logKey: 'log_highschool_teacher_praise_1' } },
            { textKey: 'choice_highschool_teacher_praise_2', effect: { statChanges: { confidence: 8, happiness: 8 }, logKey: 'log_highschool_teacher_praise_2' } },
            { textKey: 'choice_highschool_teacher_praise_3', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_teacher_praise_3' } },
        ]
    },
    {
        id: 'highschool_teacher_criticism',
        titleKey: 'event_highschool_teacher_criticism_title',
        descriptionKey: 'event_highschool_teacher_criticism_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_teacher_criticism_1', effect: { statChanges: { confidence: -8 }, logKey: 'log_highschool_teacher_criticism_1' } },
            { textKey: 'choice_highschool_teacher_criticism_2', effect: { statChanges: { confidence: 5, happiness: -4 }, logKey: 'log_highschool_teacher_criticism_2' } },
            { textKey: 'choice_highschool_teacher_criticism_3', effect: { statChanges: { happiness: -8 }, logKey: 'log_highschool_teacher_criticism_3' } },
        ]
    },
    {
        id: 'highschool_class_trip',
        titleKey: 'event_highschool_class_trip_title',
        descriptionKey: 'event_highschool_class_trip_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_class_trip_1', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_class_trip_1' } },
            { textKey: 'choice_highschool_class_trip_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_class_trip_2' } },
            { textKey: 'choice_highschool_class_trip_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_highschool_class_trip_3' } },
        ]
    },
    {
        id: 'highschool_class_debate',
        titleKey: 'event_highschool_class_debate_title',
        descriptionKey: 'event_highschool_class_debate_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_class_debate_1', effect: { statChanges: { iq: 5, confidence: 8 }, logKey: 'log_highschool_class_debate_1' } },
            { textKey: 'choice_highschool_class_debate_2', effect: { statChanges: { iq: 4 }, logKey: 'log_highschool_class_debate_2' } },
            { textKey: 'choice_highschool_class_debate_3', effect: { statChanges: { iq: 5 }, logKey: 'log_highschool_class_debate_3' } },
        ]
    },
    {
        id: 'highschool_class_birthday_party',
        titleKey: 'event_highschool_class_birthday_party_title',
        descriptionKey: 'event_highschool_class_birthday_party_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_class_birthday_party_1', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_class_birthday_party_1' } },
            { textKey: 'choice_highschool_class_birthday_party_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_class_birthday_party_2' } },
            { textKey: 'choice_highschool_class_birthday_party_3', effect: { statChanges: { happiness: 4 }, logKey: 'log_highschool_class_birthday_party_3' } },
        ]
    },
    {
        id: 'highschool_sports_day',
        titleKey: 'event_highschool_sports_day_title',
        descriptionKey: 'event_highschool_sports_day_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_sports_day_1', effect: { statChanges: { health: 8 }, logKey: 'log_highschool_sports_day_1' } },
            { textKey: 'choice_highschool_sports_day_2', effect: { statChanges: { health: 5 }, logKey: 'log_highschool_sports_day_2' } },
            { textKey: 'choice_highschool_sports_day_3', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_sports_day_3' } },
        ]
    },
    {
        id: 'highschool_chemistry_test',
        titleKey: 'event_highschool_chemistry_test_title',
        descriptionKey: 'event_highschool_chemistry_test_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_chemistry_test_1', effect: { statChanges: { iq: 8 }, logKey: 'log_highschool_chemistry_test_1' } },
            { textKey: 'choice_highschool_chemistry_test_2', effect: { statChanges: { iq: 4 }, logKey: 'log_highschool_chemistry_test_2' } },
            { textKey: 'choice_highschool_chemistry_test_3', effect: { statChanges: { iq: -5 }, logKey: 'log_highschool_chemistry_test_3' } },
        ]
    },
    {
        id: 'highschool_meeting_teacher_outside',
        titleKey: 'event_highschool_meeting_teacher_outside_title',
        descriptionKey: 'event_highschool_meeting_teacher_outside_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_meeting_teacher_outside_1', effect: { statChanges: { confidence: 5 }, logKey: 'log_highschool_meeting_teacher_outside_1' } },
            { textKey: 'choice_highschool_meeting_teacher_outside_2', effect: { statChanges: { confidence: -4 }, logKey: 'log_highschool_meeting_teacher_outside_2' } },
            { textKey: 'choice_highschool_meeting_teacher_outside_3', effect: { statChanges: { confidence: -6 }, logKey: 'log_highschool_meeting_teacher_outside_3' } },
        ]
    },
    {
        id: 'highschool_international_visitor',
        titleKey: 'event_highschool_international_visitor_title',
        descriptionKey: 'event_highschool_international_visitor_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_international_visitor_1', effect: { statChanges: { iq: 5, confidence: 5 }, logKey: 'log_highschool_international_visitor_1' } },
            { textKey: 'choice_highschool_international_visitor_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_international_visitor_2' } },
            { textKey: 'choice_highschool_international_visitor_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_international_visitor_3' } },
        ]
    },
    {
        id: 'highschool_parent_teacher_meeting',
        titleKey: 'event_highschool_parent_teacher_meeting_title',
        descriptionKey: 'event_highschool_parent_teacher_meeting_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_parent_teacher_meeting_1', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_parent_teacher_meeting_1' } },
            { textKey: 'choice_highschool_parent_teacher_meeting_2', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_parent_teacher_meeting_2' } },
            { textKey: 'choice_highschool_parent_teacher_meeting_3', effect: { statChanges: { happiness: -4 }, logKey: 'log_highschool_parent_teacher_meeting_3' } },
        ]
    },
    {
        id: 'highschool_museum_trip',
        titleKey: 'event_highschool_museum_trip_title',
        descriptionKey: 'event_highschool_museum_trip_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_museum_trip_1', effect: { statChanges: { iq: 8 }, logKey: 'log_highschool_museum_trip_1' } },
            { textKey: 'choice_highschool_museum_trip_2', effect: { statChanges: { iq: 4 }, logKey: 'log_highschool_museum_trip_2' } },
            { textKey: 'choice_highschool_museum_trip_3', effect: { statChanges: { happiness: 6 }, logKey: 'log_highschool_museum_trip_3' } },
        ]
    },
    {
        id: 'highschool_prom_prep',
        titleKey: 'event_highschool_prom_prep_title',
        descriptionKey: 'event_highschool_prom_prep_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_prom_prep_1', effect: { statChanges: { happiness: 8 }, fundChange: -200, logKey: 'log_highschool_prom_prep_1' } },
            { textKey: 'choice_highschool_prom_prep_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_prom_prep_2' } },
            { textKey: 'choice_highschool_prom_prep_3', effect: { statChanges: { happiness: -4 }, logKey: 'log_highschool_prom_prep_3' } },
        ]
    },
    {
        id: 'highschool_talent_show',
        titleKey: 'event_highschool_talent_show_title',
        descriptionKey: 'event_highschool_talent_show_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_talent_show_1', effect: { statChanges: { happiness: 8, confidence: 5 }, logKey: 'log_highschool_talent_show_1' } },
            { textKey: 'choice_highschool_talent_show_2', effect: { statChanges: { iq: 5 }, logKey: 'log_highschool_talent_show_2' } },
            { textKey: 'choice_highschool_talent_show_3', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_talent_show_3' } },
        ]
    },
    {
        id: 'highschool_exam_results',
        titleKey: 'event_highschool_exam_results_title',
        descriptionKey: 'event_highschool_exam_results_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_exam_results_1', effect: { statChanges: { happiness: 12 }, logKey: 'log_highschool_exam_results_1' } },
            { textKey: 'choice_highschool_exam_results_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_exam_results_2' } },
            { textKey: 'choice_highschool_exam_results_3', effect: { statChanges: { happiness: -8, confidence: -5 }, logKey: 'log_highschool_exam_results_3' } },
        ]
    },
    {
        id: 'highschool_sharing_food',
        titleKey: 'event_highschool_sharing_food_title',
        descriptionKey: 'event_highschool_sharing_food_desc',
        phases: [LifePhase.HighSchool],
        choices: [
            { textKey: 'choice_highschool_sharing_food_1', effect: { statChanges: { happiness: 8 }, logKey: 'log_highschool_sharing_food_1' } },
            { textKey: 'choice_highschool_sharing_food_2', effect: { statChanges: { happiness: 5 }, logKey: 'log_highschool_sharing_food_2' } },
            { textKey: 'choice_highschool_sharing_food_3', effect: { statChanges: { confidence: -5 }, logKey: 'log_highschool_sharing_food_3' } },
        ]
    },
];
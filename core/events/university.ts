import { EventDraft, LifePhase } from '../types';
import { EventIdByKey } from '../../src/generated/eventIds';
export const UNIVERSITY_EVENTS: EventDraft[] = [
    // 10 Main Events (with triggers)
    {
        id: 'university_first_day',
        titleKey: 'event_university_first_day_title',
        descriptionKey: 'event_university_first_day_desc',
        phases: [LifePhase.University],
        condition: (state, char) => char.age === 19,
        choices: [
            { textKey: 'choice_university_first_day_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_university_first_day_1' } },
            { textKey: 'choice_university_first_day_2', effect: { statChanges: { happiness: -2, eq: -1 }, logKey: 'log_university_first_day_2', triggers: [{ eventId: EventIdByKey.university_missed_info, chance: 0.8 }] } },
            { textKey: 'choice_university_first_day_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_first_day_3' } },
        ]
    },
    {
        id: 'university_forgot_registration',
        titleKey: 'event_university_forgot_registration_title',
        descriptionKey: 'event_university_forgot_registration_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_forgot_registration_1', effect: { statChanges: { iq: 1 }, logKey: 'log_university_forgot_registration_1' } },
            { textKey: 'choice_university_forgot_registration_2', effect: { statChanges: { iq: -1 }, logKey: 'log_university_forgot_registration_2', triggers: [{ eventId: EventIdByKey.university_class_full, chance: 0.7 }] } },
            { textKey: 'choice_university_forgot_registration_3', effect: { logKey: 'log_university_forgot_registration_3' } },
        ]
    },
    {
        id: 'university_noisy_roommate',
        titleKey: 'event_university_noisy_roommate_title',
        descriptionKey: 'event_university_noisy_roommate_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_noisy_roommate_1', effect: { statChanges: { eq: 1 }, logKey: 'log_university_noisy_roommate_1' } },
            { textKey: 'choice_university_noisy_roommate_2', effect: { logKey: 'log_university_noisy_roommate_2', triggers: [{ eventId: EventIdByKey.university_roommate_angry, chance: 0.6 }] } },
            { textKey: 'choice_university_noisy_roommate_3', effect: { statChanges: { health: -1, happiness: -1 }, logKey: 'log_university_noisy_roommate_3' } },
        ]
    },
    {
        id: 'university_group_presentation',
        titleKey: 'event_university_group_presentation_title',
        descriptionKey: 'event_university_group_presentation_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_group_presentation_1', effect: { statChanges: { iq: 2, eq: 2 }, logKey: 'log_university_group_presentation_1' } },
            { textKey: 'choice_university_group_presentation_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_university_group_presentation_2', triggers: [{ eventId: EventIdByKey.university_group_dislikes_you, chance: 0.8 }] } },
            { textKey: 'choice_university_group_presentation_3', effect: { statChanges: { iq: -2, eq: -2 }, logKey: 'log_university_group_presentation_3' } },
        ]
    },
    {
        id: 'university_midterm_exam',
        titleKey: 'event_university_midterm_exam_title',
        descriptionKey: 'event_university_midterm_exam_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_midterm_exam_1', effect: { statChanges: { iq: 3 }, logKey: 'log_university_midterm_exam_1' } },
            { textKey: 'choice_university_midterm_exam_2', effect: { statChanges: { iq: -1 }, logKey: 'log_university_midterm_exam_2', triggers: [{ eventId: EventIdByKey.university_exam_off_topic, chance: 0.6 }] } },
            { textKey: 'choice_university_midterm_exam_3', effect: { statChanges: { iq: -3, eq: -3 }, logKey: 'log_university_midterm_exam_3' } },
        ]
    },
    {
        id: 'university_football_game',
        titleKey: 'event_university_football_game_title',
        descriptionKey: 'event_university_football_game_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_football_game_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_football_game_1' } },
            { textKey: 'choice_university_football_game_2', effect: { statChanges: { happiness: 3, iq: -2 }, logKey: 'log_university_football_game_2', triggers: [{ eventId: EventIdByKey.university_marked_absent, chance: 0.7 }] } },
            { textKey: 'choice_university_football_game_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_football_game_3' } },
        ]
    },
    {
        id: 'university_dorm_party',
        titleKey: 'event_university_dorm_party_title',
        descriptionKey: 'event_university_dorm_party_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_dorm_party_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_university_dorm_party_1' } },
            { textKey: 'choice_university_dorm_party_2', effect: { statChanges: { happiness: 4, health: -2 }, logKey: 'log_university_dorm_party_2', triggers: [{ eventId: EventIdByKey.university_caught_by_ra, chance: 0.5 }] } },
            { textKey: 'choice_university_dorm_party_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_dorm_party_3' } },
        ]
    },
    {
        id: 'university_internship_interview',
        titleKey: 'event_university_internship_interview_title',
        descriptionKey: 'event_university_internship_interview_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_internship_interview_1', effect: { statChanges: { eq: 3, skill: 2 }, logKey: 'log_university_internship_interview_1' } },
            { textKey: 'choice_university_internship_interview_2', effect: { statChanges: { eq: -3 }, logKey: 'log_university_internship_interview_2', triggers: [{ eventId: EventIdByKey.university_rejected_immediately, chance: 0.9 }] } },
            { textKey: 'choice_university_internship_interview_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_internship_interview_3' } },
        ]
    },
    {
        id: 'university_night_class',
        titleKey: 'event_university_night_class_title',
        descriptionKey: 'event_university_night_class_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_night_class_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_night_class_1' } },
            { textKey: 'choice_university_night_class_2', effect: { statChanges: { iq: -1 }, logKey: 'log_university_night_class_2', triggers: [{ eventId: EventIdByKey.university_reprimanded_by_teacher, chance: 0.4 }] } },
            { textKey: 'choice_university_night_class_3', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_university_night_class_3' } },
        ]
    },
    {
        id: 'university_submit_essay',
        titleKey: 'event_university_submit_essay_title',
        descriptionKey: 'event_university_submit_essay_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_submit_essay_1', effect: { statChanges: { iq: 1 }, logKey: 'log_university_submit_essay_1' } },
            { textKey: 'choice_university_submit_essay_2', effect: { statChanges: { iq: -1 }, logKey: 'log_university_submit_essay_2', triggers: [{ eventId: EventIdByKey.university_points_deducted, chance: 0.9 }] } },
            { textKey: 'choice_university_submit_essay_3', effect: { statChanges: { iq: -3, eq: -2 }, logKey: 'log_university_submit_essay_3' } },
        ]
    },

    // 10 Triggered Events
    {
        id: 'university_missed_info',
        titleKey: 'event_university_missed_info_title',
        descriptionKey: 'event_university_missed_info_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_missed_info_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_missed_info_1' } },
            { textKey: 'choice_university_missed_info_2', effect: { statChanges: { iq: 1 }, logKey: 'log_university_missed_info_2' } },
            { textKey: 'choice_university_missed_info_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_missed_info_3' } },
        ]
    },
    {
        id: 'university_class_full',
        titleKey: 'event_university_class_full_title',
        descriptionKey: 'event_university_class_full_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_class_full_1', effect: { logKey: 'log_university_class_full_1' } },
            { textKey: 'choice_university_class_full_2', effect: { statChanges: { eq: 1 }, logKey: 'log_university_class_full_2' } },
            { textKey: 'choice_university_class_full_3', effect: { statChanges: { iq: 1 }, logKey: 'log_university_class_full_3' } },
        ]
    },
    {
        id: 'university_roommate_angry',
        titleKey: 'event_university_roommate_angry_title',
        descriptionKey: 'event_university_roommate_angry_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_roommate_angry_1', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_roommate_angry_1' } },
            { textKey: 'choice_university_roommate_angry_2', effect: { statChanges: { eq: 1 }, logKey: 'log_university_roommate_angry_2' } },
            { textKey: 'choice_university_roommate_angry_3', effect: { statChanges: { happiness: -2, eq: -1 }, logKey: 'log_university_roommate_angry_3' } },
        ]
    },
    {
        id: 'university_group_dislikes_you',
        titleKey: 'event_university_group_dislikes_you_title',
        descriptionKey: 'event_university_group_dislikes_you_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_group_dislikes_you_1', effect: { statChanges: { skill: 1 }, logKey: 'log_university_group_dislikes_you_1' } },
            { textKey: 'choice_university_group_dislikes_you_2', effect: { statChanges: { eq: -1 }, logKey: 'log_university_group_dislikes_you_2' } },
            { textKey: 'choice_university_group_dislikes_you_3', effect: { statChanges: { happiness: -2, eq: -2 }, logKey: 'log_university_group_dislikes_you_3' } },
        ]
    },
    {
        id: 'university_exam_off_topic',
        titleKey: 'event_university_exam_off_topic_title',
        descriptionKey: 'event_university_exam_off_topic_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_exam_off_topic_1', effect: { statChanges: { iq: 1, eq: -1 }, logKey: 'log_university_exam_off_topic_1' } },
            { textKey: 'choice_university_exam_off_topic_2', effect: { statChanges: { iq: -1 }, logKey: 'log_university_exam_off_topic_2' } },
            { textKey: 'choice_university_exam_off_topic_3', effect: { statChanges: { iq: -2, happiness: -1 }, logKey: 'log_university_exam_off_topic_3' } },
        ]
    },
    {
        id: 'university_marked_absent',
        titleKey: 'event_university_marked_absent_title',
        descriptionKey: 'event_university_marked_absent_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_marked_absent_1', effect: { statChanges: { eq: -1 }, logKey: 'log_university_marked_absent_1' } },
            { textKey: 'choice_university_marked_absent_2', effect: { statChanges: { eq: 1, iq: -1 }, logKey: 'log_university_marked_absent_2' } },
            { textKey: 'choice_university_marked_absent_3', effect: { statChanges: { iq: -1 }, logKey: 'log_university_marked_absent_3' } },
        ]
    },
    {
        id: 'university_caught_by_ra',
        titleKey: 'event_university_caught_by_ra_title',
        descriptionKey: 'event_university_caught_by_ra_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_caught_by_ra_1', effect: { statChanges: { iq: -1, eq: 1 }, logKey: 'log_university_caught_by_ra_1' } },
            { textKey: 'choice_university_caught_by_ra_2', effect: { statChanges: { happiness: -2 }, logKey: 'log_university_caught_by_ra_2' } },
            { textKey: 'choice_university_caught_by_ra_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_caught_by_ra_3' } },
        ]
    },
    {
        id: 'university_rejected_immediately',
        titleKey: 'event_university_rejected_immediately_title',
        descriptionKey: 'event_university_rejected_immediately_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_rejected_immediately_1', effect: { statChanges: { eq: 1 }, logKey: 'log_university_rejected_immediately_1' } },
            { textKey: 'choice_university_rejected_immediately_2', effect: { statChanges: { eq: 1, happiness: -1 }, logKey: 'log_university_rejected_immediately_2' } },
            { textKey: 'choice_university_rejected_immediately_3', effect: { statChanges: { eq: -2, happiness: -2 }, logKey: 'log_university_rejected_immediately_3' } },
        ]
    },
    {
        id: 'university_reprimanded_by_teacher',
        titleKey: 'event_university_reprimanded_by_teacher_title',
        descriptionKey: 'event_university_reprimanded_by_teacher_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_reprimanded_by_teacher_1', effect: { statChanges: { eq: -1 }, logKey: 'log_university_reprimanded_by_teacher_1' } },
            { textKey: 'choice_university_reprimanded_by_teacher_2', effect: { statChanges: { iq: -1, eq: 1 }, logKey: 'log_university_reprimanded_by_teacher_2' } },
            { textKey: 'choice_university_reprimanded_by_teacher_3', effect: { statChanges: { iq: 1 }, logKey: 'log_university_reprimanded_by_teacher_3' } },
        ]
    },
    {
        id: 'university_points_deducted',
        titleKey: 'event_university_points_deducted_title',
        descriptionKey: 'event_university_points_deducted_desc',
        phases: [LifePhase.University],
        isTriggerOnly: true,
        choices: [
            { textKey: 'choice_university_points_deducted_1', effect: { statChanges: { eq: -1 }, logKey: 'log_university_points_deducted_1' } },
            { textKey: 'choice_university_points_deducted_2', effect: { statChanges: { iq: -1, happiness: -1 }, logKey: 'log_university_points_deducted_2' } },
            { textKey: 'choice_university_points_deducted_3', effect: { statChanges: { eq: 1, iq: -1 }, logKey: 'log_university_points_deducted_3' } },
        ]
    },

    // 20 Independent Events
    {
        id: 'university_choose_elective',
        titleKey: 'event_university_choose_elective_title',
        descriptionKey: 'event_university_choose_elective_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_choose_elective_1', effect: { statChanges: { iq: 1, happiness: 1 }, logKey: 'log_university_choose_elective_1' } },
            { textKey: 'choice_university_choose_elective_2', effect: { statChanges: { iq: 2 }, logKey: 'log_university_choose_elective_2' } },
            { textKey: 'choice_university_choose_elective_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_choose_elective_3' } },
        ]
    },
    {
        id: 'university_library_visit',
        titleKey: 'event_university_library_visit_title',
        descriptionKey: 'event_university_library_visit_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_library_visit_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_library_visit_1' } },
            { textKey: 'choice_university_library_visit_2', effect: { statChanges: { happiness: 1, health: -1 }, logKey: 'log_university_library_visit_2' } },
            { textKey: 'choice_university_library_visit_3', effect: { statChanges: { iq: -1, happiness: 1 }, logKey: 'log_university_library_visit_3' } },
        ]
    },
    {
        id: 'university_join_club',
        titleKey: 'event_university_join_club_title',
        descriptionKey: 'event_university_join_club_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_join_club_1', effect: { statChanges: { happiness: 2, eq: 1 }, logKey: 'log_university_join_club_1' } },
            { textKey: 'choice_university_join_club_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_join_club_2' } },
            { textKey: 'choice_university_join_club_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_university_join_club_3' } },
        ]
    },
    {
        id: 'university_professor_praise',
        titleKey: 'event_university_professor_praise_title',
        descriptionKey: 'event_university_professor_praise_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_professor_praise_1', effect: { statChanges: { happiness: 2, eq: 2 }, logKey: 'log_university_professor_praise_1' } },
            { textKey: 'choice_university_professor_praise_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_professor_praise_2' } },
            { textKey: 'choice_university_professor_praise_3', effect: { statChanges: { eq: 1 }, logKey: 'log_university_professor_praise_3' } },
        ]
    },
    {
        id: 'university_professor_criticism',
        titleKey: 'event_university_professor_criticism_title',
        descriptionKey: 'event_university_professor_criticism_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_professor_criticism_1', effect: { statChanges: { eq: -2 }, logKey: 'log_university_professor_criticism_1' } },
            { textKey: 'choice_university_professor_criticism_2', effect: { statChanges: { eq: 1, iq: -1 }, logKey: 'log_university_professor_criticism_2' } },
            { textKey: 'choice_university_professor_criticism_3', effect: { statChanges: { iq: 1 }, logKey: 'log_university_professor_criticism_3' } },
        ]
    },
    {
        id: 'university_part_time_job',
        titleKey: 'event_university_part_time_job_title',
        descriptionKey: 'event_university_part_time_job_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_part_time_job_1', effect: { fundChange: 500, logKey: 'log_university_part_time_job_1' } },
            { textKey: 'choice_university_part_time_job_2', effect: { fundChange: 200, statChanges: { happiness: -1 }, logKey: 'log_university_part_time_job_2' } },
            { textKey: 'choice_university_part_time_job_3', effect: { fundChange: 700, statChanges: { skill: 1 }, logKey: 'log_university_part_time_job_3' } },
        ]
    },
    {
        id: 'university_study_group',
        titleKey: 'event_university_study_group_title',
        descriptionKey: 'event_university_study_group_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_study_group_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_study_group_1' } },
            { textKey: 'choice_university_study_group_2', effect: { statChanges: { iq: 1, happiness: 2 }, logKey: 'log_university_study_group_2' } },
            { textKey: 'choice_university_study_group_3', effect: { statChanges: { iq: 1 }, logKey: 'log_university_study_group_3' } },
        ]
    },
    {
        id: 'university_class_trip',
        titleKey: 'event_university_class_trip_title',
        descriptionKey: 'event_university_class_trip_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_class_trip_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_class_trip_1' } },
            { textKey: 'choice_university_class_trip_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_class_trip_2' } },
            { textKey: 'choice_university_class_trip_3', effect: { statChanges: { happiness: 1, iq: 1 }, logKey: 'log_university_class_trip_3' } },
        ]
    },
    {
        id: 'university_surprise_test',
        titleKey: 'event_university_surprise_test_title',
        descriptionKey: 'event_university_surprise_test_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_surprise_test_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_surprise_test_1' } },
            { textKey: 'choice_university_surprise_test_2', effect: { statChanges: { iq: -1, eq: -1 }, logKey: 'log_university_surprise_test_2' } },
            { textKey: 'choice_university_surprise_test_3', effect: { statChanges: { iq: -2 }, logKey: 'log_university_surprise_test_3' } },
        ]
    },
    {
        id: 'university_club_interview',
        titleKey: 'event_university_club_interview_title',
        descriptionKey: 'event_university_club_interview_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_club_interview_1', effect: { statChanges: { eq: 2 }, logKey: 'log_university_club_interview_1' } },
            { textKey: 'choice_university_club_interview_2', effect: { statChanges: { eq: 3 }, logKey: 'log_university_club_interview_2' } },
            { textKey: 'choice_university_club_interview_3', effect: { statChanges: { eq: -2 }, logKey: 'log_university_club_interview_3' } },
        ]
    },
    {
        id: 'university_sports_day',
        titleKey: 'event_university_sports_day_title',
        descriptionKey: 'event_university_sports_day_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_sports_day_1', effect: { statChanges: { health: 2 }, logKey: 'log_university_sports_day_1' } },
            { textKey: 'choice_university_sports_day_2', effect: { statChanges: { health: 1 }, logKey: 'log_university_sports_day_2' } },
            { textKey: 'choice_university_sports_day_3', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_sports_day_3' } },
        ]
    },
    {
        id: 'university_friends_party',
        titleKey: 'event_university_friends_party_title',
        descriptionKey: 'event_university_friends_party_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_friends_party_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_university_friends_party_1' } },
            { textKey: 'choice_university_friends_party_2', effect: { statChanges: { eq: -1 }, logKey: 'log_university_friends_party_2' } },
            { textKey: 'choice_university_friends_party_3', effect: { statChanges: { happiness: -1 }, logKey: 'log_university_friends_party_3' } },
        ]
    },
    {
        id: 'university_museum_visit',
        titleKey: 'event_university_museum_visit_title',
        descriptionKey: 'event_university_museum_visit_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_museum_visit_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_museum_visit_1' } },
            { textKey: 'choice_university_museum_visit_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_museum_visit_2' } },
            { textKey: 'choice_university_museum_visit_3', effect: { statChanges: { happiness: 1, iq: 1 }, logKey: 'log_university_museum_visit_3' } },
        ]
    },
    {
        id: 'university_major_group_project',
        titleKey: 'event_university_major_group_project_title',
        descriptionKey: 'event_university_major_group_project_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_major_group_project_1', effect: { statChanges: { iq: 2, skill: 1 }, logKey: 'log_university_major_group_project_1' } },
            { textKey: 'choice_university_major_group_project_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_university_major_group_project_2' } },
            { textKey: 'choice_university_major_group_project_3', effect: { statChanges: { iq: 1 }, logKey: 'log_university_major_group_project_3' } },
        ]
    },
    {
        id: 'university_holiday_festival',
        titleKey: 'event_university_holiday_festival_title',
        descriptionKey: 'event_university_holiday_festival_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_holiday_festival_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_holiday_festival_1' } },
            { textKey: 'choice_university_holiday_festival_2', effect: { statChanges: { happiness: -1 }, logKey: 'log_university_holiday_festival_2' } },
            { textKey: 'choice_university_holiday_festival_3', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_holiday_festival_3' } },
        ]
    },
    {
        id: 'university_meet_professor_outside',
        titleKey: 'event_university_meet_professor_outside_title',
        descriptionKey: 'event_university_meet_professor_outside_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_meet_professor_outside_1', effect: { statChanges: { eq: 1 }, logKey: 'log_university_meet_professor_outside_1' } },
            { textKey: 'choice_university_meet_professor_outside_2', effect: { statChanges: { eq: -1 }, logKey: 'log_university_meet_professor_outside_2' } },
            { textKey: 'choice_university_meet_professor_outside_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_meet_professor_outside_3' } },
        ]
    },
    {
        id: 'university_online_class',
        titleKey: 'event_university_online_class_title',
        descriptionKey: 'event_university_online_class_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_online_class_1', effect: { statChanges: { iq: 2 }, logKey: 'log_university_online_class_1' } },
            { textKey: 'choice_university_online_class_2', effect: { statChanges: { iq: -1, happiness: 1 }, logKey: 'log_university_online_class_2' } },
            { textKey: 'choice_university_online_class_3', effect: { statChanges: { iq: 1, health: -1 }, logKey: 'log_university_online_class_3' } },
        ]
    },
    {
        id: 'university_first_internship_day',
        titleKey: 'event_university_first_internship_day_title',
        descriptionKey: 'event_university_first_internship_day_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_first_internship_day_1', effect: { statChanges: { skill: 2, eq: 1 }, logKey: 'log_university_first_internship_day_1' } },
            { textKey: 'choice_university_first_internship_day_2', effect: { statChanges: { eq: -2 }, logKey: 'log_university_first_internship_day_2' } },
            { textKey: 'choice_university_first_internship_day_3', effect: { statChanges: { skill: 1 }, logKey: 'log_university_first_internship_day_3' } },
        ]
    },
    {
        id: 'university_exam_results',
        titleKey: 'event_university_exam_results_title',
        descriptionKey: 'event_university_exam_results_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_exam_results_1', effect: { statChanges: { happiness: 3 }, logKey: 'log_university_exam_results_1' } },
            { textKey: 'choice_university_exam_results_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_exam_results_2' } },
            { textKey: 'choice_university_exam_results_3', effect: { statChanges: { happiness: -2, eq: -1 }, logKey: 'log_university_exam_results_3' } },
        ]
    },
    {
        id: 'university_share_food',
        titleKey: 'event_university_share_food_title',
        descriptionKey: 'event_university_share_food_desc',
        phases: [LifePhase.University],
        choices: [
            { textKey: 'choice_university_share_food_1', effect: { statChanges: { happiness: 2 }, logKey: 'log_university_share_food_1' } },
            { textKey: 'choice_university_share_food_2', effect: { statChanges: { happiness: 1 }, logKey: 'log_university_share_food_2' } },
            { textKey: 'choice_university_share_food_3', effect: { statChanges: { eq: -1 }, logKey: 'log_university_share_food_3' } },
        ]
    },
];
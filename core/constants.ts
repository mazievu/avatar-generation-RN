import { LifePhase, SchoolOption, UniversityMajor, PetType, PetDefinition, CareerTrack, BusinessDefinition, AssetDefinition, AssetType } from './types';

// ==============================
// GAME ECONOMY CORE
// ==============================
export const INITIAL_FUNDS = 100000;
export const GAME_SPEED_MS = 50; // 0.1 seconds = 1 day
export const DAYS_IN_YEAR = 365;
export const MOURNING_PERIOD_YEARS = 3;
export const PENSION_AMOUNT = 4200; // Per year (~$50/mo savings)

export const CONTENT_VERSION = 1; // Added content version

// Trần lương tuyệt đối
export const SALARY_CAP_MONTHLY = 800;
export const SALARY_CAP_ANNUAL = SALARY_CAP_MONTHLY * 12; // 9,600

export const LIFE_PHASE_AGES = {
    Newborn: 5,
    Elementary: 11,
    MiddleSchool: 15,
    HighSchool: 18,
    University: 22,
    PostGraduation: 59,
    Retired: 100, // Max age
};

// ==============================
// COST OF LIVING
// ==============================
// Rebalanced based on user request for monthly costs between $100-$400
const BASE_COST_OF_LIVING: Record<LifePhase, number> = {
    [LifePhase.Newborn]: 1200, // $100/mo
    [LifePhase.Elementary]: 1800, // $150/mo
    [LifePhase.MiddleSchool]: 2400, // $200/mo
    [LifePhase.HighSchool]: 3000, // $250/mo
    [LifePhase.University]: 4200, // $350/mo
    [LifePhase.PostGraduation]: 4800, // $400/mo
    [LifePhase.Retired]: 3600, // $300/mo
};

export const getCostOfLiving = (phase: LifePhase): number => {
    const baseCost = BASE_COST_OF_LIVING[phase];
    // Fluctuation of $100/month means a range of $1200/year.
    // We'll use a range of [-600, 600] for the annual fluctuation.
    const fluctuation = Math.random() * 1200 - 600;
    return baseCost + fluctuation;
};

// ==============================
// EDUCATION
// ==============================
export const SCHOOL_OPTIONS: Record<LifePhase.Elementary | LifePhase.MiddleSchool | LifePhase.HighSchool, SchoolOption[]> = {
    [LifePhase.Elementary]: [
        { nameKey: 'school_public', cost: 0, effects: { iq: 5, eq: 2 }, logKey: 'log_enrolled_public_elementary' },
        { nameKey: 'school_private', cost: 20000, effects: { iq: 10, eq: 5 }, logKey: 'log_enrolled_private_elementary' },
        { nameKey: 'school_royal', cost: 100000, effects: { iq: 20, eq: 10 }, logKey: 'log_enrolled_royal_elementary' },
    ],
    [LifePhase.MiddleSchool]: [
        { nameKey: 'school_public', cost: 0, effects: { iq: 8, eq: 3 }, logKey: 'log_enrolled_public_middle' },
        { nameKey: 'school_private', cost: 30000, effects: { iq: 15, eq: 7 }, logKey: 'log_enrolled_private_middle' },
        { nameKey: 'school_royal', cost: 150000, effects: { iq: 25, eq: 15 }, logKey: 'log_enrolled_royal_middle' },
    ],
    [LifePhase.HighSchool]: [
        { nameKey: 'school_public_high', cost: 0, effects: { iq: 10, eq: 5 }, logKey: 'log_enrolled_public_high' },
        { nameKey: 'school_private_high', cost: 50000, effects: { iq: 20, eq: 10 }, logKey: 'log_enrolled_private_high' },
        { nameKey: 'school_royal_high', cost: 250000, effects: { iq: 35, eq: 20 }, logKey: 'log_enrolled_royal_high' },
    ],
};

export const UNIVERSITY_MAJORS: UniversityMajor[] = [
    { nameKey: 'major_business', descriptionKey: 'major_business_desc', cost: 100000, effects: { iq: 15, eq: 10 } },
    { nameKey: 'major_finance', descriptionKey: 'major_finance_desc', cost: 110000, effects: { iq: 20, eq: 5 } },
    { nameKey: 'major_marketing', descriptionKey: 'major_marketing_desc', cost: 90000, effects: { iq: 10, eq: 15 } },
    { nameKey: 'major_technology', descriptionKey: 'major_technology_desc', cost: 120000, effects: { iq: 25 } },
    { nameKey: 'major_engineering', descriptionKey: 'major_engineering_desc', cost: 130000, effects: { iq: 25 } },
    { nameKey: 'major_arts', descriptionKey: 'major_arts_desc', cost: 80000, effects: { iq: 5, happiness: 10 } },
    { nameKey: 'major_medicine', descriptionKey: 'major_medicine_desc', cost: 200000, effects: { iq: 30, health: 5 } },
    { nameKey: 'major_culinary', descriptionKey: 'major_culinary_desc', cost: 70000, effects: { skill: 10, happiness: 5 } },
    { nameKey: 'major_kinesiology', descriptionKey: 'major_kinesiology_desc', cost: 85000, effects: { health: 10, skill: 5 } },
    { nameKey: 'major_agriculture', descriptionKey: 'major_agriculture_desc', cost: 60000, effects: { skill: 5, health: 5 } },
    { nameKey: 'major_logistics', descriptionKey: 'major_logistics_desc', cost: 95000, effects: { iq: 15, skill: 5 } },
];

// ==============================
// CAREER LADDER
// ==============================
export const CAREER_LADDER: Record<string, CareerTrack> = {
    Unskilled: {
        nameKey: 'career_track_unskilled_name', descriptionKey: 'career_track_unskilled_desc',
        iqRequired: 0, eqRequired: 0,
        levels: [
            { titleKey: 'career_unskilled_1', salary: 6000, skillRequired: 0 }, // 500/tháng
            { titleKey: 'career_unskilled_2', salary: 7200, skillRequired: 20 }, // 600/tháng
            { titleKey: 'career_unskilled_3', salary: 8400, skillRequired: 40 }, // 700/tháng
            { titleKey: 'career_unskilled_4', salary: 9600, skillRequired: 80 }, // 800/tháng
        ],
    },
    Trade: {
        nameKey: 'career_track_trade_name', descriptionKey: 'career_track_trade_desc',
        iqRequired: 0, eqRequired: 0,
        levels: [
            { titleKey: 'career_trade_1', salary: 6000, skillRequired: 0 }, // 500/tháng
            { titleKey: 'career_trade_2', salary: 7600, skillRequired: 30 }, // 620/tháng
            { titleKey: 'career_trade_3', salary: 9000, skillRequired: 60 }, // 750/tháng
            { titleKey: 'career_trade_4', salary: 9600, skillRequired: 80 }, // 800/tháng
        ],
    },
    Arts: {
        nameKey: 'career_track_arts_name', descriptionKey: 'career_track_arts_desc',
        requiredMajor: 'major_arts', iqRequired: 100, eqRequired: 80,
        levels: [
            { titleKey: 'career_arts_1', salary: 7200, skillRequired: 0 }, // 600/tháng
            { titleKey: 'career_arts_2', salary: 8400, skillRequired: 40 }, // 700/tháng
            { titleKey: 'career_arts_3', salary: 9000, skillRequired: 65 }, // 750/tháng
            { titleKey: 'career_arts_4', salary: 9600, skillRequired: 85 }, // 800/tháng
        ],
    },
    Business: {
        nameKey: 'career_track_business_name', descriptionKey: 'career_track_business_desc',
        requiredMajor: 'major_business', iqRequired: 110, eqRequired: 70,
        levels: [
            { titleKey: 'career_business_1', salary: 7200, skillRequired: 0 }, // 600/tháng
            { titleKey: 'career_business_2', salary: 8400, skillRequired: 30 }, // 700/tháng
            { titleKey: 'career_business_3', salary: 9000, skillRequired: 60 }, // 750/tháng
            { titleKey: 'career_business_4', salary: 9600, skillRequired: 90 }, // 800/tháng
        ],
    },
    Technology: {
        nameKey: 'career_track_technology_name', descriptionKey: 'career_track_technology_desc',
        requiredMajor: 'major_technology', iqRequired: 120, eqRequired: 50,
        levels: [
            { titleKey: 'career_technology_1', salary: 7200, skillRequired: 0 }, // 600/tháng
            { titleKey: 'career_technology_2', salary: 8400, skillRequired: 40 }, // 700/tháng
            { titleKey: 'career_technology_3', salary: 9000, skillRequired: 65 }, // 750/tháng
            { titleKey: 'career_technology_4', salary: 9600, skillRequired: 90 }, // 800/tháng
        ],
    },
    Medicine: {
        nameKey: 'career_track_medicine_name', descriptionKey: 'career_track_medicine_desc',
        requiredMajor: 'major_medicine', iqRequired: 130, eqRequired: 80,
        levels: [
            { titleKey: 'career_medicine_1', salary: 7200, skillRequired: 0 }, // 600/tháng
            { titleKey: 'career_medicine_2', salary: 8400, skillRequired: 40 }, // 700/tháng
            { titleKey: 'career_medicine_3', salary: 9000, skillRequired: 70 }, // 750/tháng
            { titleKey: 'career_medicine_4', salary: 9600, skillRequired: 95 }, // 800/tháng
        ],
    },
};

// ==============================
// TRAINING & EARLY CAREER
// ==============================
export const VOCATIONAL_TRAINING = { duration: 3, cost: 40000, effects: { skill: 40, eq: 10 } };
export const INTERNSHIP = { duration: 1, stipend: 4800 }; // 500/tháng
export const TRAINEE_SALARY = 4800; // 500/tháng

// ============================== 
// EVENTS
// ==============================
// export const EVENTS = ALL_EVENTS; // This line will be removed or commented out

// ==============================
// PETS & AVATAR
// ==============================
export const PET_DATA: Record<PetType, PetDefinition> = {
    [PetType.Dog]: { nameKey: 'pet_dog', monthlyCost: 50, effects: { happiness: 3, health: 1 } },
    [PetType.Cat]: { nameKey: 'pet_cat', monthlyCost: 40, effects: { happiness: 2, eq: 1 } },
    [PetType.Parrot]: { nameKey: 'pet_parrot', monthlyCost: 30, effects: { happiness: 1, iq: 1 } },
    [PetType.Horse]: { nameKey: 'pet_horse', monthlyCost: 200, effects: { happiness: 5, health: 2, eq: 2 } },
    [PetType.Fish]: { nameKey: 'pet_fish', monthlyCost: 20, effects: { happiness: 1 } },
};

export const CUSTOM_AVATAR_COST = 10000;

export const AVATAR_COLOR_PALETTE = [
  { name: 'White', filter: 'grayscale(1) brightness(2.5)', previewBackground: '#ffffff' },
  { name: 'Natural Gray', filter: 'grayscale(0.8) brightness(1.1) sepia(0.1)', previewBackground: '#808080' },
  { name: 'Natural Brown', filter: 'sepia(0.5) hue-rotate(-20deg) saturate(1.2)', previewBackground: '#a52a2a' },
  { name: 'Black', filter: 'brightness(0.2) grayscale(1)', previewBackground: '#000000' },
  { name: 'Blonde', filter: 'sepia(0.2) saturate(2) brightness(1.2) hue-rotate(-10deg)', previewBackground: '#faf0be' },
  { name: 'Red', filter: 'sepia(0.6) hue-rotate(-50deg) saturate(3) brightness(0.9)', previewBackground: '#ff0000' },
  { name: 'Blue', filter: 'sepia(0.5) hue-rotate(180deg) saturate(5) brightness(0.8)', previewBackground: '#0000ff' },
  { name: 'Green', filter: 'sepia(0.5) hue-rotate(60deg) saturate(3) brightness(0.9)', previewBackground: '#008000' },
  { name: 'Pink', filter: 'sepia(0.4) hue-rotate(290deg) saturate(5) brightness(1.1)', previewBackground: '#ffc0cb' },
  { name: 'Purple', filter: 'sepia(0.5) hue-rotate(240deg) saturate(4) brightness(0.9)', previewBackground: '#800080' },
];

// ==============================
// BUSINESS ECONOMY
// ==============================
export const BUSINESS_REVENUE_SCALE = 1;
export const BUSINESS_FIXED_COST_SCALE = 1.25;
export const BUSINESS_COGS_BONUS_ABS = 1;
export const BUSINESS_COGS_MAX = 0.85;
// Lương nhân viên DN
export const BUSINESS_WORKER_BASE_SALARY_MONTHLY = 500;
export const BUSINESS_WORKER_SKILL_MULTIPLIER = 15;
export const BUSINESS_WORKER_WAGE_CAP_MONTHLY = SALARY_CAP_MONTHLY;
// Overhead theo đầu người
export const BUSINESS_PER_EMPLOYEE_OVERHEAD_MONTHLY = 250;
// Trần lợi nhuận chủ DN
export const BUSINESS_OWNER_PROFIT_CAP_MONTHLY = SALARY_CAP_MONTHLY;
// Chi phí thuê robot
export const ROBOT_HIRE_COST = 700; // /tháng


export const BUSINESS_DEFINITIONS: Record<string, BusinessDefinition> = {
    'medicine_t1': { id: 'medicine_t1', type: 'medicine', tier: 1, nameKey: 'business_medicine_t1_name', cost: 150000, baseRevenue: 15000, costOfGoodsSold: 0.3, fixedMonthlyCost: 5000, slots: [ { roleKey: 'role_nurse', requiredMajor: 'Unskilled' }, { roleKey: 'role_doctor', requiredMajor: 'major_medicine' } ], upgradeSlots: [] },
    'medicine_t2': { id: 'medicine_t2', type: 'medicine', tier: 2, nameKey: 'business_medicine_t2_name', cost: 500000, baseRevenue: 50000, costOfGoodsSold: 0.35, fixedMonthlyCost: 15000, slots: [ { roleKey: 'role_head_nurse', requiredMajor: 'Unskilled' }, { roleKey: 'role_doctor', requiredMajor: 'major_medicine' }, { roleKey: 'role_surgeon', requiredMajor: 'major_medicine' }, { roleKey: 'role_admin_staff', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'medicine_t3': { id: 'medicine_t3', type: 'medicine', tier: 3, nameKey: 'business_medicine_t3_name', cost: 2000000, baseRevenue: 200000, costOfGoodsSold: 0.4, fixedMonthlyCost: 50000, slots: [ { roleKey: 'role_chief_physician', requiredMajor: 'major_medicine' }, { roleKey: 'role_chief_surgeon', requiredMajor: 'major_medicine' }, { roleKey: 'role_researcher', requiredMajor: 'major_medicine' }, { roleKey: 'role_manager', requiredMajor: 'major_business' }, { roleKey: 'role_admin_staff', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'finance_t1': { id: 'finance_t1', type: 'finance', tier: 1, nameKey: 'business_finance_t1_name', cost: 200000, baseRevenue: 20000, costOfGoodsSold: 0.1, fixedMonthlyCost: 8000, slots: [ { roleKey: 'role_bank_teller', requiredMajor: 'Unskilled' }, { roleKey: 'role_loan_officer', requiredMajor: 'major_finance' } ], upgradeSlots: [] },
    'finance_t2': { id: 'finance_t2', type: 'finance', tier: 2, nameKey: 'business_finance_t2_name', cost: 700000, baseRevenue: 70000, costOfGoodsSold: 0.1, fixedMonthlyCost: 25000, slots: [ { roleKey: 'role_financial_analyst', requiredMajor: 'major_finance' }, { roleKey: 'role_investment_analyst', requiredMajor: 'major_finance' }, { roleKey: 'role_manager', requiredMajor: 'major_business' }, { roleKey: 'role_it_support', requiredMajor: 'major_technology' } ], upgradeSlots: [] },
    'finance_t3': { id: 'finance_t3', type: 'finance', tier: 3, nameKey: 'business_finance_t3_name', cost: 2500000, baseRevenue: 250000, costOfGoodsSold: 0.1, fixedMonthlyCost: 80000, slots: [ { roleKey: 'role_senior_manager', requiredMajor: 'major_business' }, { roleKey: 'role_chief_accountant', requiredMajor: 'major_finance' }, { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_lead_developer', requiredMajor: 'major_technology' } ], upgradeSlots: [] },
    'marketing_t1': { id: 'marketing_t1', type: 'marketing', tier: 1, nameKey: 'business_marketing_t1_name', cost: 100000, baseRevenue: 12000, costOfGoodsSold: 0.2, fixedMonthlyCost: 3000, slots: [ { roleKey: 'role_copywriter', requiredMajor: 'major_arts' }, { roleKey: 'role_designer', requiredMajor: 'major_arts' } ], upgradeSlots: [] },
    'marketing_t2': { id: 'marketing_t2', type: 'marketing', tier: 2, nameKey: 'business_marketing_t2_name', cost: 400000, baseRevenue: 45000, costOfGoodsSold: 0.2, fixedMonthlyCost: 12000, slots: [ { roleKey: 'role_account_manager', requiredMajor: 'major_marketing' }, { roleKey: 'role_media_planner', requiredMajor: 'major_marketing' }, { roleKey: 'role_art_director', requiredMajor: 'major_arts' } ], upgradeSlots: [] },
    'marketing_t3': { id: 'marketing_t3', type: 'marketing', tier: 3, nameKey: 'business_marketing_t3_name', cost: 1500000, baseRevenue: 180000, costOfGoodsSold: 0.2, fixedMonthlyCost: 40000, slots: [ { roleKey: 'role_marketing_lead', requiredMajor: 'major_marketing' }, { roleKey: 'role_pr_manager', requiredMajor: 'major_marketing' }, { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_senior_editor', requiredMajor: 'major_arts' } ], upgradeSlots: [] },
    'technology_t1': { id: 'technology_t1', type: 'technology', tier: 1, nameKey: 'business_technology_t1_name', cost: 250000, baseRevenue: 25000, costOfGoodsSold: 0.15, fixedMonthlyCost: 10000, slots: [ { roleKey: 'role_qa_tester', requiredMajor: 'Unskilled' }, { roleKey: 'role_it_support', requiredMajor: 'major_technology' } ], upgradeSlots: [] },
    'technology_t2': { id: 'technology_t2', type: 'technology', tier: 2, nameKey: 'business_technology_t2_name', cost: 800000, baseRevenue: 90000, costOfGoodsSold: 0.15, fixedMonthlyCost: 30000, slots: [ { roleKey: 'role_lead_developer', requiredMajor: 'major_technology' }, { roleKey: 'role_devops_engineer', requiredMajor: 'major_technology' }, { roleKey: 'role_project_manager', requiredMajor: 'major_business' } ], upgradeSlots: [] },
    'technology_t3': { id: 'technology_t3', type: 'technology', tier: 3, nameKey: 'business_technology_t3_name', cost: 3000000, baseRevenue: 350000, costOfGoodsSold: 0.15, fixedMonthlyCost: 100000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_lead_developer', requiredMajor: 'major_technology' }, { roleKey: 'role_researcher', requiredMajor: 'major_technology' }, { roleKey: 'role_marketing_lead', requiredMajor: 'major_marketing' } ], upgradeSlots: [] },
    'engineering_t1': { id: 'engineering_t1', type: 'engineering', tier: 1, nameKey: 'business_engineering_t1_name', cost: 120000, baseRevenue: 14000, costOfGoodsSold: 0.4, fixedMonthlyCost: 4000, slots: [ { roleKey: 'role_machine_maintenance', requiredMajor: 'Unskilled' }, { roleKey: 'role_mechanical_engineer', requiredMajor: 'major_engineering' } ], upgradeSlots: [] },
    'engineering_t2': { id: 'engineering_t2', type: 'engineering', tier: 2, nameKey: 'business_engineering_t2_name', cost: 450000, baseRevenue: 55000, costOfGoodsSold: 0.4, fixedMonthlyCost: 18000, slots: [ { roleKey: 'role_civil_engineer', requiredMajor: 'major_engineering' }, { roleKey: 'role_project_manager', requiredMajor: 'major_business' }, { roleKey: 'role_production_engineer', requiredMajor: 'major_engineering' } ], upgradeSlots: [] },
    'engineering_t3': { id: 'engineering_t3', type: 'engineering', tier: 3, nameKey: 'business_engineering_t3_name', cost: 1800000, baseRevenue: 220000, costOfGoodsSold: 0.4, fixedMonthlyCost: 60000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_senior_manager', requiredMajor: 'major_engineering' }, { roleKey: 'role_quality_control', requiredMajor: 'major_engineering' }, { roleKey: 'role_researcher', requiredMajor: 'major_engineering' } ], upgradeSlots: [] },
    'arts_t1': { id: 'arts_t1', type: 'arts', tier: 1, nameKey: 'business_arts_t1_name', cost: 80000, baseRevenue: 9000, costOfGoodsSold: 0.25, fixedMonthlyCost: 2000, slots: [ { roleKey: 'role_receptionist', requiredMajor: 'Unskilled' }, { roleKey: 'role_curator', requiredMajor: 'major_arts' } ], upgradeSlots: [] },
    'arts_t2': { id: 'arts_t2', type: 'arts', tier: 2, nameKey: 'business_arts_t2_name', cost: 350000, baseRevenue: 40000, costOfGoodsSold: 0.25, fixedMonthlyCost: 10000, slots: [ { roleKey: 'role_art_historian', requiredMajor: 'major_arts' }, { roleKey: 'role_art_teacher', requiredMajor: 'major_arts' }, { roleKey: 'role_manager', requiredMajor: 'major_business' } ], upgradeSlots: [] },
    'arts_t3': { id: 'arts_t3', type: 'arts', tier: 3, nameKey: 'business_arts_t3_name', cost: 1200000, baseRevenue: 150000, costOfGoodsSold: 0.25, fixedMonthlyCost: 35000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_senior_editor', requiredMajor: 'major_arts' }, { roleKey: 'role_curator', requiredMajor: 'major_arts' }, { roleKey: 'role_pr_manager', requiredMajor: 'major_marketing' } ], upgradeSlots: [] },
    'culinary_t1': { id: 'culinary_t1', type: 'culinary', tier: 1, nameKey: 'business_culinary_t1_name', cost: 50000, baseRevenue: 8000, costOfGoodsSold: 0.5, fixedMonthlyCost: 2000, slots: [ { roleKey: 'role_cashier', requiredMajor: 'Unskilled' }, { roleKey: 'role_service_staff', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'culinary_t2': { id: 'culinary_t2', type: 'culinary', tier: 2, nameKey: 'business_culinary_t2_name', cost: 250000, baseRevenue: 30000, costOfGoodsSold: 0.5, fixedMonthlyCost: 8000, slots: [ { roleKey: 'role_head_chef', requiredMajor: 'major_culinary' }, { roleKey: 'role_manager', requiredMajor: 'major_business' }, { roleKey: 'role_service_staff', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'culinary_t3': { id: 'culinary_t3', type: 'culinary', tier: 3, nameKey: 'business_culinary_t3_name', cost: 1000000, baseRevenue: 120000, costOfGoodsSold: 0.5, fixedMonthlyCost: 30000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_head_chef', requiredMajor: 'major_culinary' }, { roleKey: 'role_mixologist', requiredMajor: 'major_culinary' }, { roleKey: 'role_marketing_lead', requiredMajor: 'major_marketing' } ], upgradeSlots: [] },
    'kinesiology_t1': { id: 'kinesiology_t1', type: 'kinesiology', tier: 1, nameKey: 'business_kinesiology_t1_name', cost: 75000, baseRevenue: 10000, costOfGoodsSold: 0.1, fixedMonthlyCost: 4000, slots: [ { roleKey: 'role_receptionist', requiredMajor: 'Unskilled' }, { roleKey: 'role_head_trainer', requiredMajor: 'major_kinesiology' } ], upgradeSlots: [] },
    'kinesiology_t2': { id: 'kinesiology_t2', type: 'kinesiology', tier: 2, nameKey: 'business_kinesiology_t2_name', cost: 300000, baseRevenue: 40000, costOfGoodsSold: 0.1, fixedMonthlyCost: 15000, slots: [ { roleKey: 'role_lifeguard', requiredMajor: 'Unskilled' }, { roleKey: 'role_swimming_coach', requiredMajor: 'major_kinesiology' }, { roleKey: 'role_manager', requiredMajor: 'major_business' } ], upgradeSlots: [] },
    'kinesiology_t3': { id: 'kinesiology_t3', type: 'kinesiology', tier: 3, nameKey: 'business_kinesiology_t3_name', cost: 1100000, baseRevenue: 160000, costOfGoodsSold: 0.1, fixedMonthlyCost: 45000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_researcher', requiredMajor: 'major_kinesiology' }, { roleKey: 'role_kinesiologist', requiredMajor: 'major_kinesiology' }, { roleKey: 'role_marketing_lead', requiredMajor: 'major_marketing' } ], upgradeSlots: [] },
    'agriculture_t1': { id: 'agriculture_t1', type: 'agriculture', tier: 1, nameKey: 'business_agriculture_t1_name', cost: 60000, baseRevenue: 10000, costOfGoodsSold: 0.6, fixedMonthlyCost: 1500, slots: [ { roleKey: 'role_general_laborer', requiredMajor: 'Unskilled' }, { roleKey: 'role_farm_manager', requiredMajor: 'major_agriculture' } ], upgradeSlots: [] },
    'agriculture_t2': { id: 'agriculture_t2', type: 'agriculture', tier: 2, nameKey: 'business_agriculture_t2_name', cost: 280000, baseRevenue: 40000, costOfGoodsSold: 0.6, fixedMonthlyCost: 10000, slots: [ { roleKey: 'role_agronomist', requiredMajor: 'major_agriculture' }, { roleKey: 'role_manager', requiredMajor: 'major_business' }, { roleKey: 'role_machine_maintenance', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'agriculture_t3': { id: 'agriculture_t3', type: 'agriculture', tier: 3, nameKey: 'business_agriculture_t3_name', cost: 1300000, baseRevenue: 180000, costOfGoodsSold: 0.6, fixedMonthlyCost: 40000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_agricultural_engineer', requiredMajor: 'major_agriculture' }, { roleKey: 'role_researcher', requiredMajor: 'major_agriculture' }, { roleKey: 'role_supply_chain_manager', requiredMajor: 'major_logistics' } ], upgradeSlots: [] },
    'logistics_t1': { id: 'logistics_t1', type: 'logistics', tier: 1, nameKey: 'business_logistics_t1_name', cost: 90000, baseRevenue: 11000, costOfGoodsSold: 0.3, fixedMonthlyCost: 3500, slots: [ { roleKey: 'role_stocker', requiredMajor: 'Unskilled' }, { roleKey: 'role_forklift_operator', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'logistics_t2': { id: 'logistics_t2', type: 'logistics', tier: 2, nameKey: 'business_logistics_t2_name', cost: 380000, baseRevenue: 48000, costOfGoodsSold: 0.3, fixedMonthlyCost: 14000, slots: [ { roleKey: 'role_warehouse_manager', requiredMajor: 'major_logistics' }, { roleKey: 'role_logistics_coordinator', requiredMajor: 'major_logistics' }, { roleKey: 'role_admin_staff', requiredMajor: 'Unskilled' } ], upgradeSlots: [] },
    'logistics_t3': { id: 'logistics_t3', type: 'logistics', tier: 3, nameKey: 'business_logistics_t3_name', cost: 1400000, baseRevenue: 190000, costOfGoodsSold: 0.3, fixedMonthlyCost: 50000, slots: [ { roleKey: 'role_director', requiredMajor: 'major_business' }, { roleKey: 'role_supply_chain_manager', requiredMajor: 'major_logistics' }, { roleKey: 'role_it_support', requiredMajor: 'major_technology' }, { roleKey: 'role_senior_manager', requiredMajor: 'major_business' } ], upgradeSlots: [] },
};

export const ASSET_DEFINITIONS: Record<string, AssetDefinition> = {
    // NOTE: Add actual image paths for these assets in public/asset/assets/
    // For now, using a placeholder image.
    // Housing
    'housing_1': { id: 'housing_1', type: AssetType.Housing, tier: 1, nameKey: 'asset_housing_1_name', descriptionKey: 'asset_housing_1_desc', cost: 100000, effects: { happiness: 0.01 }, imageSrc: '../public/asset/housing_1.webp' },
    'housing_2': { id: 'housing_2', type: AssetType.Housing, tier: 2, nameKey: 'asset_housing_2_name', descriptionKey: 'asset_housing_2_desc', cost: 300000, effects: { happiness: 0.02 }, imageSrc: '../public/asset/housing_2.webp' },
    'housing_3': { id: 'housing_3', type: AssetType.Housing, tier: 3, nameKey: 'asset_housing_3_name', descriptionKey: 'asset_housing_3_desc', cost: 1000000, effects: { happiness: 0.03 }, imageSrc: '../public/asset/housing_3.webp' },
    // Vehicle
    'vehicle_1': { id: 'vehicle_1', type: AssetType.Vehicle, tier: 1, nameKey: 'asset_vehicle_1_name', descriptionKey: 'asset_vehicle_1_desc', cost: 20000, effects: { happiness: 0.01 }, imageSrc: '../public/asset/vehicle_1.webp' },
    'vehicle_2': { id: 'vehicle_2', type: AssetType.Vehicle, tier: 2, nameKey: 'asset_vehicle_2_name', descriptionKey: 'asset_vehicle_2_desc', cost: 80000, effects: { eq: 0.01 }, imageSrc: '../public/asset/vehicle_2.webp' },
    'vehicle_3': { id: 'vehicle_3', type: AssetType.Vehicle, tier: 3, nameKey: 'asset_vehicle_3_name', descriptionKey: 'asset_vehicle_3_desc', cost: 250000, effects: { eq: 0.02 }, imageSrc: '../public/asset/vehicle_3.webp' },
    // Electronics
    'electronics_1': { id: 'electronics_1', type: AssetType.Electronics, tier: 1, nameKey: 'asset_electronics_1_name', descriptionKey: 'asset_electronics_1_desc', cost: 1000, effects: { iq: 0.01 }, imageSrc: '../public/asset/electronics_1.webp' },
    'electronics_2': { id: 'electronics_2', type: AssetType.Electronics, tier: 2, nameKey: 'asset_electronics_2_name', descriptionKey: 'asset_electronics_2_desc', cost: 5000, effects: { happiness: 0.01 }, imageSrc: '../public/asset/electronics_2.webp' },
    'electronics_3': { id: 'electronics_3', type: AssetType.Electronics, tier: 3, nameKey: 'asset_electronics_3_name', descriptionKey: 'asset_electronics_3_desc', cost: 15000, effects: { happiness: 0.02 }, imageSrc: '../public/asset/electronics_3.webp' },
    // Art
    'art_1': { id: 'art_1', type: AssetType.Art, tier: 1, nameKey: 'asset_art_1_name', descriptionKey: 'asset_art_1_desc', cost: 5000, effects: { iq: 0.01 }, imageSrc: '../public/asset/art_1.webp' },
    'art_2': { id: 'art_2', type: AssetType.Art, tier: 2, nameKey: 'asset_art_2_name', descriptionKey: 'asset_art_2_desc', cost: 50000, effects: { iq: 0.02 }, imageSrc: '../public/asset/art_2.webp' },
    'art_3': { id: 'art_3', type: AssetType.Art, tier: 3, nameKey: 'asset_art_3_name', descriptionKey: 'asset_art_3_desc', cost: 200000, effects: { iq: 0.03 }, imageSrc: '../public/asset/art_3.webp' },
    // Jewelry
    'jewelry_1': { id: 'jewelry_1', type: AssetType.Jewelry, tier: 1, nameKey: 'asset_jewelry_1_name', descriptionKey: 'asset_jewelry_1_desc', cost: 2000, effects: { eq: 0.01 }, imageSrc: '../public/asset/jewelry_1.webp' },
    'jewelry_2': { id: 'jewelry_2', type: AssetType.Jewelry, tier: 2, nameKey: 'asset_jewelry_2_name', descriptionKey: 'asset_jewelry_2_desc', cost: 25000, effects: { eq: 0.02 }, imageSrc: '../public/asset/jewelry_2.webp' },
    'jewelry_3': { id: 'jewelry_3', type: AssetType.Jewelry, tier: 3, nameKey: 'asset_jewelry_3_name', descriptionKey: 'asset_jewelry_3_desc', cost: 100000, effects: { eq: 0.03 }, imageSrc: '../public/asset/jewelry_3.webp' },
    // Furniture
    'furniture_1': { id: 'furniture_1', type: AssetType.Furniture, tier: 1, nameKey: 'asset_furniture_1_name', descriptionKey: 'asset_furniture_1_desc', cost: 10000, effects: { happiness: 0.01 }, imageSrc: '../public/asset/furniture_1.webp' },
    'furniture_2': { id: 'furniture_2', type: AssetType.Furniture, tier: 2, nameKey: 'asset_furniture_2_name', descriptionKey: 'asset_furniture_2_desc', cost: 40000, effects: { happiness: 0.02 }, imageSrc: '../public/asset/furniture_2.webp' },
    'furniture_3': { id: 'furniture_3', type: AssetType.Furniture, tier: 3, nameKey: 'asset_furniture_3_name', descriptionKey: 'asset_furniture_3_desc', cost: 150000, effects: { happiness: 0.03 }, imageSrc: '../public/asset/furniture_3.webp' },
    // Library
    'library_1': { id: 'library_1', type: AssetType.Library, tier: 1, nameKey: 'asset_library_1_name', descriptionKey: 'asset_library_1_desc', cost: 3000, effects: { iq: 0.01 }, imageSrc: '../public/asset/library_1.webp' },
    'library_2': { id: 'library_2', type: AssetType.Library, tier: 2, nameKey: 'asset_library_2_name', descriptionKey: 'asset_library_2_desc', cost: 20000, effects: { iq: 0.02 }, imageSrc: '../public/asset/library_2.webp' },
    'library_3': { id: 'library_3', type: AssetType.Library, tier: 3, nameKey: 'asset_library_3_name', descriptionKey: 'asset_library_3_desc', cost: 80000, effects: { iq: 0.03 }, imageSrc: '../public/asset/library_3.webp' },
    // Gym
    'gym_1': { id: 'gym_1', type: AssetType.Gym, tier: 1, nameKey: 'asset_gym_1_name', descriptionKey: 'asset_gym_1_desc', cost: 1500, effects: { health: 0.01 }, imageSrc: '../public/asset/gym_1.webp' },
    'gym_2': { id: 'gym_2', type: AssetType.Gym, tier: 2, nameKey: 'asset_gym_2_name', descriptionKey: 'asset_gym_2_desc', cost: 8000, effects: { health: 0.02 }, imageSrc: '../public/asset/gym_2.webp' },
    'gym_3': { id: 'gym_3', type: AssetType.Gym, tier: 3, nameKey: 'asset_gym_3_name', descriptionKey: 'asset_gym_3_desc', cost: 30000, effects: { health: 0.03 }, imageSrc: '../public/asset/gym_3.webp' },
    // Music
    'music_1': { id: 'music_1', type: AssetType.Music, tier: 1, nameKey: 'asset_music_1_name', descriptionKey: 'asset_music_1_desc', cost: 500, effects: { happiness: 0.01 }, imageSrc: '../public/asset/music_1.webp' },
    'music_2': { id: 'music_2', type: AssetType.Music, tier: 2, nameKey: 'asset_music_2_name', descriptionKey: 'asset_music_2_desc', cost: 10000, effects: { happiness: 0.02 }, imageSrc: '../public/asset/music_2.webp' },
    'music_3': { id: 'music_3', type: AssetType.Music, tier: 3, nameKey: 'asset_music_3_name', descriptionKey: 'asset_music_3_desc', cost: 50000, effects: { happiness: 0.03 }, imageSrc: '../public/asset/music_3.webp' },
    // Vacation
    'vacation_1': { id: 'vacation_1', type: AssetType.Vacation, tier: 1, nameKey: 'asset_vacation_1_name', descriptionKey: 'asset_vacation_1_desc', cost: 120000, effects: { happiness: 0.01 }, imageSrc: '../public/asset/vacation_1.webp' },
    'vacation_2': { id: 'vacation_2', type: AssetType.Vacation, tier: 2, nameKey: 'asset_vacation_2_name', descriptionKey: 'asset_vacation_2_desc', cost: 400000, effects: { happiness: 0.02 }, imageSrc: '../public/asset/vacation_2.webp' },
    'vacation_3': { id: 'vacation_3', type: AssetType.Vacation, tier: 3, nameKey: 'asset_vacation_3_name', descriptionKey: 'asset_vacation_3_desc', cost: 2500000, effects: { happiness: 0.03 }, imageSrc: '../public/asset/vacation_3.webp' },
};

// ==============================
// UNLOCK THRESHOLDS
// ==============================
export const BUSINESS_UNLOCK_CHILDREN_COUNT = 10;
export const CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT = 1;
export const TWIN_BIRTH_UNLOCK_CHILDREN_COUNT = 2;
export const TRIPLET_BIRTH_UNLOCK_CHILDREN_COUNT = 3;



export const UNLOCKABLE_FEATURES: UnlockableFeature[] = [
  {
    id: 'business',
    nameKey: 'unlock_business_name',
    descriptionKey: 'unlock_business_desc',
    childrenRequired: BUSINESS_UNLOCK_CHILDREN_COUNT,
  },
  {
    id: 'custom_avatar',
    nameKey: 'unlock_custom_avatar_name',
    descriptionKey: 'unlock_custom_avatar_desc',
    childrenRequired: CUSTOM_AVATAR_UNLOCK_CHILDREN_COUNT,
  },
  {
    id: 'twins',
    nameKey: 'unlock_twins_name',
    descriptionKey: 'unlock_twins_desc',
    childrenRequired: TWIN_BIRTH_UNLOCK_CHILDREN_COUNT,
  },
  {
    id: 'triplets',
    nameKey: 'unlock_triplets_name',
    descriptionKey: 'unlock_triplets_desc',
    childrenRequired: TRIPLET_BIRTH_UNLOCK_CHILDREN_COUNT,
  },
    { id: 'milestone_0', nameKey: 'milestone_0_name', descriptionKey: 'milestone_0_desc', childrenRequired: 0 },
    { id: 'milestone_5', nameKey: 'milestone_5_name', descriptionKey: 'milestone_5_desc', childrenRequired: 5 },
    { id: 'milestone_15', nameKey: 'milestone_15_name', descriptionKey: 'milestone_15_desc', childrenRequired: 15 },
    { id: 'milestone_20', nameKey: 'milestone_20_name', descriptionKey: 'milestone_20_desc', childrenRequired: 20 },
    { id: 'milestone_25', nameKey: 'milestone_25_name', descriptionKey: 'milestone_25_desc', childrenRequired: 25 },
    { id: 'milestone_30', nameKey: 'milestone_30_name', descriptionKey: 'milestone_30_desc', childrenRequired: 30 },
    { id: 'milestone_35', nameKey: 'milestone_35_name', descriptionKey: 'milestone_35_desc', childrenRequired: 35 },
    { id: 'milestone_40', nameKey: 'milestone_40_name', descriptionKey: 'milestone_40_desc', childrenRequired: 40 },
    { id: 'milestone_45', nameKey: 'milestone_45_name', descriptionKey: 'milestone_45_desc', childrenRequired: 45 },
    { id: 'milestone_50', nameKey: 'milestone_50_name', descriptionKey: 'milestone_50_desc', childrenRequired: 50 },
    { id: 'milestone_55', nameKey: 'milestone_55_name', descriptionKey: 'milestone_55_desc', childrenRequired: 55 },
    { id: 'milestone_60', nameKey: 'milestone_60_name', descriptionKey: 'milestone_60_desc', childrenRequired: 60 },
    { id: 'milestone_65', nameKey: 'milestone_65_name', descriptionKey: 'milestone_65_desc', childrenRequired: 65 },
    { id: 'milestone_70', nameKey: 'milestone_70_name', descriptionKey: 'milestone_70_desc', childrenRequired: 70 },
    { id: 'milestone_75', nameKey: 'milestone_75_name', descriptionKey: 'milestone_75_desc', childrenRequired: 75 },
    { id: 'milestone_80', nameKey: 'milestone_80_name', descriptionKey: 'milestone_80_desc', childrenRequired: 80 },
    { id: 'milestone_85', nameKey: 'milestone_85_name', descriptionKey: 'milestone_85_desc', childrenRequired: 85 },
    { id: 'milestone_90', nameKey: 'milestone_90_name', descriptionKey: 'milestone_90_desc', childrenRequired: 90 },
    { id: 'milestone_95', nameKey: 'milestone_95_name', descriptionKey: 'milestone_95_desc', childrenRequired: 95 },
    { id: 'milestone_100', nameKey: 'milestone_100_name', descriptionKey: 'milestone_100_desc', childrenRequired: 100 },
];

export type PathNode = {
  level: number;
  featureId: string;
  alignment: 'left' | 'right';
};

export const PATH_NODES: PathNode[] = [
    { level: 0, featureId: 'milestone_0', alignment: 'left' },
    { level: 1, featureId: 'custom_avatar', alignment: 'right' },
    { level: 2, featureId: 'twins', alignment: 'left' },
    { level: 3, featureId: 'triplets', alignment: 'right' },
    { level: 5, featureId: 'milestone_5', alignment: 'left' },
    { level: 10, featureId: 'business', alignment: 'right' },
    { level: 15, featureId: 'milestone_15', alignment: 'left' },
    { level: 20, featureId: 'milestone_20', alignment: 'right' },
    { level: 25, featureId: 'milestone_25', alignment: 'left' },
    { level: 30, featureId: 'milestone_30', alignment: 'right' },
    { level: 35, featureId: 'milestone_35', alignment: 'left' },
    { level: 40, featureId: 'milestone_40', alignment: 'right' },
    { level: 45, featureId: 'milestone_45', alignment: 'left' },
    { level: 50, featureId: 'milestone_50', alignment: 'right' },
    { level: 55, featureId: 'milestone_55', alignment: 'left' },
    { level: 60, featureId: 'milestone_60', alignment: 'right' },
    { level: 65, featureId: 'milestone_65', alignment: 'left' },
    { level: 70, featureId: 'milestone_70', alignment: 'right' },
    { level: 75, featureId: 'milestone_75', alignment: 'left' },
    { level: 80, featureId: 'milestone_80', alignment: 'right' },
    { level: 85, featureId: 'milestone_85', alignment: 'left' },
    { level: 90, featureId: 'milestone_90', alignment: 'right' },
    { level: 95, featureId: 'milestone_95', alignment: 'left' },
    { level: 100, featureId: 'milestone_100', alignment: 'right' },
].sort((a, b) => a.level - b.level);

export const PATH_NODES_SORTED: PathNode[] = [...PATH_NODES].sort((a, b) => a.level - b.level); // Luôn sắp xếp theo level


export const BUSINESS_MAP_LOCATIONS: Record<string, { x: number; y: number; width: number; height: number; buildingType: string }> = {
    // Medical District
    'medicine_t1': { x: 1556, y: 1800, width: 150, height: 120, buildingType: 'clinic' },
    'medicine_t2': { x: 2078, y: 1571, width: 200, height: 180, buildingType: 'hospital' },
    'medicine_t3': { x: 2568, y: 1334, width: 250, height: 220, buildingType: 'research_center' },

    // Financial District
    'finance_t1': { x: 672, y: 1362, width: 180, height: 180, buildingType: 'financeFirm' },
    'finance_t2': { x: 1180, y: 1126, width: 200, height: 220, buildingType: 'skyscraper' },
    'finance_t3': { x: 1683, y: 909, width: 220, height: 260, buildingType: 'skyscraper_large' },

    // Commercial / Retail Area
    'culinary_t1': { x: 710, y: 1629, width: 220, height: 200, buildingType: 'restaurant' },
    'culinary_t2': { x: 1238, y: 1389, width: 250, height: 220, buildingType: 'restaurant_fancy' },
    'culinary_t3': { x: 1730, y: 1160, width: 300, height: 250, buildingType: 'hotel' },
    'logistics_t1': { x: 1011, y: 1771, width: 150, height: 130, buildingType: 'miniMart' },
    'logistics_t2': { x: 1526, y: 1532, width: 350, height: 180, buildingType: 'warehouse' },
    'logistics_t3': { x: 2048, y: 1300, width: 500, height: 250, buildingType: 'port' },
    
    // Tech & Arts Hub
    'technology_t1': { x: 402, y: 1230, width: 180, height: 180, buildingType: 'techStartup' },
    'technology_t2': { x: 896, y: 995, width: 200, height: 190, buildingType: 'tech_office' },
    'technology_t3': { x: 1413, y: 766, width: 280, height: 240, buildingType: 'tech_campus' },
    'arts_t1': { x: 388, y: 1482, width: 180, height: 180, buildingType: 'publisher' },
    'arts_t2': { x: 956, y: 1238, width: 160, height: 220, buildingType: 'studio' },
    'arts_t3': { x: 1455, y: 1023, width: 200, height: 260, buildingType: 'publisher_large' },
    'marketing_t1': { x: 125, y: 1353, width: 180, height: 150, buildingType: 'agency' },
    'marketing_t2': { x: 650, y: 1107, width: 200, height: 180, buildingType: 'agency_modern' },
    'marketing_t3': { x: 1189, y: 876, width: 200, height: 250, buildingType: 'skyscraper' },

    // Industrial & Utility Zone
    'engineering_t1': { x: 976, y: 1506, width: 160, height: 140, buildingType: 'workshop' },
    'engineering_t2': { x: 1480, y: 1280, width: 250, height: 180, buildingType: 'factory' },
    'engineering_t3': { x: 2000, y: 1037, width: 300, height: 200, buildingType: 'factory_large' },

    // Recreation & Agriculture
    'kinesiology_t1': { x: 1325, y: 1656, width: 180, height: 160, buildingType: 'gym' },
    'kinesiology_t2': { x: 1774, y: 1420, width: 350, height: 150, buildingType: 'swimmingPool' },
    'kinesiology_t3': { x: 2274, y: 1201, width: 400, height: 300, buildingType: 'stadium' },
    'agriculture_t1': { x: 1325, y: 1908, width: 250, height: 200, buildingType: 'farm' },
    'agriculture_t2': { x: 1797, y: 1676, width: 300, height: 220, buildingType: 'farm_large' },
    'agriculture_t3': { x: 2337, y: 1447, width: 320, height: 250, buildingType: 'agritech' },
};
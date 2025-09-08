import type { GameState, Character, Pet, GameScenario, Club, Language, PurchasedAsset } from './types';
import { LifePhase, CharacterStatus, RelationshipStatus, Gender, PetType, exampleManifest } from './types';
import { INITIAL_FUNDS, UNIVERSITY_MAJORS } from './constants';
import { createInitialCharacter, generateName, generateRandomAvatar, addDays } from './utils';
import { randomUUID } from 'expo-crypto';

const createClassicState = (initialYear: number, lang: Language): GameState => {
    const firstCharacter = createInitialCharacter(initialYear, lang, exampleManifest);
    const initialDate = { day: 1, year: initialYear };
    return {
        familyMembers: { [firstCharacter.id]: firstCharacter },
        familyFund: INITIAL_FUNDS,
        purchasedAssets: {},
        familyPets: {},
        familyBusinesses: {},
        currentDate: initialDate,
        gameLog: [{ year: initialYear, messageKey: 'log_first_generation', replacements: { name: firstCharacter.name } }],
        gameOverReason: null,
        activeEvent: null,
        pendingSchoolChoice: null,
        pendingUniversityChoice: null,
        pendingMajorChoice: null,
        pendingClubChoice: null,
        pendingCareerChoice: null,
        pendingLoanChoice: null,
        pendingPromotion: null,
        activeLoans: [],
        eventQueue: [],
        highestEducation: "None",
        highestCareer: "Unemployed",
        totalMembers: 1,
        monthlyNetChange: 0,
        eventCooldownUntil: addDays(initialDate, 30),
        lang: lang,
        contentVersion: 1,
    };
};

const createAloneState = (initialYear: number, lang: Language): GameState => {
    const gender = Math.random() < 0.5 ? Gender.Male : Gender.Female;
    const major = UNIVERSITY_MAJORS[Math.floor(Math.random() * UNIVERSITY_MAJORS.length)];
    const age = 24;
    const character: Character = {
        id: randomUUID(),
        name: generateName(gender, lang),
        gender,
        generation: 1,
        birthDate: { day: 1, year: initialYear - age },
        age: age,
        isAlive: true,
        deathDate: null,
        stats: {
            iq: Math.floor(Math.random() * 101),
            happiness: Math.floor(Math.random() * 101),
            eq: Math.floor(Math.random() * 101),
            health: 30 + Math.floor(Math.random() * 71),
            skill: 10 + Math.floor(Math.random() * 21),
        },
        phase: LifePhase.PostGraduation,
        education: `University (${major.nameKey})`,
        major: major.nameKey,
        careerTrack: null,
        careerLevel: 0,
        status: CharacterStatus.Unemployed,
        statusEndYear: null,
        relationshipStatus: RelationshipStatus.Single,
        partnerId: null,
        childrenIds: [],
        parentsIds: [],
        isPlayerCharacter: true,
        mourningUntilYear: null,
        monthlyNetIncome: 0,
        eventsThisYear: 0,
        petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(exampleManifest, age, gender),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const initialDate = { day: 1, year: initialYear };
    return {
        familyMembers: { [character.id]: character },
        familyFund: 50000,
        purchasedAssets: {},
        familyPets: {},
        familyBusinesses: {},
        currentDate: initialDate,
        gameLog: [{ year: initialYear, messageKey: 'log_alone_start', replacements: { name: character.name } }],
        gameOverReason: null, activeEvent: null, pendingSchoolChoice: null,
        pendingUniversityChoice: null, pendingMajorChoice: null,
        pendingClubChoice: null,
        pendingCareerChoice: { characterId: character.id, options: ['job', 'internship', 'vocational'] },
        pendingLoanChoice: null,
        pendingPromotion: null,
        activeLoans: [],
        eventQueue: [], highestEducation: character.education,
        highestCareer: "Unemployed", totalMembers: 1,
        monthlyNetChange: 0,
        eventCooldownUntil: addDays(initialDate, 30),
        lang: lang,
        contentVersion: 1,
    };
};

const createMilaFamilyState = (initialYear: number, lang: Language): GameState => {
    const milaId = randomUUID();
    const maxId = randomUUID();
    const aliceId = randomUUID();
    const lucasId = randomUUID();
    const daisyId = randomUUID();
    const mioId = randomUUID();

    const mila: Character = {
        id: milaId, name: 'Mila', gender: Gender.Female, generation: 1,
        birthDate: { day: 1, year: initialYear - 23 }, age: 23, isAlive: true, deathDate: null,
        stats: { iq: 95, happiness: 85, eq: 90, health: 80, skill: 70 },
        phase: LifePhase.PostGraduation,
        education: 'University (major_business)', major: 'major_business', careerTrack: 'Business', careerLevel: 2,
        status: CharacterStatus.Working, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married, partnerId: maxId,
        childrenIds: [aliceId, lucasId, daisyId], parentsIds: [], isPlayerCharacter: true,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: mioId,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: null,
        staticAvatarUrl: require('../public/asset/mila.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const max: Character = {
        id: maxId, name: 'Max', gender: Gender.Male, generation: 1,
        birthDate: { day: 1, year: initialYear - 23 }, age: 23, isAlive: true, deathDate: null,
        stats: { iq: 85, happiness: 95, eq: 85, health: 95, skill: 80 },
        phase: LifePhase.PostGraduation,
        education: 'University (major_technology)', major: 'major_technology', careerTrack: 'Technology', careerLevel: 2,
        status: CharacterStatus.Working, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married, partnerId: milaId,
        childrenIds: [aliceId, lucasId, daisyId], parentsIds: [], isPlayerCharacter: false,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: null,
        staticAvatarUrl: require('../public/asset/max.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const alice: Character = {
        id: aliceId, name: 'Alice', gender: Gender.Female, generation: 2,
        birthDate: { day: 1, year: initialYear - 7 }, age: 7, isAlive: true, deathDate: null,
        stats: { iq: 120, happiness: 80, eq: 75, health: 70, skill: 65 },
        phase: LifePhase.Elementary,
        education: 'school_public', major: null, careerTrack: null, careerLevel: 0,
        status: CharacterStatus.InEducation, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Single, partnerId: null, childrenIds: [],
        parentsIds: [milaId, maxId], isPlayerCharacter: true,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: null,
        staticAvatarUrl: require('../public/asset/alice.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const lucas: Character = {
        id: lucasId, name: 'Lucas', gender: Gender.Male, generation: 2,
        birthDate: { day: 1, year: initialYear - 7 }, age: 7, isAlive: true, deathDate: null,
        stats: { iq: 130, happiness: 75, eq: 80, health: 85, skill: 95 },
        phase: LifePhase.Elementary,
        education: 'school_public', major: null, careerTrack: null, careerLevel: 0,
        status: CharacterStatus.InEducation, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Single, partnerId: null, childrenIds: [],
        parentsIds: [milaId, maxId], isPlayerCharacter: true,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: null,
        staticAvatarUrl: require('../public/asset/lucas.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const daisy: Character = {
        id: daisyId, name: 'Daisy', gender: Gender.Female, generation: 2,
        birthDate: { day: 1, year: initialYear - 1 }, age: 1, isAlive: true, deathDate: null,
        stats: { iq: 100, happiness: 85, eq: 90, health: 80, skill: 85 },
        phase: LifePhase.Newborn,
        education: 'None', major: null, careerTrack: null, careerLevel: 0,
        status: CharacterStatus.Idle, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Single, partnerId: null, childrenIds: [],
        parentsIds: [milaId, maxId], isPlayerCharacter: true,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: null,
        staticAvatarUrl: require('../public/asset/daisy.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
    const mio: Pet = {
        id: mioId, name: 'Mio', type: PetType.Dog, ownerId: milaId, age: 2,
    };
    const initialDate = { day: 1, year: initialYear };

    return {
        familyMembers: { [mila.id]: mila, [max.id]: max, [alice.id]: alice, [lucas.id]: lucas, [daisy.id]: daisy },
        familyFund: 75000,
        purchasedAssets: {},
        familyPets: { [mio.id]: mio },
        familyBusinesses: {},
        currentDate: initialDate,
        gameLog: [{ year: initialYear, messageKey: "log_mila_start" }],
        gameOverReason: null, activeEvent: null, pendingSchoolChoice: null,
        pendingUniversityChoice: null, pendingMajorChoice: null, pendingCareerChoice: null,
        pendingClubChoice: null,
        pendingLoanChoice: null,
        pendingPromotion: null,
        activeLoans: [],
        eventQueue: [], highestEducation: "University",
        highestCareer: "Junior Analyst", totalMembers: 5,
        monthlyNetChange: 0,
        eventCooldownUntil: addDays(initialDate, 30),
        lang: lang,
        contentVersion: 1,
    };
};


export const SCENARIOS: GameScenario[] = [
    {
        id: 'classic',
        nameKey: 'scenario_classic_name',
        descriptionKey: 'scenario_classic_desc',
        themeColor: 'indigo',
        createInitialState: createClassicState,
    },
    {
        id: 'alone',
        nameKey: 'scenario_alone_name',
        descriptionKey: 'scenario_alone_desc',
        themeColor: 'green',
        createInitialState: createAloneState,
    },
    {
        id: 'mila',
        nameKey: 'scenario_mila_name',
        descriptionKey: 'scenario_mila_desc',
        themeColor: 'pink',
        createInitialState: createMilaFamilyState,
    },
];
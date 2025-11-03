import type { GameState, Character, Pet, GameScenario, Language } from './types';
import { LifePhase, CharacterStatus, RelationshipStatus, Gender, PetType, exampleManifest } from './types';
import { INITIAL_FUNDS, UNIVERSITY_MAJORS, CAREER_LADDER } from './constants';
import { createInitialCharacter, generateName, generateRandomAvatar, addDays } from './utils';
import { randomUUID } from 'expo-crypto';

const createClassicState = (initialYear: number, lang: Language): GameState => {
    const husbandAge = 24;
    const wifeAge = 24;
    const careerTracks = Object.keys(CAREER_LADDER);

    const husbandMajor = UNIVERSITY_MAJORS[Math.floor(Math.random() * UNIVERSITY_MAJORS.length)];
    const husbandCareerTrack = careerTracks[Math.floor(Math.random() * careerTracks.length)];
    const husbandId = randomUUID();
    const wifeId = randomUUID();

    const husband: Character = {
        id: husbandId,
        name: generateName(Gender.Male, lang),
        gender: Gender.Male,
        generation: 0,
        birthDate: { day: 1, year: initialYear - husbandAge },
        age: husbandAge,
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
        education: `University (${husbandMajor.nameKey})`,
        major: husbandMajor.nameKey,
        careerTrack: husbandCareerTrack,
        careerLevel: 0,
        status: CharacterStatus.Working,
        statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married,
        partnerId: wifeId,
        childrenIds: [],
        parentsIds: [],
        isPlayerCharacter: true,
        mourningUntilYear: null,
        monthlyNetIncome: 0,
        eventsThisYear: 0,
        petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(exampleManifest, husbandAge, Gender.Male),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };

    const wifeMajor = UNIVERSITY_MAJORS[Math.floor(Math.random() * UNIVERSITY_MAJORS.length)];
    const wifeCareerTrack = careerTracks[Math.floor(Math.random() * careerTracks.length)];

    const wife: Character = {
        id: wifeId,
        name: generateName(Gender.Female, lang),
        gender: Gender.Female,
        generation: 0,
        birthDate: { day: 1, year: initialYear - wifeAge },
        age: wifeAge,
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
        education: `University (${wifeMajor.nameKey})`,
        major: wifeMajor.nameKey,
        careerTrack: wifeCareerTrack,
        careerLevel: 0,
        status: CharacterStatus.Working,
        statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married,
        partnerId: husbandId,
        childrenIds: [],
        parentsIds: [],
        isPlayerCharacter: false,
        mourningUntilYear: null,
        monthlyNetIncome: 0,
        eventsThisYear: 0,
        petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(exampleManifest, wifeAge, Gender.Female),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };

    const initialDate = { day: 1, year: initialYear };
    return {
        familyMembers: { [husband.id]: husband, [wife.id]: wife },
        familyFund: 75000,
        purchasedAssets: {},
        familyPets: {},
        familyBusinesses: {},
        currentDate: initialDate,
        gameLog: [{ year: initialYear, messageKey: 'log_couple_start', replacements: { husbandName: husband.name, wifeName: wife.name } }],
        gameOverReason: null, activeEvent: null, pendingSchoolChoice: null,
        pendingUniversityChoice: null, pendingMajorChoice: null,
        pendingClubChoice: null,
        pendingCareerChoice: null,
        pendingLoanChoice: null,
        pendingPromotion: null,
        activeLoans: [],
        eventQueue: [], 
        highestEducation: husband.education,
        highestCareer: husband.careerTrack,
        totalMembers: 2,
        monthlyNetChange: 0,
        eventCooldownUntil: addDays(initialDate, 30),
        lang: lang,
        contentVersion: 1,
        familyName: 'Family',
        totalChildrenBorn: 0,
        claimedFeatures: [],
        newlyUnlockedFeature: null,
        avatarCustomizationCount: 0,
        familySizeStatic: 2,
        scheduler: null,
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
        id: milaId, name: 'Mila', gender: Gender.Female, generation: 0,
        birthDate: { day: 1, year: initialYear - 31 }, age: 31, isAlive: true, deathDate: null,
        stats: { iq: 95, happiness: 85, eq: 90, health: 80, skill: 70 },
        phase: LifePhase.PostGraduation,
        education: 'University (major_business)', major: 'major_business', careerTrack: 'Business', careerLevel: 2,
        status: CharacterStatus.Working, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married, partnerId: maxId,
        childrenIds: [aliceId, lucasId, daisyId], parentsIds: [], isPlayerCharacter: true,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: mioId,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: {},
        staticAvatarUrl: require('../assets/mila.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };
    const max: Character = {
        id: maxId, name: 'Max', gender: Gender.Male, generation: 0,
        birthDate: { day: 1, year: initialYear - 31 }, age: 31, isAlive: true, deathDate: null,
        stats: { iq: 85, happiness: 95, eq: 85, health: 95, skill: 80 },
        phase: LifePhase.PostGraduation,
        education: 'University (major_technology)', major: 'major_technology', careerTrack: 'Technology', careerLevel: 2,
        status: CharacterStatus.Working, statusEndYear: null,
        relationshipStatus: RelationshipStatus.Married, partnerId: milaId,
        childrenIds: [aliceId, lucasId, daisyId], parentsIds: [], isPlayerCharacter: false,
        mourningUntilYear: null, monthlyNetIncome: 0, eventsThisYear: 0, petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: {},
        staticAvatarUrl: require('../assets/max.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };
    const alice: Character = {
        id: aliceId, name: 'Alice', gender: Gender.Female, generation: 1,
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
        avatarState: {},
        staticAvatarUrl: require('../assets/alice.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };
    const lucas: Character = {
        id: lucasId, name: 'Lucas', gender: Gender.Male, generation: 1,
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
        avatarState: {},
        staticAvatarUrl: require('../assets/lucas.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
    };
    const daisy: Character = {
        id: daisyId, name: 'Daisy', gender: Gender.Female, generation: 1,
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
        avatarState: {},
        staticAvatarUrl: require('../assets/daisy.png'),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
        monthsUnemployed: 0,
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
        familyName: 'Mila Family',
        totalChildrenBorn: 3,
        claimedFeatures: [],
        newlyUnlockedFeature: null,
        avatarCustomizationCount: 0,
        familySizeStatic: 5,
        scheduler: null,
    };
};


export const SCENARIOS: GameScenario[] = [
    {
        id: 'classic',
        nameKey: 'scenario_classic_name',
        descriptionKey: 'scenario_classic_desc',
        themeColor: 'green',
        createInitialState: createClassicState,
    },
    {
        id: 'mila',
        nameKey: 'scenario_mila_name',
        descriptionKey: 'scenario_mila_desc',
        themeColor: 'pink',
        createInitialState: createMilaFamilyState,
    },
];
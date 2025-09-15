import { Gender, LifePhase, Character, Stats, CharacterStatus, RelationshipStatus, Manifest, AvatarState, Business, Language } from './types';
import { LIFE_PHASE_AGES, CAREER_LADDER, UNIVERSITY_MAJORS, DAYS_IN_YEAR, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, BUSINESS_WORKER_BASE_SALARY_MONTHLY, BUSINESS_WORKER_SKILL_MULTIPLIER, AVATAR_COLOR_PALETTE } from './constants';
import { t } from './localization';

import { CLUBS } from './clubsAndEventsData';

const MALE_NAMES_EN = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kevin"];
const FEMALE_NAMES_EN = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle"];

const MALE_NAMES_VI = ["Hùng", "Dũng", "Mạnh", "Bảo", "Long", "Minh", "Khang", "Quân", "Phúc", "Thành", "Trung", "Tuấn", "Việt", "Sơn", "Huy", "Phong", "An", "Khoa", "Hải", "Nam"];
const FEMALE_NAMES_VI = ["Linh", "Trang", "Mai", "Hương", "Hà", "Thu", "Ngọc", "Anh", "Quỳnh", "Thảo", "Nga", "Lan", "Phương", "Dung", "Hạnh", "Hoa", "Chi", "Oanh", "Ngân", "Quyên"];


function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(rng: () => number, arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

type AgeCategory = 'baby' | 'normal' | 'old';
function ageCategoryFromAge(age: number): AgeCategory {
  if (age <= 5) return 'baby';
  if (age <= 59) return 'normal';
  return 'old';
}

export function generateRandomAvatar(manifest: Manifest, age: number, gender: Gender): AvatarState {
    const seed = Date.now() + Math.random() * 10000;
    const rng = mulberry32(seed);
    const next: AvatarState = {};
    const ageCategory = ageCategoryFromAge(age);

    for (const layer of manifest) {
      if (layer.key === 'beard' && (gender === Gender.Female || age < 18)) {
        next.beard = null;
        continue;
      }
      if (layer.key === 'backHair' && gender === Gender.Male) {
        next.backHair = null;
        continue;
      }

      let optionsPool = layer.options;
      // Filter options for the 'features' layer based on age category
      if (layer.key === 'features') {
          optionsPool = layer.options.filter(o => o.ageCategory === ageCategory);
      }

      const pool = layer.allowNone
        ? [null, ...optionsPool.map((o) => o.id)]
        : optionsPool.map((o) => o.id);
      
      let picked: string | null | undefined = pickRandom(rng, pool as (string | null)[]);
      
      if (picked === undefined && layer.required) {
          picked = optionsPool[0]?.id ?? null;
      }

      next[layer.key] = picked ?? null;
    }

    // Assign random colors individually
    const safeColorPalette = AVATAR_COLOR_PALETTE.filter(c => c.name !== 'White');
    const hairColor = pickRandom(rng, safeColorPalette)?.name || 'Natural Gray';
    if (next.backHair) next.backHairColor = hairColor;
    if (next.frontHair) next.frontHairColor = hairColor;

    if (next.eyebrows) {
        next.eyebrowsColor = pickRandom(rng, safeColorPalette)?.name || 'Natural Gray';
    }
    if (next.beard) {
        next.beardColor = pickRandom(rng, safeColorPalette)?.name || 'Natural Gray';
    }

    return next;
}


export const generateName = (gender: Gender, lang: Language): string => {
  const isVi = lang === 'vi';
  const maleNames = isVi ? MALE_NAMES_VI : MALE_NAMES_EN;
  const femaleNames = isVi ? FEMALE_NAMES_VI : FEMALE_NAMES_EN;

  const firstName = gender === Gender.Male 
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];

  return firstName;
};

export const calculateNewAdjectiveKey = (character: Character): string => {
  const { stats } = character;
  const possibleAdjectives: string[] = [];
  if (stats.iq > 130) {
    possibleAdjectives.push('adjective_intelligent', 'adjective_brilliant');
  }
  if (stats.happiness > 85) {
    possibleAdjectives.push('adjective_happy', 'adjective_joyful');
  }
  if (stats.eq > 85) {
    possibleAdjectives.push('adjective_confident', 'adjective_brave');
  }
  if (stats.health > 90) {
    possibleAdjectives.push('adjective_healthy', 'adjective_vigorous');
  }

  if (possibleAdjectives.length > 0) {
    return possibleAdjectives[Math.floor(Math.random() * possibleAdjectives.length)];
  }
  
  return 'adjective_normal';
}

export const getCharacterDisplayName = (character: Character, lang: Language): string => {
  const { name, mourningUntilYear, phase, isAlive, displayAdjective } = character;
  
  if (!isAlive) {
    return name;
  }

  // Overriding states first
  if (mourningUntilYear) {
    return `${name} ${t('adjective_grieving', lang)}`.trim();
  }
  
  if (phase === LifePhase.Newborn || phase === LifePhase.Elementary) {
     return `${name} ${t('adjective_innocent', lang)}`.trim();
  }

  const adjectiveKey = displayAdjective?.key || 'adjective_normal';
  
  return `${name} ${t(adjectiveKey, lang)}`.trim();
};

export const getLifePhase = (age: number): LifePhase => {
  if (age <= LIFE_PHASE_AGES.Newborn) return LifePhase.Newborn;
  if (age <= LIFE_PHASE_AGES.Elementary) return LifePhase.Elementary;
  if (age <= LIFE_PHASE_AGES.MiddleSchool) return LifePhase.MiddleSchool;
  if (age <= LIFE_PHASE_AGES.HighSchool) return LifePhase.HighSchool;
  if (age <= LIFE_PHASE_AGES.University) return LifePhase.University;
  if (age <= LIFE_PHASE_AGES.PostGraduation) return LifePhase.PostGraduation;
  return LifePhase.Retired;
};

import { randomUUID } from 'expo-crypto';

export const createInitialCharacter = (year: number, lang: Language, manifest: Manifest): Character => {
    const gender = Math.random() < 0.5 ? Gender.Male : Gender.Female;
    const age = 0;
    return {
        id: randomUUID(),
        name: generateName(gender, lang),
        gender,
        generation: 0,
        birthDate: { day: 1, year },
        age: age,
        isAlive: true,
        deathDate: null,
        stats: {
            iq: Math.floor(Math.random() * 101), // 0-100
            happiness: Math.floor(Math.random() * 101), // 0-100
            eq: Math.floor(Math.random() * 101), // 0-100
            health: 30 + Math.floor(Math.random() * 71), // 30-100
            skill: 0,
        },
        phase: LifePhase.Newborn,
        education: "None",
        major: null,
        careerTrack: null,
        careerLevel: 0,
        status: CharacterStatus.Idle,
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
        currentClubs: [],
        completedClubEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(manifest, age, gender),
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
};

export const handleBirth = (parent1: Character, parent2: Character, currentDate: { day: number, year: number }, lang: Language, manifest: Manifest): Character => {
    const gender = Math.random() < 0.5 ? Gender.Male : Gender.Female;
    const childStats: Stats = {
        iq: Math.min(200, Math.floor(((parent1.stats.iq + parent2.stats.iq) / 2) * (0.8 + Math.random() * 0.4))),
        happiness: Math.min(100, Math.floor(((parent1.stats.happiness + parent2.stats.happiness) / 2) * (0.8 + Math.random() * 0.4))),
        eq: Math.min(100, Math.floor(((parent1.stats.eq + parent2.stats.eq) / 2) * (0.8 + Math.random() * 0.4))),
        health: Math.min(100, Math.floor(((parent1.stats.health + parent2.stats.health) / 2) * (0.8 + Math.random() * 0.4) + 10)),
        skill: 0,
    };
    
    const birthDay = Math.floor(Math.random() * DAYS_IN_YEAR) + 1;
    const age = 0;

    return {
        id: randomUUID(),
        name: generateName(gender, lang),
        gender,
        generation: parent1.generation + 1,
        birthDate: { day: birthDay, year: currentDate.year },
        age: age,
        isAlive: true,
        deathDate: null,
        stats: childStats,
        phase: LifePhase.Newborn,
        education: "None",
        major: null,
        careerTrack: null,
        careerLevel: 0,
        status: CharacterStatus.Idle,
        statusEndYear: null,
        relationshipStatus: RelationshipStatus.Single,
        partnerId: null,
        childrenIds: [],
        parentsIds: [parent1.id, parent2.id],
        isPlayerCharacter: parent1.isPlayerCharacter || parent2.isPlayerCharacter, // Inherit player character lineage
        mourningUntilYear: null,
        monthlyNetIncome: 0,
        eventsThisYear: 0,
        petId: null,
        completedOneTimeEvents: [],
        displayAdjective: null,
        avatarState: generateRandomAvatar(manifest, age, gender),
        currentClubs: [],
        completedClubEvents: [],
        lowHappinessYears: 0,
        lowHealthYears: 0,
        monthsInCurrentJobLevel: 0,
    };
};

export const formatDate = (day: number, year: number, lang: Language): string => {
  const months_en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months_vi = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const months = lang === 'vi' ? months_vi : months_en;
  
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  let dayOfYear = day;
  let monthIndex = 0;
  
  while (dayOfYear > daysInMonth[monthIndex] && monthIndex < 11) {
    dayOfYear -= daysInMonth[monthIndex];
    monthIndex++;
  }
  
  const month = months[monthIndex];
  const dayOfMonth = Math.max(1, Math.round(dayOfYear));

  if (lang === 'vi') {
    return `Ngày ${dayOfMonth} ${month}, ${year}`;
  }
  return `${month} ${dayOfMonth}, ${year}`;
};

export const getEducationDisplay = (character: Character, lang: Language): string => {
  if (character.major) {
    return `${t('phase_University', lang)} (${t(character.major, lang)})`;
  }
  return t(character.education, lang);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const assignNpcCareer = (character: Character, manifest: Manifest): Partial<Character> => {
    if (character.age < 23) {
        return { education: 'education_high_school', status: CharacterStatus.Unemployed };
    }
    if (character.age >= 60) {
        return { status: CharacterStatus.Retired, careerTrack: null };
    }

    let major: string | null = null;
    let education = 'education_high_school';

    // 50% chance of having a university degree
    if (Math.random() < 0.5) {
        const randomMajor = UNIVERSITY_MAJORS[Math.floor(Math.random() * UNIVERSITY_MAJORS.length)];
        major = randomMajor.nameKey;
        education = `education_university_{major_name}`;
    }

    const possibleCareers = Object.entries(CAREER_LADDER)
        .filter(([_, track]) => !track.requiredMajor || track.requiredMajor === major);

    const [careerTrack, careerDetails] = possibleCareers[Math.floor(Math.random() * possibleCareers.length)];

    // Determine career level based on age
    const yearsInWorkforce = character.age - 23;
    let careerLevel = 0;
    if (yearsInWorkforce > 5) careerLevel++;
    if (yearsInWorkforce > 12) careerLevel++;
    if (yearsInWorkforce > 20) careerLevel++;
    careerLevel = Math.min(careerLevel, careerDetails.levels.length - 1);
    
    const skill = Math.random() * 50; // Random starting skill

    return {
        education,
        major,
        careerTrack,
        careerLevel,
        status: CharacterStatus.Working,
        stats: { ...character.stats, skill },
        avatarState: generateRandomAvatar(manifest, character.age, character.gender),
    };
};

export const addDays = (date: { day: number, year: number }, daysToAdd: number): { day: number, year: number } => {
    let day = date.day + daysToAdd;
    let year = date.year;
    while (day > DAYS_IN_YEAR) {
        day -= DAYS_IN_YEAR;
        year += 1;
    }
    return { day, year };
};

export const isBefore = (date1: { day: number, year: number }, date2: { day: number, year: number }): boolean => {
    if (date1.year < date2.year) {
        return true;
    }
    if (date1.year === date2.year && date1.day < date2.day) {
        return true;
    }
    return false;
};


export const calculateEmployeeSalary = (character: Character): number => {
    return BUSINESS_WORKER_BASE_SALARY_MONTHLY + (character.stats.skill * BUSINESS_WORKER_SKILL_MULTIPLIER);
}

export const calculateBusinessMonthlyNetIncome = (business: Business, familyMembers: Record<string, Character>): number => {
    const definition = BUSINESS_DEFINITIONS[business.type];
    if (!definition) return 0;

    const filledSlots = business.slots.filter(slot => slot.assignedCharacterId).length;
    const totalSlots = business.slots.length;

    if (filledSlots > 0) {
        const workersAndRobots = business.slots.map(slot => {
            if (!slot.assignedCharacterId) return null;
            if (slot.assignedCharacterId === 'robot') return { stats: { skill: 30 } }; // Robots have fixed skill
            return familyMembers[slot.assignedCharacterId];
        }).filter((w): w is (Character | { stats: { skill: number } }) => !!w);

        let revenueBuff = 1;
        if (workersAndRobots.length > 0) {
            const totalSkill = workersAndRobots.reduce((sum, worker) => sum + worker.stats.skill, 0);
            const avgSkill = totalSkill / workersAndRobots.length;
            revenueBuff = 1 + (avgSkill / 200);
        }
        
        const operationalCapacity = filledSlots / totalSlots;
        const scaledBaseRevenue = business.baseRevenue * operationalCapacity;

        const robotCost = business.slots.filter(s => s.assignedCharacterId === 'robot').length * ROBOT_HIRE_COST;
        
        let salaryExpense = 0;
        const humanWorkers = business.slots
            .map(slot => slot.assignedCharacterId && slot.assignedCharacterId !== 'robot' ? familyMembers[slot.assignedCharacterId] : null)
            .filter((c): c is Character => !!c);
        
        for (const worker of humanWorkers) {
            salaryExpense += calculateEmployeeSalary(worker);
        }

        const grossRevenue = scaledBaseRevenue * revenueBuff;
        const costOfGoods = grossRevenue * definition.costOfGoodsSold;
        const netIncome = grossRevenue - costOfGoods - robotCost - definition.fixedMonthlyCost - salaryExpense;
        return netIncome;
    } else {
        return -definition.fixedMonthlyCost;
    }
};
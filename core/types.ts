import { ImageSourcePropType } from 'react-native';

export type Language = 'en' | 'vi';

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum LifePhase {
  Newborn = 'Newborn', // 0-5
  Elementary = 'Elementary School', // 6-11
  MiddleSchool = 'Middle School', // 12-15
  HighSchool = 'High School', // 16-18
  University = 'University', // 19-22
  PostGraduation = 'Working Life', // 23-59
  Retired = 'Retired' // 60+
}

export enum CharacterStatus {
    Idle = 'Idle',
    InEducation = 'In Education',
    Working = 'Working',
    Unemployed = 'Unemployed',
    Internship = 'Internship',
    VocationalTraining = 'Vocational Training',
    Retired = 'Retired',
    Trainee = 'Trainee',
}

export enum RelationshipStatus {
    Single = 'Single',
    Married = 'Married',
}

export enum PetType {
    Dog = 'Dog',
    Cat = 'Cat',
    Parrot = 'Parrot',
    Horse = 'Horse',
    Fish = 'Fish/Turtle',
}

export interface Stats {
  iq: number; // 0-200
  happiness: number; // 0-100
  eq: number; // 0-100
  health: number; // 0-100
  skill: number; // 0-100
}

export interface Pet {
    id: string;
    name: string;
    type: PetType;
    ownerId: string;
    age: number;
}

export interface BusinessSlot {
    role: string;
    requiredMajor: string;
    assignedCharacterId: string | null; // Can be a family member or a Robot
    businessName?: string; // Added
}

export interface Business {
    id: string;
    name: string;
    type: string;
    level: number;
    ownerId: string;
    slots: BusinessSlot[];
    baseRevenue: number;
}

// ---------------------------------------------
// Avatar Types
// ---------------------------------------------
export type LayerKey =
  | "background"
  | "backHair"
  | "features" // freckles, blush, face marks
  | "eyes"
  | "eyebrows"
  | "mouth"
  | "beard" // male facial hair
  | "frontHair";

export interface LayerOption {
  id: string; // unique within its layer
  name: string;
  src: string; // path to transparent PNG
  previewSrc?: string; // optional lighter preview asset
  ageCategory?: 'baby' | 'normal' | 'old';
}

export interface LayerDefinition {
  key: LayerKey;
  label: string;
  zIndex: number; // draw order (low -> high)
  options: LayerOption[];
  required?: boolean; // if true, must have a selection
  allowNone?: boolean; // if true, can select "none"
}

export type Manifest = LayerDefinition[];

export type AvatarState = Partial<Record<LayerKey, string | null>> & {
  backHairColor?: string;
  frontHairColor?: string;
  eyebrowsColor?: string;
  beardColor?: string;
  eyesColor?: string;
  mouthColor?: string;
};

export interface ColorDefinition {
  name: string;
  filter: string;
  previewBackground: string;
}


export interface Character {
  id: string;
  name: string;
  gender: Gender;
  generation: number;
  birthDate: { day: number, year: number };
  age: number;
  isAlive: boolean;
  deathDate: { day: number, year: number } | null;
  stats: Stats;
  phase: LifePhase;
  education: string;
  universityDegree?: string; // Added
  schoolHistory?: string[]; // Added
  major: string | null;
  careerTrack: string | null;
  careerLevel: number;
  status: CharacterStatus;
  statusEndYear: number | null;
  relationshipStatus: RelationshipStatus;
  partnerId: string | null;
  childrenIds: string[];
  parentsIds: [string, string] | [];
  isPlayerCharacter: boolean;
  mourningUntilYear: number | null;
  monthlyNetIncome: number;
  eventsThisYear: number;
  petId: string | null;
  businessId?: string; // Added
  businessSlotIndex?: number; // Added
  completedOneTimeEvents: string[];
  currentClubs: string[];
  completedClubEvents: string[];
  displayAdjective: { key: string; year: number; } | null;
  avatarState: AvatarState;
  staticAvatarUrl?: ImageSourcePropType;
  progressionPenalty?: number;
  traineeForCareer?: string | null;
  childrenEventCooldownUntil?: { day: number, year: number; } | null;
  lowHappinessYears: number; // New: Tracks years happiness is below threshold
  lowHealthYears: number; // New: Tracks years health is below threshold
  monthsInCurrentJobLevel: number; // New: Tracks months in current job level
  monthsUnemployed: number;
}
export enum AssetType {
    Housing = 'Housing',
    Vehicle = 'Vehicle',
    Electronics = 'Electronics',
    Art = 'Art',
    Jewelry = 'Jewelry',
    Furniture = 'Furniture',
    Library = 'Library',
    Gym = 'Gym',
    Music = 'Music',
    Vacation = 'Vacation',
}

export interface AssetDefinition {
    id: string;
    type: AssetType;
    tier: 1 | 2 | 3;
    nameKey: string;
    descriptionKey: string;
    cost: number;
    effects: Partial<Stats>; // Monthly buffs
    imageSrc?: string; // Path to the asset image
}


export interface PurchasedAsset {
    id: string; // Corresponds to AssetDefinition id
    purchaseYear: number;
}


export interface CareerChoice {
    characterId: string;
    options: string[];
}

export interface GameLogEntry {
    id?: string;
    year: number;
    messageKey: string;
    replacements?: Record<string, string | number>;
    statChanges?: Partial<Stats>;
    fundChange?: number;

    // New optional fields for detailed view
    characterId?: string;
    eventTitleKey?: string;
}

export interface Loan {
    id: string;
    amount: number;
    dueDate: { day: number; year: number };
}

export interface GameState {
  familyMembers: Record<string, Character>;
  familyFund: number;
  purchasedAssets: Record<string, PurchasedAsset>;
  familyPets: Record<string, Pet>;
  familyBusinesses: Record<string, Business>;
  currentDate: { day: number, year: number };
  gameLog: GameLogEntry[];
  gameOverReason: 'victory' | 'bankruptcy' | 'debt' | null;
  activeEvent: { characterId: string, event: GameEvent, replacements?: Record<string, string | number> } | null;
  pendingSchoolChoice: { characterId: string; newPhase: LifePhase }[] | null;
  pendingUniversityChoice: { characterId: string }[] | null;
  pendingMajorChoice: { characterId: string; options: UniversityMajor[] } | null;
  pendingClubChoice: { characterId: string; options: Club[] } | null;
  pendingCareerChoice: CareerChoice | null;
  pendingUnderqualifiedChoice?: { characterId: string; careerTrackKey: string; } | null;
  pendingLoanChoice: boolean | null;
  pendingPromotion: { characterId: string; newLevel: number; newTitleKey: string } | null;
  eventQueue: { characterId: string, event: GameEvent, replacements?: Record<string, string | number> }[];
  activeLoans: Loan[];
  highestEducation: string;
  highestCareer: string;
  totalMembers: number;
  monthlyNetChange: number;
  eventCooldownUntil: { day: number, year: number } | null;
  lang: Language;
  contentVersion: number; // Added content version
  familyName: string;
  totalChildrenBorn: number; // New: Tracks total children born in the family
  unlockedFeatures: string[];
  newlyUnlockedFeature: string | null;
}

export type StatChanges = Partial<Stats>;
export type TriggeredEvent = { 
  eventId: string; 
  chance: number; 
  reTarget?: 'parents'; 
};

export interface DynamicEffectResult {
    statChanges?: StatChanges;
    fundChange?: number;
    logKey: string;
    triggers?: TriggeredEvent[];
}

export interface EventEffect {
  statChanges?: StatChanges;
  fundChange?: number;
  logKey: string;
  triggers?: TriggeredEvent[];
  action?: (state: GameState, charId: string, manifest: Manifest) => Partial<GameState>;
  getDynamicEffect?: () => DynamicEffectResult;
}

// Choice "draft" do content viết (chưa có id/labelKey).
export type EventChoiceDraft = {
  textKey: string;
  stableKey?: string;
  effect?: unknown;
  condition?: (state: GameState, char: Character) => boolean;
};

// Event "draft" do content viết (chưa attach id/labelKey vào choices).
export type EventDraft = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  phases: readonly unknown[];
  choices: readonly EventChoiceDraft[];
  isTriggerOnly?: boolean;
  isMilestone?: boolean;
  allowedRelationshipStatuses?: RelationshipStatus[];
  applyEffectToAll?: boolean;
  condition?: (state: GameState, char: Character) => boolean;
};

// Choice hoàn chỉnh để runtime dùng.
export type EventChoice = EventChoiceDraft & {
  id: string;
  label: string;
  effect: EventEffect;
};

// Event hoàn chỉnh để runtime dùng.
export interface GameEvent extends Omit<EventDraft, "choices"> { // Omit choices from EventDraft to redefine explicitly
  id: string; // Runtime ID for the event
  title: string;
  choices: EventChoice[]; // Runtime choices (using EventChoice)
  // stableKey and other properties are inherited from EventDraft
}

export interface SchoolOption {
    nameKey: string;
    cost: number;
    effects: StatChanges;
    logKey: string;
}

export interface UniversityMajor {
    nameKey: string;
    descriptionKey: string;
    cost: number;
    effects: StatChanges;
}

export interface CareerTrack {
    nameKey: string;
    descriptionKey: string;
    levels: { titleKey: string; salary: number; skillRequired: number }[];
    requiredMajor?: string;
    iqRequired: number;
    eqRequired: number;
}

export interface PetDefinition {
    nameKey: string;
    monthlyCost: number;
    effects: Partial<Stats>;
}

export interface BusinessSlotDefinition {
    roleKey: string;
    requiredMajor: string;
}

// FIX: Add 'id', 'type', and 'tier' to BusinessDefinition to match its usage in constants.ts.
export interface BusinessDefinition {
    id: string;
    type: string;
    tier: number;
    nameKey: string; // Retained for display in content editor / during loading
    cost: number;
    baseRevenue: number; // monthly
    costOfGoodsSold: number; // percentage of revenue
    fixedMonthlyCost: number;
    slots: BusinessSlotDefinition[];
    upgradeSlots: BusinessSlotDefinition[];
}

export interface GameScenario {
  id: string;
  nameKey: string;
  descriptionKey: string;
  themeColor: string;
  createInitialState: (initialYear: number, lang: Language) => GameState;
}

export interface Club {
  id: string;
  nameKey: string;
  descriptionKey: string;
  prerequisites: { age?: number; stats?: Partial<Stats>; };
  effects: StatChanges;
  careerInfluence: string[];
  lifePhase: LifePhase[];
}

export interface ClubEvent extends Omit<ClubEventDraft, 'choices'> {
  id: string;
  title: string; // Add this line
  titleKey: string;
  descriptionKey: string;
  clubId: string;
  choices: EventChoice[];
  condition?: (state: GameState, char: Character) => boolean;
}

export interface ClubEventDraft {
  id: string;
  titleKey: string;
  descriptionKey: string;
  clubId: string;
  choices: EventChoiceDraft[];
  condition?: (state: GameState, char: Character) => boolean;
}


// --- Start of generated asset lists ---

const backgroundOptions: LayerOption[] = [
  { id: 'bg-1', name: 'Background 1', src: '../public/asset/avatar-face/bg/1.webp' },
  { id: 'bg-2', name: 'Background 2', src: '../public/asset/avatar-face/bg/2.webp' },
  { id: 'bg-3', name: 'Background 3', src: '../public/asset/avatar-face/bg/3.webp' },
  { id: 'bg-4', name: 'Background 4', src: '../public/asset/avatar-face/bg/4.webp' },
  { id: 'bg-5', name: 'Background 5', src: '../public/asset/avatar-face/bg/5.webp' },
  { id: 'bg-6', name: 'Background 6', src: '../public/asset/avatar-face/bg/6.webp' },
  { id: 'bg-7', name: 'Background 7', src: '../public/asset/avatar-face/bg/7.webp' },
];

const backHairOptions: LayerOption[] = [
  { id: '1bh', name: '1', src: '../public/asset/avatar-face/hair/back/1.webp' },
  { id: '2bh', name: '2', src: '../public/asset/avatar-face/hair/back/2.webp' },
  { id: '3bh', name: '3', src: '../public/asset/avatar-face/hair/back/3.webp' },
  { id: '4bh', name: '4', src: '../public/asset/avatar-face/hair/back/4.webp' },
  { id: '5bh', name: '5', src: '../public/asset/avatar-face/hair/back/5.webp' },
];

const eyesOptions: LayerOption[] = [
  { id: '1e', name: '1', src: '../public/asset/avatar-face/eyes/1.webp' },
  { id: '2e', name: '2', src: '../public/asset/avatar-face/eyes/2.webp' },
  { id: '3e', name: '3', src: '../public/asset/avatar-face/eyes/3.webp' },
  { id: '4e', name: '4', src: '../public/asset/avatar-face/eyes/4.webp' },
  { id: '5e', name: '5', src: '../public/asset/avatar-face/eyes/5.webp' },
  { id: '6e', name: '6', src: '../public/asset/avatar-face/eyes/6.webp' },
  { id: '7e', name: '7', src: '../public/asset/avatar-face/eyes/7.webp' },
  { id: '8e', name: '8', src: '../public/asset/avatar-face/eyes/8.webp' },
  { id: '9e', name: '9', src: '../public/asset/avatar-face/eyes/9.webp' },
  { id: '10e', name: '10', src: '../public/asset/avatar-face/eyes/10.webp' },
  { id: '11e', name: '11', src: '../public/asset/avatar-face/eyes/11.webp' },
  { id: '12e', name: '12', src: '../public/asset/avatar-face/eyes/12.webp' },
  { id: '13e', name: '13', src: '../public/asset/avatar-face/eyes/13.webp' },
  { id: '14e', name: '14', src: '../public/asset/avatar-face/eyes/14.webp' },
  { id: '15e', name: '15', src: '../public/asset/avatar-face/eyes/15.webp' },
  { id: '16e', name: '16', src: '../public/asset/avatar-face/eyes/16.webp' },
  { id: '17e', name: '17', src: '../public/asset/avatar-face/eyes/17.webp' },
  { id: '18e', name: '18', src: '../public/asset/avatar-face/eyes/18.webp' },
  { id: '19e', name: '19', src: '../public/asset/avatar-face/eyes/19.webp' },
  { id: '20e', name: '20', src: '../public/asset/avatar-face/eyes/20.webp' },
  { id: '21e', name: '21', src: '../public/asset/avatar-face/eyes/21.webp' },
  { id: '22e', name: '22', src: '../public/asset/avatar-face/eyes/22.webp' },
  { id: '23e', name: '23', src: '../public/asset/avatar-face/eyes/23.webp' },
  { id: '24e', name: '24', src: '../public/asset/avatar-face/eyes/24.webp' },
  { id: '25e', name: '25', src: '../public/asset/avatar-face/eyes/25.webp' },
  { id: '26e', name: '26', src: '../public/asset/avatar-face/eyes/26.webp' },
  { id: '27e', name: '27', src: '../public/asset/avatar-face/eyes/27.webp' },
  { id: '28e', name: '28', src: '../public/asset/avatar-face/eyes/28.webp' },
  { id: '29e', name: '29', src: '../public/asset/avatar-face/eyes/29.webp' },
  { id: '30e', name: '30', src: '../public/asset/avatar-face/eyes/30.webp' },
  { id: '31e', name: '31', src: '../public/asset/avatar-face/eyes/31.webp' },
  { id: '32e', name: '32', src: '../public/asset/avatar-face/eyes/32.webp' },
];

const eyebrowsOptions: LayerOption[] = [
  { id: '1eb', name: '1', src: '../public/asset/avatar-face/eyebrows/1.webp' },
  { id: '2eb', name: '2', src: '../public/asset/avatar-face/eyebrows/2.webp' },
  { id: '3eb', name: '3', src: '../public/asset/avatar-face/eyebrows/3.webp' },
  { id: '4eb', name: '4', src: '../public/asset/avatar-face/eyebrows/4.webp' },
  { id: '5eb', name: '5', src: '../public/asset/avatar-face/eyebrows/5.webp' },
];

const mouthOptions: LayerOption[] = [
  { id: '1m', name: '1', src: '../public/asset/avatar-face/mouth/1.webp' },
  { id: '2m', name: '2', src: '../public/asset/avatar-face/mouth/2.webp' },
  { id: '3m', name: '3', src: '../public/asset/avatar-face/mouth/3.webp' },
  { id: '4m', name: '4', src: '../public/asset/avatar-face/mouth/4.webp' },
  { id: '5m', name: '5', src: '../public/asset/avatar-face/mouth/5.webp' },
];

const beardOptions: LayerOption[] = [
  { id: '1b', name: '1', src: '../public/asset/avatar-face/beard/1.webp' },
  { id: '2b', name: '2', src: '../public/asset/avatar-face/beard/2.webp' },
  { id: '3b', name: '3', src: '../public/asset/avatar-face/beard/3.webp' },
  { id: '4b', name: '4', src: '../public/asset/avatar-face/beard/4.webp' },
  { id: '5b', name: '5', src: '../public/asset/avatar-face/beard/5.webp' },
];

const frontHairOptions: LayerOption[] = [
  { id: '1fh', name: '1', src: '../public/asset/avatar-face/hair/front/1.webp' },
  { id: '2fh', name: '2', src: '../public/asset/avatar-face/hair/front/2.webp' },
  { id: '3fh', name: '3', src: '../public/asset/avatar-face/hair/front/3.webp' },
  { id: '4fh', name: '4', src: '../public/asset/avatar-face/hair/front/4.webp' },
  { id: '5fh', name: '5', src: '../public/asset/avatar-face/hair/front/5.webp' },
  { id: '6fh', name: '6', src: '../public/asset/avatar-face/hair/front/6.webp' },
  { id: '7fh', name: '7', src: '../public/asset/avatar-face/hair/front/7.webp' },
  { id: '8fh', name: '8', src: '../public/asset/avatar-face/hair/front/8.webp' },
  { id: '9fh', name: '9', src: '../public/asset/avatar-face/hair/front/9.webp' },
  { id: '10fh', name: '10', src: '../public/asset/avatar-face/hair/front/10.webp' },
  { id: '11fh', name: '11', src: '../public/asset/avatar-face/hair/front/11.webp' },
  { id: '12fh', name: '12', src: '../public/asset/avatar-face/hair/front/12.webp' },
  { id: '13fh', name: '13', src: '../public/asset/avatar-face/hair/front/13.webp' },
  { id: '14fh', name: '14', src: '../public/asset/avatar-face/hair/front/14.webp' },
  { id: '15fh', name: '15', src: '../public/asset/avatar-face/hair/front/15.webp' },
  { id: '16fh', name: '16', src: '../public/asset/avatar-face/hair/front/16.webp' },
  { id: '17fh', name: '17', src: '../public/asset/avatar-face/hair/front/17.webp' },
  { id: 'babyfh', name: 'baby', src: '../public/asset/avatar-face/hair/front/baby.webp', ageCategory: 'baby' },
];

const featureOptions: LayerOption[] = [
  { id: 'feat-baby-1', name: 'baby-1', src: '../public/asset/avatar-face/features/baby/baby-1.webp', ageCategory: 'baby' },
  { id: 'feat-blush-cheeks-round', name: 'blush-cheeks-round', src: '../public/asset/avatar-face/features/baby/blush-cheeks-round.webp', ageCategory: 'baby' },
  { id: 'feat-blush-heart-pink', name: 'blush-heart-pink', src: '../public/asset/avatar-face/features/baby/blush-heart-pink.webp', ageCategory: 'baby' },
  { id: 'feat-blush-sleepy', name: 'blush-sleepy', src: '../public/asset/avatar-face/features/baby/blush-sleepy.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-diamond-blue', name: 'sticker-diamond-blue', src: '../public/asset/avatar-face/features/baby/sticker-diamond-blue.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-dots-multi', name: 'sticker-dots-multi', src: '../public/asset/avatar-face/features/baby/sticker-dots-multi.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-dots-yellow', name: 'sticker-dots-yellow', src: '../public/asset/avatar-face/features/baby/sticker-dots-yellow.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-flower-orange', name: 'sticker-flower-orange', src: '../public/asset/avatar-face/features/baby/sticker-flower-orange.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-flower-pink', name: 'sticker-flower-pink', src: '../public/asset/avatar-face/features/baby/sticker-flower-pink.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-flower-red', name: 'sticker-flower-red', src: '../public/asset/avatar-face/features/baby/sticker-flower-red.webp', ageCategory: 'baby' },
  { id: 'feat-sticker-teardrop', name: 'sticker-teardrop', src: '../public/asset/avatar-face/features/baby/sticker-teardrop.webp', ageCategory: 'baby' },
  { id: 'feat-blush-cheeks-soft', name: 'blush-cheeks-soft', src: '../public/asset/avatar-face/features/normal/blush-cheeks-soft.webp', ageCategory: 'normal' },
  { id: 'feat-blush-full', name: 'blush-full', src: '../public/asset/avatar-face/features/normal/blush-full.webp', ageCategory: 'normal' },
  { id: 'feat-blush-intense', name: 'blush-intense', src: '../public/asset/avatar-face/features/normal/blush-intense.webp', ageCategory: 'normal' },
  { id: 'feat-blush-purple', name: 'blush-purple', src: '../public/asset/avatar-face/features/normal/blush-purple.webp', ageCategory: 'normal' },
  { id: 'feat-blush-simple', name: 'blush-simple', src: '../public/asset/avatar-face/features/normal/blush-simple.webp', ageCategory: 'normal' },
  { id: 'feat-blush-slashes', name: 'blush-slashes', src: '../public/asset/avatar-face/features/normal/blush-slashes.webp', ageCategory: 'normal' },
  { id: 'feat-blush-subtle', name: 'blush-subtle', src: '../public/asset/avatar-face/features/normal/blush-subtle.webp', ageCategory: 'normal' },
  { id: 'feat-blush-swirl', name: 'blush-swirl', src: '../public/asset/avatar-face/features/normal/blush-swirl.webp', ageCategory: 'normal' },
  { id: 'feat-blush-wide', name: 'blush-wide', src: '../public/asset/avatar-face/features/normal/blush-wide.webp', ageCategory: 'normal' },
  { id: 'feat-facepaint-butterfly-purple', name: 'facepaint-butterfly-purple', src: '../public/asset/avatar-face/features/normal/facepaint-butterfly-purple.webp', ageCategory: 'normal' },
  { id: 'feat-facepaint-butterfly', name: 'facepaint-butterfly', src: '../public/asset/avatar-face/features/normal/facepaint-butterfly.webp', ageCategory: 'normal' },
  { id: 'feat-facepaint-eyeshadow', name: 'facepaint-eyeshadow', src: '../public/asset/avatar-face/features/normal/facepaint-eyeshadow.webp', ageCategory: 'normal' },
  { id: 'feat-facepaint-tiger', name: 'facepaint-tiger', src: '../public/asset/avatar-face/features/normal/facepaint-tiger.webp', ageCategory: 'normal' },
  { id: 'feat-freckles-cheeks', name: 'freckles-cheeks', src: '../public/asset/avatar-face/features/normal/freckles-cheeks.webp', ageCategory: 'normal' },
  { id: 'feat-freckles-nose', name: 'freckles-nose', src: '../public/asset/avatar-face/features/normal/freckles-nose.webp', ageCategory: 'normal' },
  { id: 'feat-mark-dot-cheek', name: 'mark-dot-cheek', src: '../public/asset/avatar-face/features/normal/mark-dot-cheek.webp', ageCategory: 'normal' },
  { id: 'feat-mark-dot-forehead', name: 'mark-dot-forehead', src: '../public/asset/avatar-face/features/normal/mark-dot-forehead.webp', ageCategory: 'normal' },
  { id: 'feat-mark-fangs', name: 'mark-fangs', src: '../public/asset/avatar-face/features/normal/mark-fangs.webp', ageCategory: 'normal' },
  { id: 'feat-mark-heart-black', name: 'mark-heart-black', src: '../public/asset/avatar-face/features/normal/mark-heart-black.webp', ageCategory: 'normal' },
  { id: 'feat-mark-patch-cheek', name: 'mark-patch-cheek', src: '../public/asset/avatar-face/features/normal/mark-patch-cheek.webp', ageCategory: 'normal' },
  { id: 'feat-mask-face-green', name: 'mask-face-green', src: '../public/asset/avatar-face/features/normal/mask-face-green.webp', ageCategory: 'normal' },
  { id: 'feat-mask-sleep', name: 'mask-sleep', src: '../public/asset/avatar-face/features/normal/mask-sleep.webp', ageCategory: 'normal' },
  { id: 'feat-patches-white', name: 'patches-white', src: '../public/asset/avatar-face/features/normal/patches-white.webp', ageCategory: 'normal' },
  { id: 'feat-scar-forehead', name: 'scar-forehead', src: '../public/asset/avatar-face/features/normal/scar-forehead.webp', ageCategory: 'normal' },
  { id: 'feat-scratches-allover', name: 'scratches-allover', src: '../public/asset/avatar-face/features/normal/scratches-allover.webp', ageCategory: 'normal' },
  { id: 'feat-scratches-cheek', name: 'scratches-cheek', src: '../public/asset/avatar-face/features/normal/scratches-cheek.webp', ageCategory: 'normal' },
  { id: 'feat-scratches-vertical', name: 'scratches-vertical', src: '../public/asset/avatar-face/features/normal/scratches-vertical.webp', ageCategory: 'normal' },
  { id: 'feat-stitches-cheek', name: 'stitches-cheek', src: '../public/asset/avatar-face/features/old/stitches-cheek.webp', ageCategory: 'old' },
  { id: 'feat-stitches-forehead', name: 'stitches-forehead', src: '../public/asset/avatar-face/features/old/stitches-forehead.webp', ageCategory: 'old' },
  { id: 'feat-wrinkles-forehead-heavy', name: 'wrinkles-forehead-heavy', src: '../public/asset/avatar-face/features/old/wrinkles-forehead-heavy.webp', ageCategory: 'old' },
  { id: 'feat-wrinkles-mouth', name: 'wrinkles-mouth', src: '../public/asset/avatar-face/features/old/wrinkles-mouth.webp', ageCategory: 'old' },
];

export const exampleManifest: Manifest = [
  { key: "background", label: "Background", zIndex: 0, required: true, options: backgroundOptions},
  { key: "backHair", label: "Hair (Back)", zIndex: 1, allowNone: true, required: false, options: backHairOptions},
  { key: "features", label: "Face Features", zIndex: 2, allowNone: false, required: false, options: featureOptions},
  { key: "eyes", label: "Eyes", zIndex: 3, required: true, options: eyesOptions},
  { key: "eyebrows", label: "Eyebrows", zIndex: 4, allowNone: true, required: false, options: eyebrowsOptions},
  { key: "mouth", label: "Mouth", zIndex: 6, required: true, options: mouthOptions},
  { key: "beard", label: "Beard", zIndex: 5, allowNone: true, required: false, options: beardOptions},
  { key: "frontHair", label: "Hair (Front)", zIndex: 7, allowNone: true, required: false, options: frontHairOptions},
];
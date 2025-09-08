import { LifePhase, CharacterStatus, RelationshipStatus, Stats, Language } from './types';
import translationsEn from '../localization/en';
import translationsVi from '../localization/vi';

const translations = {
  en: translationsEn,
  vi: translationsVi,
};

export const t = (key: string, lang: Language, replacements?: Record<string, string | number>, options?: { defaultValue?: string }): string => {
    let translation = translations[lang][key as keyof typeof translations[typeof lang]] || translations['en'][key as keyof typeof translations['en']] || options?.defaultValue || key;
    
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            const replacementValue = replacements[rKey];
            // If the replacement value is a key itself, translate it first.
            const finalReplacement = translations[lang][replacementValue as keyof typeof translations[typeof lang]] || translations['en'][replacementValue as keyof typeof translations['en']] || replacementValue;
            translation = translation.replace(`{${rKey}}`, String(finalReplacement));
        });
    }
    return translation;
};

export const displayPhase = (phase: LifePhase, lang: Language): string => t(`phase_${phase.replace(/ /g, '_')}`, lang);
export const displayStatus = (status: CharacterStatus, lang: Language): string => t(`status_${status.replace(/ /g, '_')}`, lang);
export const displayRelationshipStatus = (status: RelationshipStatus, lang: Language): string => t(`relationship_${status}`, lang);
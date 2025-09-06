import React from 'react';
import type { Character, Club } from '../types';
import { ModalBase } from './ui';
import { t } from '../core/localization';

interface ClubChoiceModalProps {
  character: Character;
  clubs: Club[];
  onSelect: (clubId: string) => void;
  onSkip: () => void;
  lang: string;
}

export const ClubChoiceModal: React.FC<ClubChoiceModalProps> = ({ character, clubs, onSelect, onSkip, lang }) => {
  return (
    <ModalBase 
      titleKey="modal_club_choice_title"
      descriptionKey="modal_club_choice_desc"
      characterName={character.name}
      lang={lang}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {clubs.map((club) => (
          <div key={club.id} className="border p-4 rounded-lg bg-slate-700/50">
            <h3 className="text-lg font-bold text-yellow-300">{t(club.nameKey, lang)}</h3>
            <p className="text-sm text-slate-300 italic my-1">{t(club.descriptionKey, lang)}</p>
            <button 
              onClick={() => onSelect(club.id)} 
              className="chunky-button chunky-button-green w-full mt-2"
            >
              {t('join_club', lang)}
            </button>
          </div>
        ))}
      </div>
      <button onClick={onSkip} className="chunky-button chunky-button-slate w-full">
        {t('skip_clubs', lang)}
      </button>
    </ModalBase>
  );
};
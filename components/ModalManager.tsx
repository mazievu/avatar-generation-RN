import React from 'react';
import { ImageSourcePropType } from 'react-native';

import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Business, Language, GameLogEntry } from '../core/types';
import { getCharacterDisplayName } from '../core/utils';
import { SCHOOL_OPTIONS } from '../core/constants';
import { exampleManifest } from '../core/types'; // Assuming this is a placeholder/default
import { CLUBS } from '../core/clubsAndEventsData';
import { t } from '../core/localization';


import { EventModal } from './EventModal';
import { SchoolChoiceModal } from './SchoolChoiceModal';
import { ClubChoiceModal } from './ClubChoiceModal';
import { UniversityChoiceModal } from './UniversityChoiceModal';
import { UniversityMajorChoiceModal } from './UniversityMajorChoiceModal';
import { CareerChoiceModal } from './CareerChoiceModal';
import { UnderqualifiedChoiceModal } from './UnderqualifiedChoiceModal';
import { CharacterDetailModal } from './CharacterDetailModal';
import { LoanModal } from './LoanModal';
import { PromotionModal } from './PromotionModal';
import { BusinessManagementModal } from './BusinessManagementModal';

interface ModalManagerProps {
    // From gameState
    lang: Language;
    familyMembers: Record<string, Character>;
    familyBusinesses: Record<string, Business>;
    gameLog: GameLogEntry[];
    totalChildrenBorn: number;
    currentDate: { day: number; year: number };
    activeEvent: GameState['activeEvent'];
    pendingSchoolChoice: GameState['pendingSchoolChoice'];
    familyFund: number;
    pendingClubChoice: GameState['pendingClubChoice'];
    pendingUniversityChoice: GameState['pendingUniversityChoice'];
    pendingMajorChoice: GameState['pendingMajorChoice'];
    pendingCareerChoice: GameState['pendingCareerChoice'];
    pendingUnderqualifiedChoice: GameState['pendingUnderqualifiedChoice'];
    pendingLoanChoice: GameState['pendingLoanChoice'];
    pendingPromotion: GameState['pendingPromotion'];
    
    // Other props
    selectedCharacter: Character | null;
    editingBusiness: Business | null;
    avatarImages: Record<string, ImageSourcePropType>;
    isCenteringAnimationDone: boolean;

    // Callbacks
    onEventChoice: (choice: EventChoice) => void;
    onEventModalClose: () => void;
    onEventHandled: (characterId: string) => void;
    onSetSelectedCharacter: (character: Character | null) => void;
    onSchoolChoice: (option: SchoolOption) => void;
    onClubChoice: (clubId: string | null) => void;
    onUniversityChoice: (goToUniversity: boolean) => void;
    onMajorChoice: (major: UniversityMajor) => void;
    onAbandonUniversity: () => void;
    onCareerChoice: (careerTrackKey: string) => void;
    onUnderqualifiedChoice: (isTrainee: boolean) => void;
    onOpenAvatarBuilder: (characterId: string) => void;
    onLoanChoice: (amount: number, term: number) => void;
    onPromotionAccept: () => void;
    onAssignToBusiness: (businessId: string, slotIndex: number, characterId: string | null) => void;
    onUpgradeBusiness: (businessId: string) => void;
    onSellBusiness: (businessId: string) => void;
    setEditingBusiness: (business: Business | null) => void;
}

export const ModalManager: React.FC<ModalManagerProps> = React.memo(({
    lang,
    familyMembers,
    familyBusinesses,
    gameLog,
    totalChildrenBorn,
    currentDate,
    activeEvent,
    pendingSchoolChoice,
    familyFund,
    pendingClubChoice,
    pendingUniversityChoice,
    pendingMajorChoice,
    pendingCareerChoice,
    pendingUnderqualifiedChoice,
    pendingLoanChoice,
    pendingPromotion,
    selectedCharacter,
    editingBusiness,
    avatarImages,
    onEventChoice,
    onEventModalClose,
    onEventHandled,
    onSetSelectedCharacter,
    onSchoolChoice,
    onClubChoice,
    onUniversityChoice,
    onMajorChoice,
    onAbandonUniversity,
    onCareerChoice,
    onUnderqualifiedChoice,
    onOpenAvatarBuilder,
    onLoanChoice,
    onPromotionAccept,
    onAssignToBusiness,
    onUpgradeBusiness,
    onSellBusiness,
    setEditingBusiness,
    isCenteringAnimationDone,
}) => {

    return (
        <>
            {activeEvent && isCenteringAnimationDone && (
                <EventModal
                    eventData={activeEvent}
                    character={familyMembers[activeEvent.characterId]}
                    onChoice={onEventChoice}
                    onClose={onEventModalClose}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onEventHandled={onEventHandled}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {pendingSchoolChoice && pendingSchoolChoice.length > 0 && (
                <SchoolChoiceModal
                    character={familyMembers[pendingSchoolChoice[0].characterId]}
                    schoolOptions={SCHOOL_OPTIONS[pendingSchoolChoice[0].newPhase]}
                    onSelect={onSchoolChoice}
                    currentFunds={familyFund}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {pendingClubChoice && (
                // *** ĐÂY LÀ ĐOẠN CODE ĐÃ ĐƯỢC SỬA LỖI ***
                <ClubChoiceModal
                    character={familyMembers[pendingClubChoice.characterId]}
                    clubs={pendingClubChoice.options}
                    onSelect={onClubChoice}
                    onSkip={() => onClubChoice(null)}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
             {pendingUniversityChoice && pendingUniversityChoice.length > 0 && (
                <UniversityChoiceModal
                    character={familyMembers[pendingUniversityChoice[0].characterId]}
                    onSelect={onUniversityChoice}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {pendingMajorChoice && (
                <UniversityMajorChoiceModal
                    character={familyMembers[pendingMajorChoice.characterId]}
                    majors={pendingMajorChoice.options}
                    onSelect={onMajorChoice}
                    currentFunds={familyFund}
                    lang={lang}
                    onAbandon={onAbandonUniversity}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {pendingCareerChoice && (
                 <CareerChoiceModal
                    character={familyMembers[pendingCareerChoice.characterId]}
                    options={pendingCareerChoice.options}
                    onSelect={onCareerChoice}
                    currentFunds={familyFund}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {pendingUnderqualifiedChoice && (
                <UnderqualifiedChoiceModal
                    character={familyMembers[pendingUnderqualifiedChoice.characterId]}
                    careerTrackKey={pendingUnderqualifiedChoice.careerTrackKey}
                    onSelect={onUnderqualifiedChoice}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                />
            )}
            {selectedCharacter && (
                <CharacterDetailModal 
                    character={selectedCharacter}
                    familyMembers={familyMembers}
                    gameLog={gameLog}
                    totalChildrenBorn={totalChildrenBorn}
                    currentDate={currentDate}
                    onClose={() => onSetSelectedCharacter(null)}
                    lang={lang}
                    onCustomize={onOpenAvatarBuilder}
                    images={avatarImages}
                    manifest={exampleManifest}
                    clubs={CLUBS}
                />
            )}
             {pendingLoanChoice && (
                <LoanModal onLoanChoice={onLoanChoice} lang={lang} />
            )}
            {pendingPromotion && (
                <PromotionModal
                    character={familyMembers[pendingPromotion.characterId]}
                    newTitle={t(pendingPromotion.newTitleKey, lang)}
                    onAccept={onPromotionAccept}
                    lang={lang}
                    onOpenCharacterDetails={onSetSelectedCharacter}
                    manifest={exampleManifest}
                    images={avatarImages}
                />
            )}
            {editingBusiness && (
                <BusinessManagementModal
                    business={editingBusiness}
                    familyFund={familyFund}
                    familyMembers={familyMembers}
                    familyBusinesses={familyBusinesses}
                    onAssignToBusiness={onAssignToBusiness}
                    onUpgradeBusiness={onUpgradeBusiness}
                    onSellBusiness={onSellBusiness}
                    onClose={() => setEditingBusiness(null)}
                    lang={lang}
                    images={avatarImages}
                    manifest={exampleManifest}
                />
            )}
        </>
    );
});
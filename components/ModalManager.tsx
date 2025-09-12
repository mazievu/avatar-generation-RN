import React from 'react';
import { ImageSourcePropType } from 'react-native';

import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Business } from '../core/types';
import { getCharacterDisplayName } from '../core/utils';
import { SCHOOL_OPTIONS } from '../core/constants';
import { exampleManifest } from '../core/types'; // Assuming this is a placeholder/default
import { CLUBS } from '../core/clubsAndEventsData';

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
    gameState: GameState;
    selectedCharacter: Character | null;
    editingBusiness: Business | null;
    avatarImages: Record<string, ImageSourcePropType>;

    // Callbacks
    onEventChoice: (choice: EventChoice) => void;
    onEventModalClose: () => void;
    onEventHandled: (characterId: string) => void; // NEW PROP
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
    setEditingBusiness: (business: Business | null) => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
    gameState,
    selectedCharacter,
    editingBusiness,
    avatarImages,
    onEventChoice,
    onEventModalClose,
    onEventHandled, // NEW
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
    setEditingBusiness,
}) => {
    const { lang, familyMembers } = gameState;

    return (
        <>
            {gameState.activeEvent && (
                <EventModal
                    eventData={gameState.activeEvent}
                    character={familyMembers[gameState.activeEvent.characterId]}
                    onChoice={onEventChoice}
                    onClose={onEventModalClose}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onEventHandled={onEventHandled} // NEW
                />
            )}
            {gameState.pendingSchoolChoice && gameState.pendingSchoolChoice.length > 0 && (
                <SchoolChoiceModal
                    character={familyMembers[gameState.pendingSchoolChoice[0].characterId]}
                    schoolOptions={SCHOOL_OPTIONS[gameState.pendingSchoolChoice[0].newPhase]}
                    onSelect={onSchoolChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                />
            )}
            {gameState.pendingClubChoice && (
                <ClubChoiceModal
                    character={familyMembers[gameState.pendingClubChoice.characterId]}
                    clubs={gameState.pendingClubChoice.options}
                    onSelect={onClubChoice}
                    onSkip={() => onClubChoice(null)}
                    lang={lang}
                />
            )}
             {gameState.pendingUniversityChoice && gameState.pendingUniversityChoice.length > 0 && (
                <UniversityChoiceModal
                    character={familyMembers[gameState.pendingUniversityChoice[0].characterId]}
                    onSelect={onUniversityChoice}
                    lang={lang}
                />
            )}
            {gameState.pendingMajorChoice && (
                <UniversityMajorChoiceModal
                    character={familyMembers[gameState.pendingMajorChoice.characterId]}
                    majors={gameState.pendingMajorChoice.options}
                    onSelect={onMajorChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                    onAbandon={onAbandonUniversity}
                />
            )}
            {gameState.pendingCareerChoice && (
                 <CareerChoiceModal
                    character={familyMembers[gameState.pendingCareerChoice.characterId]}
                    options={gameState.pendingCareerChoice.options}
                    onSelect={onCareerChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                />
            )}
            {gameState.pendingUnderqualifiedChoice && (
                <UnderqualifiedChoiceModal
                    character={familyMembers[gameState.pendingUnderqualifiedChoice.characterId]}
                    careerTrackKey={gameState.pendingUnderqualifiedChoice.careerTrackKey}
                    onSelect={onUnderqualifiedChoice}
                    lang={lang}
                />
            )}
            {selectedCharacter && (
                <CharacterDetailModal 
                    character={selectedCharacter}
                    gameState={gameState}
                    onClose={() => onSetSelectedCharacter(null)}
                    lang={lang}
                    onCustomize={onOpenAvatarBuilder}
                    images={avatarImages}
                    manifest={exampleManifest}
                    clubs={CLUBS}
                />
            )}
             {gameState.pendingLoanChoice && (
                <LoanModal onLoanChoice={onLoanChoice} lang={lang} />
            )}
            {gameState.pendingPromotion && (
                <PromotionModal 
                    characterName={getCharacterDisplayName(familyMembers[gameState.pendingPromotion.characterId], lang)}
                    newTitle={t(gameState.pendingPromotion.newTitleKey, lang)}
                    onAccept={onPromotionAccept}
                    lang={lang}
                />
            )}
            {editingBusiness && (
                <BusinessManagementModal
                    business={editingBusiness}
                    gameState={gameState}
                    onAssignToBusiness={onAssignToBusiness}
                    onUpgradeBusiness={onUpgradeBusiness}
                    onClose={() => setEditingBusiness(null)}
                    lang={lang}
                    images={avatarImages}
                    manifest={exampleManifest}
                />
            )}
        </>
    );
};
import React, { useState, useCallback, useEffect } from 'react';
import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Manifest, Business, Club } from '../types';
import { formatDate, getCharacterDisplayName } from '../utils';
import { CAREER_LADDER, SCHOOL_OPTIONS, UNIVERSITY_MAJORS, ASSET_DEFINITIONS } from '../constants';
import {
    FamilyTree,
    EventModal,
    GameLog,
    SummaryScreen,
    StartMenu,
    InstructionsModal,
    CharacterDetailModal,
    SchoolChoiceModal,
    UniversityChoiceModal,
    UniversityMajorChoiceModal,
    CareerChoiceModal,
    PromotionModal,
    LoanModal,
    WelcomeBackMenu,
    UnderqualifiedChoiceModal,
    BusinessManagementModal
} from './ui';
import { ClubChoiceModal } from './ClubChoiceModal';
import { Language, t } from '../localization';
import { exampleManifest } from './AvatarBuilder';
import { BusinessMap } from './BusinessMap';
import { FamilyAssetsPanel } from './FamilyAssetsPanel';

type ActiveTab = 'log' | 'assets' | 'businesses';

const TabButtonInternal: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const activeClasses = 'bg-white text-indigo-500';
  const inactiveClasses = 'bg-slate-100 text-slate-500 hover:bg-slate-200';
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-lg font-extrabold rounded-t-2xl transition-colors transform translate-y-px ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      {label}
    </button>
  );
};
const TabButton = React.memo(TabButtonInternal);


interface GameUIProps {
    view: 'menu' | 'playing' | 'gameover' | 'welcome_back';
    mainView: 'tree' | 'business';
    gameState: GameState | null;
    isPaused: boolean;
    gameSpeed: number;
    showInstructions: boolean;
    selectedCharacter: Character | null;
    lang: Language;
    avatarImages: Record<string, HTMLImageElement>;
    onSetLang: (lang: Language) => void;
    onStartGame: (mode: string) => void;
    onShowInstructions: () => void;
    onCloseInstructions: () => void;
    onQuitGame: () => void;
    onSetIsPaused: (paused: boolean) => void;
    onSetGameSpeed: (speed: number) => void;
    onSetSelectedCharacter: (character: Character | null) => void;
    onOpenAvatarBuilder: (characterId: string) => void;
    onEventChoice: (choice: EventChoice) => void;
    onEventModalClose: () => void;
    onSchoolChoice: (option: SchoolOption) => void;
    onClubChoice: (clubId: string | null) => void;
    onUniversityChoice: (goToUniversity: boolean) => void;
    onMajorChoice: (major: UniversityMajor) => void;
    onAbandonUniversity: () => void;
    onCareerChoice: (careerTrackKey: string) => void;
    onUnderqualifiedChoice: (isTrainee: boolean) => void;
    onLoanChoice: (amount: number, term: number) => void;
    onPromotionAccept: () => void;
    onAssignToBusiness: (businessId: string, slotIndex: number, characterId: string | null) => void;
    onUpgradeBusiness: (businessId: string) => void;
    onBuyBusiness: (businessType: string) => void;
    onContinueGame: () => void;
    onStartNewGame: () => void;
    onPurchaseAsset: (assetId: string) => void;
    onSetMainView: (view: 'tree' | 'business') => void;
}

export const GameUI: React.FC<GameUIProps> = ({
    view,
    mainView,
    gameState,
    isPaused,
    gameSpeed,
    showInstructions,
    selectedCharacter,
    lang,
    avatarImages,
    onSetLang,
    onStartGame,
    onShowInstructions,
    onCloseInstructions,
    onQuitGame,
    onSetIsPaused,
    onSetGameSpeed,
    onSetSelectedCharacter,
    onOpenAvatarBuilder,
    onEventChoice,
    onEventModalClose,
    onSchoolChoice,
    onClubChoice,
    onUniversityChoice,
    onMajorChoice,
    onAbandonUniversity,
    onCareerChoice,
    onUnderqualifiedChoice,
    onLoanChoice,
    onPromotionAccept,
    onAssignToBusiness,
    onUpgradeBusiness,
    onBuyBusiness,
    onContinueGame,
    onStartNewGame,
    onPurchaseAsset,
    onSetMainView,
}) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('log');
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    
    useEffect(() => {
        if (editingBusiness && gameState?.familyBusinesses) {
            const updatedBusiness = gameState.familyBusinesses[editingBusiness.id];
            if (updatedBusiness && JSON.stringify(updatedBusiness.slots) !== JSON.stringify(editingBusiness.slots)) {
                setEditingBusiness(updatedBusiness);
            }
        }
    }, [gameState?.familyBusinesses, editingBusiness]);

    const handleTabClick = useCallback((tabName: ActiveTab) => {
        setActiveTab(tabName);
        if (tabName === 'businesses') {
            onSetMainView('business');
        } else {
            onSetMainView('tree');
        }
    }, [onSetMainView]);
    
    if (view === 'welcome_back') {
        return <WelcomeBackMenu onContinue={onContinueGame} onStartNew={onStartNewGame} lang={lang} />;
    }

    if (view === 'menu') {
        return (
            <>
                <StartMenu onStart={onStartGame} onShowInstructions={onShowInstructions} lang={lang} />
                {showInstructions && <InstructionsModal onClose={onCloseInstructions} lang={lang} />}
            </>
        );
    }

    if (!gameState) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const rootCharacter = Object.values(gameState.familyMembers).find(c => c.generation === 1 && c.isPlayerCharacter);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {view === 'gameover' && gameState.gameOverReason && <SummaryScreen gameState={gameState} onRestart={onStartNewGame} lang={lang}/>}
            {gameState.activeEvent && (
                <EventModal 
                    eventData={gameState.activeEvent}
                    character={gameState.familyMembers[gameState.activeEvent.characterId]}
                    onChoice={onEventChoice} 
                    onClose={onEventModalClose}
                    lang={lang}
                    manifest={exampleManifest}
                    images={avatarImages}
                    onAvatarClick={onSetSelectedCharacter}
                />
            )}
            {gameState.pendingSchoolChoice && gameState.pendingSchoolChoice.length > 0 && (
                <SchoolChoiceModal
                    character={gameState.familyMembers[gameState.pendingSchoolChoice[0].characterId]}
                    schoolOptions={SCHOOL_OPTIONS[gameState.pendingSchoolChoice[0].newPhase]}
                    onSelect={onSchoolChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                />
            )}
            {gameState.pendingClubChoice && (
                <ClubChoiceModal
                    character={gameState.familyMembers[gameState.pendingClubChoice.characterId]}
                    clubs={gameState.pendingClubChoice.options}
                    onSelect={onClubChoice}
                    onSkip={() => onClubChoice(null)}
                    lang={lang}
                />
            )}
             {gameState.pendingUniversityChoice && gameState.pendingUniversityChoice.length > 0 && (
                <UniversityChoiceModal
                    character={gameState.familyMembers[gameState.pendingUniversityChoice[0].characterId]}
                    onSelect={onUniversityChoice}
                    lang={lang}
                />
            )}
            {gameState.pendingMajorChoice && (
                <UniversityMajorChoiceModal
                    character={gameState.familyMembers[gameState.pendingMajorChoice.characterId]}
                    majors={gameState.pendingMajorChoice.options}
                    onSelect={onMajorChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                    onAbandon={onAbandonUniversity}
                />
            )}
            {gameState.pendingCareerChoice && (
                 <CareerChoiceModal
                    character={gameState.familyMembers[gameState.pendingCareerChoice.characterId]}
                    options={gameState.pendingCareerChoice.options}
                    onSelect={onCareerChoice}
                    currentFunds={gameState.familyFund}
                    lang={lang}
                />
            )}
            {gameState.pendingUnderqualifiedChoice && (
                <UnderqualifiedChoiceModal
                    character={gameState.familyMembers[gameState.pendingUnderqualifiedChoice.characterId]}
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
                />
            )}
             {gameState.pendingLoanChoice && (
                <LoanModal onLoanChoice={onLoanChoice} lang={lang} />
            )}
            {gameState.pendingPromotion && (
                <PromotionModal 
                    characterName={getCharacterDisplayName(gameState.familyMembers[gameState.pendingPromotion.characterId], lang)}
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
            
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 pb-4 flex flex-wrap gap-x-8 gap-y-4 items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-extrabold text-pink-500" style={{textShadow: '2px 2px 0 white'}}>{t('game_title', lang)}</h1>
                        <span className="font-bold text-slate-500">{formatDate(gameState.currentDate.day, gameState.currentDate.year, lang)}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl flex items-center gap-4 soft-shadow">
                        <div className="flex items-baseline">
                            <span className="text-slate-500 font-bold">{t('family_fund_label', lang)}:</span>
                            <span className={`font-extrabold text-xl ml-2 ${gameState.familyFund >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
                                ${Math.round(gameState.familyFund).toLocaleString()}
                            </span>
                            {gameState.monthlyNetChange !== 0 && (
                                <span className={`text-sm ml-2 font-mono font-bold ${gameState.monthlyNetChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ({gameState.monthlyNetChange > 0 ? '+' : ''}{Math.round(gameState.monthlyNetChange).toLocaleString()}/mo)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="bg-white p-1 rounded-xl flex items-center gap-1 soft-shadow">
                            <button onClick={() => onSetLang('en')} className={`px-3 py-1 text-sm font-bold rounded-lg ${lang === 'en' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-500'}`}>EN</button>
                            <button onClick={() => onSetLang('vi')} className={`px-3 py-1 text-sm font-bold rounded-lg ${lang === 'vi' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-500'}`}>VI</button>
                        </div>
                        <button onClick={onQuitGame} className="chunky-button chunky-button-slate">{t('quit_game_button', lang)}</button>
                        <button onClick={() => onSetIsPaused(!isPaused)} className="chunky-button chunky-button-blue">
                            {isPaused ? t('resume_button', lang) : t('pause_button', lang)}
                        </button>
                        <select 
                            value={gameSpeed} 
                            onChange={(e) => onSetGameSpeed(Number(e.target.value))} 
                            className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                            <option value={200}>{t('speed_slow', lang)}</option>
                            <option value={100}>{t('speed_normal', lang)}</option>
                            <option value={50}>{t('speed_fast', lang)}</option>
                            <option value={10}>{t('speed_very_fast', lang)}</option>
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`${mainView === 'business' ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white/80 backdrop-blur-sm p-4 rounded-2xl h-[80vh] soft-shadow flex flex-col overflow-hidden`}>
                        {mainView === 'tree' ? (
                            <>
                                <h2 className="text-2xl font-extrabold mb-4 text-indigo-500 p-2 flex-shrink-0">{t('family_tree_title', lang)}</h2>
                                <div className="flex-grow w-full text-center p-4 overflow-auto">
                                    {rootCharacter ? <FamilyTree characterId={rootCharacter.id} allMembers={gameState.familyMembers} onAvatarClick={onSetSelectedCharacter} lang={lang} images={avatarImages} manifest={exampleManifest} /> : <p>Your family story begins...</p>}
                                </div>
                            </>
                        ) : (
                            <BusinessMap 
                                gameState={gameState} 
                                onBuyBusiness={onBuyBusiness}
                                onManageBusiness={(business) => setEditingBusiness(business)}
                                lang={lang}
                                images={avatarImages}
                                manifest={exampleManifest}
                                mainView={mainView} // Pass the mainView prop
                                onBackToTree={() => {
                                    onSetMainView('tree');
                                    setActiveTab('log'); // Reset to log tab when going back to tree view
                                }}
                            />
                        )}
                    </div>
                    <div className={`${mainView === 'business' ? 'hidden' : 'lg:col-span-1'} h-[80vh] flex flex-col`}>
                        <div className="flex-shrink-0">
                            <TabButton label={t('tab_log', lang)} isActive={activeTab === 'log'} onClick={() => handleTabClick('log')} />
                            <TabButton label={t('tab_assets', lang)} isActive={activeTab === 'assets'} onClick={() => handleTabClick('assets')} />
                            <TabButton label={t('tab_businesses', lang)} isActive={activeTab === 'businesses'} onClick={() => handleTabClick('businesses')} />
                        </div>
                         <div className="flex-grow h-0 -mt-px bg-white rounded-r-2xl rounded-b-2xl soft-shadow">
                            <div className={`h-full ${activeTab === 'log' || mainView === 'tree' && activeTab !== 'assets' ? '' : 'hidden'}`}>
                                <GameLog log={gameState.gameLog} lang={lang} familyMembers={gameState.familyMembers} />
                            </div>
                            <div className={`h-full ${activeTab === 'assets' ? '' : 'hidden'}`}>
                                <FamilyAssetsPanel 
                                    purchasedAssets={gameState.purchasedAssets} 
                                    familyFund={gameState.familyFund}
                                    onPurchaseAsset={onPurchaseAsset}
                                    lang={lang} 
                                />
                            </div>
                            <div className={`h-full ${activeTab === 'businesses' ? '' : 'hidden'}`}>
                                 <div className="p-4 h-full overflow-y-auto">
                                    <h3 className="text-2xl font-black mb-4 text-blue-400">{t('family_businesses_title', lang)}</h3>
                                    <p className="text-slate-500">{t('business_map_intro', lang)}</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
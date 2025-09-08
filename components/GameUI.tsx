import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ImageSourcePropType } from 'react-native';
import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Manifest, Business, Club, Language } from '../core/types';
import { formatDate, getCharacterDisplayName } from '../core/utils';
import { CAREER_LADDER, SCHOOL_OPTIONS, UNIVERSITY_MAJORS, ASSET_DEFINITIONS } from '../core/constants';
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
import { t } from '../core/localization';
import { exampleManifest } from '../core/types';
import { BusinessMap } from './BusinessMap';
import { FamilyAssetsPanel } from './FamilyAssetsPanel';
import { Picker } from '@react-native-picker/picker';

type ActiveTab = 'log' | 'assets' | 'businesses';

const TabButtonInternal: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        gameUIStyles.tabButtonBase,
        isActive ? gameUIStyles.tabButtonActive : gameUIStyles.tabButtonInactive,
      ]}
    >
      <Text style={gameUIStyles.tabButtonText}>{label}</Text>
    </TouchableOpacity>
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
    avatarImages: Record<string, ImageSourcePropType>; // Changed HTMLImageElement to ImageSourcePropType
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
        return <View style={[gameUIStyles.flexCenter, gameUIStyles.fullScreen]}><Text>Loading...</Text></View>;
    }

    const rootCharacter = Object.values(gameState.familyMembers).find(c => c.generation === 1 && c.isPlayerCharacter);

    return (
        <View style={gameUIStyles.mainContainer}>
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
            
            <View style={gameUIStyles.maxWidthContainer}>
                <View style={gameUIStyles.headerContainer}>
                    <View style={gameUIStyles.headerLeft}>
                        <Text style={gameUIStyles.gameTitle}>{t('game_title', lang)}</Text>
                        <Text style={gameUIStyles.dateText}>{formatDate(gameState.currentDate.day, gameState.currentDate.year, lang)}</Text>
                    </View>
                    <View style={gameUIStyles.fundContainer}>
                        <View style={gameUIStyles.fundTextContainer}>
                            <Text style={gameUIStyles.fundLabel}>{t('family_fund_label', lang)}:</Text>
                            <Text style={[gameUIStyles.fundValue, gameState.familyFund >= 0 ? gameUIStyles.fundPositive : gameUIStyles.fundNegative]}>
                                ${Math.round(gameState.familyFund).toLocaleString()}
                            </Text>
                            {gameState.monthlyNetChange !== 0 && (
                                <Text style={[gameUIStyles.monthlyChange, gameState.monthlyNetChange >= 0 ? gameUIStyles.monthlyChangePositive : gameUIStyles.monthlyChangeNegative]}>
                                    ({gameState.monthlyNetChange > 0 ? '+' : ''}{Math.round(gameState.monthlyNetChange).toLocaleString()}/mo)
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={gameUIStyles.headerRight}>
                         <View style={gameUIStyles.languageButtonsContainer}>
                            <TouchableOpacity onPress={() => onSetLang('en')} style={[gameUIStyles.languageButton, lang === 'en' ? gameUIStyles.languageButtonActive : gameUIStyles.languageButtonInactive]}>
                                <Text style={gameUIStyles.languageButtonText}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onSetLang('vi')} style={[gameUIStyles.languageButton, lang === 'vi' ? gameUIStyles.languageButtonActive : gameUIStyles.languageButtonInactive]}>
                                <Text style={gameUIStyles.languageButtonText}>VI</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onQuitGame} style={gameUIStyles.chunkyButtonSlate}><Text style={gameUIStyles.chunkyButtonText}>{t('quit_game_button', lang)}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => onSetIsPaused(!isPaused)} style={gameUIStyles.chunkyButtonBlue}>
                            <Text style={gameUIStyles.chunkyButtonText}>{isPaused ? t('resume_button', lang) : t('pause_button', lang)}</Text>
                        </TouchableOpacity>
                        <Picker
                            selectedValue={gameSpeed}
                            onValueChange={(itemValue) => onSetGameSpeed(Number(itemValue))}
                            style={gameUIStyles.speedPicker}
                            itemStyle={gameUIStyles.speedPickerItem}
                        >
                            <Picker.Item label={t('speed_slow', lang)} value={200} />
                            <Picker.Item label={t('speed_normal', lang)} value={100} />
                            <Picker.Item label={t('speed_fast', lang)} value={50} />
                            <Picker.Item label={t('speed_very_fast', lang)} value={10} />
                        </Picker>
                    </View>
                </View>

                <View style={gameUIStyles.mainContentGrid}>
                    <View style={[gameUIStyles.mainContentLeft, mainView === 'business' ? gameUIStyles.mainContentLeftFull : gameUIStyles.mainContentLeftPartial]}>
                        {mainView === 'tree' ? (
                            <>
                                <Text style={gameUIStyles.familyTreeTitle}>{t('family_tree_title', lang)}</Text>
                                <View style={gameUIStyles.familyTreeContainer}>
                                    {rootCharacter ? <FamilyTree characterId={rootCharacter.id} allMembers={gameState.familyMembers} onAvatarClick={onSetSelectedCharacter} lang={lang} images={avatarImages} manifest={exampleManifest} /> : <Text style={gameUIStyles.noFamilyText}>Your family story begins...</Text>}
                                </View>
                            </>
                        ) : (
                            <BusinessMap 
                                gameState={gameState} 
                                onBuyBusiness={onBuyBusiness}
                                onManageBusiness={(business) => setEditingBusiness(business)}
                                lang={lang}
                                images={avatarImages}
                                manifest={exampleManifest}
                                mainView={mainView}
                                onBackToTree={() => {
                                    onSetMainView('tree');
                                    setActiveTab('log');
                                }}
                            />
                        )}
                    </View>
                    <View style={gameUIStyles.mainContentRight}>
                        <View style={gameUIStyles.tabButtonsContainer}>
                            <TabButton label={t('tab_log', lang)} isActive={activeTab === 'log'} onClick={() => handleTabClick('log')} />
                            <TabButton label={t('tab_assets', lang)} isActive={activeTab === 'assets'} onClick={() => handleTabClick('assets')} />
                            <TabButton label={t('tab_businesses', lang)} isActive={activeTab === 'businesses'} onClick={() => handleTabClick('businesses')} />
                        </View>
                         <View style={gameUIStyles.tabContentContainer}>
                            <View style={[gameUIStyles.tabContent, (activeTab === 'log' || (mainView === 'tree' && activeTab !== 'assets')) ? {} : gameUIStyles.hidden]}>
                                <GameLog log={gameState.gameLog} lang={lang} familyMembers={gameState.familyMembers} />
                            </View>
                            <View style={[gameUIStyles.tabContent, activeTab === 'assets' ? {} : gameUIStyles.hidden]}>
                                <FamilyAssetsPanel 
                                    purchasedAssets={gameState.purchasedAssets} 
                                    familyFund={gameState.familyFund}
                                    onPurchaseAsset={onPurchaseAsset}
                                    lang={lang} 
                                />
                            </View>
                            <View style={[gameUIStyles.tabContent, activeTab === 'businesses' ? {} : gameUIStyles.hidden]}>
                                 <View style={gameUIStyles.businessPanelInner}>
                                    <Text style={gameUIStyles.businessPanelTitle}>{t('family_businesses_title', lang)}</Text>
                                    <Text style={gameUIStyles.businessPanelIntro}>{t('business_map_intro', lang)}</Text>
                                </View>
                            </View>
                         </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

// NOTE: This is a simplified stylesheet. A real app would have more extensive styling.
const gameUIStyles = StyleSheet.create({
    flexCenter: { alignItems: 'center', justifyContent: 'center' },
    fullScreen: { flex: 1 },
    mainContainer: { flex: 1, backgroundColor: '#f0f4f8' },
    maxWidthContainer: { flex: 1, padding: 16 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerLeft: { },
    gameTitle: { fontSize: 32, fontWeight: 'bold', color: '#ec4899' },
    dateText: { fontSize: 16, color: '#64748b' },
    fundContainer: { },
    fundTextContainer: { flexDirection: 'row', alignItems: 'baseline' },
    fundLabel: { fontSize: 16, color: '#64748b' },
    fundValue: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
    fundPositive: { color: '#1f2937' },
    fundNegative: { color: '#ef4444' },
    monthlyChange: { fontSize: 14, marginLeft: 8 },
    monthlyChangePositive: { color: '#22c55e' },
    monthlyChangeNegative: { color: '#ef4444' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    languageButtonsContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 8, padding: 4 },
    languageButton: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
    languageButtonActive: { backgroundColor: '#6366f1' },
    languageButtonInactive: { backgroundColor: 'transparent' },
    languageButtonText: { color: 'white', fontWeight: 'bold' },
    chunkyButtonSlate: { backgroundColor: '#64748b', padding: 12, borderRadius: 8 },
    chunkyButtonBlue: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 },
    chunkyButtonText: { color: 'white', fontWeight: 'bold' },
    speedPicker: { width: 150, height: 44 },
    speedPickerItem: { height: 44 },
    mainContentGrid: { flexDirection: 'row', flex: 1, gap: 16 },
    mainContentLeft: { flex: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 16, padding: 16 },
    mainContentLeftFull: { flex: 3 },
    mainContentLeftPartial: { flex: 2 },
    familyTreeTitle: { fontSize: 24, fontWeight: 'bold', color: '#6366f1', marginBottom: 16 },
    familyTreeContainer: { flex: 1 },
    noFamilyText: { fontStyle: 'italic', color: '#64748b' },
    mainContentRight: { flex: 1, flexDirection: 'column' },
    tabButtonsContainer: { flexDirection: 'row' },
    tabButtonBase: { paddingHorizontal: 24, paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    tabButtonActive: { backgroundColor: 'white' },
    tabButtonInactive: { backgroundColor: '#e2e8f0' },
    tabButtonText: { fontSize: 18, fontWeight: 'bold' },
    tabContentContainer: { flex: 1, backgroundColor: 'white', borderRadius: 16, borderTopLeftRadius: 0 },
    tabContent: { flex: 1, padding: 16 },
    hidden: { display: 'none' },
    businessPanelInner: { padding: 16 },
    businessPanelTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginBottom: 16 },
    businessPanelIntro: { color: '#64748b' },
});
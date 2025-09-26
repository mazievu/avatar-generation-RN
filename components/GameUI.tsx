import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageSourcePropType, TextInput, Image, Dimensions } from 'react-native';

import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Business, Language } from '../core/types';
import { formatDate, getCharacterDisplayName } from '../core/utils';
import { FamilyTree } from './FamilyTree';
import { GameLog } from './GameLog';
import { SummaryScreen } from './SummaryScreen';
import { StartMenu } from './StartMenu';
import { InstructionsModal } from './InstructionsModal';
import { WelcomeBackMenu } from './WelcomeBackMenu';
import { StoryChoiceModal } from './StoryChoiceModal';
import { t } from '../core/localization';
import { exampleManifest } from '../core/types';
import { BusinessMap } from './BusinessMap';
import { FamilyAssetsPanel } from './FamilyAssetsPanel';
import { ModalManager } from './ModalManager';
import SettingsModal from './SettingsModal';
import { UnlockNotificationModal } from './UnlockNotificationModal';
import { PathOfLifeScreen } from './PathOfLifeScreen'; // Corrected import path
import { colors } from './designSystem';
import CharacterListModal from './CharacterListModal'; // New import

const { width: screenWidth } = Dimensions.get('window');
const responsiveSize = (size: number) => Math.round(size * (screenWidth / 375));

export type SceneName = 'tree' | 'log' | 'assets' | 'business' | 'path';

import { BUSINESS_UNLOCK_CHILDREN_COUNT } from '../core/constants';

const BottomNav: React.FC<{
  activeScene: SceneName;
  onSceneChange: (scene: SceneName) => void;
  gameState: GameState;
}> = ({ activeScene, onSceneChange, gameState }) => {
  const isBusinessUnlocked = gameState.totalChildrenBorn >= BUSINESS_UNLOCK_CHILDREN_COUNT;

  return (
    <View style={gameUIStyles.bottomNavContainer}>
      <TouchableOpacity onPress={() => onSceneChange('log')} style={[gameUIStyles.bottomNavButton, activeScene === 'log' && gameUIStyles.bottomNavButtonActive]}>
        <View><Image source={require('../assets/icon_log.webp')} style={gameUIStyles.bottomNavIcon} /></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('assets')} style={[gameUIStyles.bottomNavButton, activeScene === 'assets' && gameUIStyles.bottomNavButtonActive]}>
        <View><Image source={require('../assets/icon_assets.webp')} style={gameUIStyles.bottomNavIcon} /></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('tree')} style={[gameUIStyles.bottomNavButton, activeScene === 'tree' && gameUIStyles.bottomNavButtonActive]}>
        <View><Image source={require('../assets/icon_family_tree.webp')} style={gameUIStyles.bottomNavIcon} /></View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSceneChange('business')}
        style={[
            gameUIStyles.bottomNavButton,
            activeScene === 'business' && gameUIStyles.bottomNavButtonActive,
            !isBusinessUnlocked && gameUIStyles.disabledButton
        ]}
        disabled={!isBusinessUnlocked}
      >
        <View><Image source={require('../assets/icon_business.webp')} style={gameUIStyles.bottomNavIcon} /></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('path')} style={[gameUIStyles.bottomNavButton, activeScene === 'path' && gameUIStyles.bottomNavButtonActive]}>
        <View><Image source={require('../assets/icon_path.webp')} style={gameUIStyles.bottomNavIcon} /></View>
      </TouchableOpacity>
    </View>
  );
};


interface GameUIProps {
    view: 'menu' | 'playing' | 'gameover' | 'welcome_back';
    mainView: 'tree' | 'business';
    gameState: GameState | null;
    isPaused: boolean;
    gameSpeed: number;
    showInstructions: boolean;
    selectedCharacter: Character | null;
    lang: Language;
    avatarImages: Record<string, ImageSourcePropType>;
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
    onSellBusiness: (businessId: string) => void;
    onSetMainView: (view: 'tree' | 'business') => void;
    onSetFamilyName: (name: string) => void;
    activeScene: SceneName;
    onSetActiveScene: (scene: SceneName) => void;
    onAcknowledgeUnlock: () => void;
    onClearNewlyUnlockedFeature: () => void;
    onClaimFeature: (featureId: string) => void;
    pendingStatBoost: { stat: keyof Character['stats'], amount: number, featureId: string } | null; // New prop
    onConfirmStatBoost: (characterId: string) => void; // New prop
    onCloseStatBoostModal: () => void; // New prop
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
    onSellBusiness,
    onSetMainView,
    onSetFamilyName,
    activeScene,
    onSetActiveScene,
    onAcknowledgeUnlock,
    onClearNewlyUnlockedFeature,
    onClaimFeature,
    pendingStatBoost, // New prop
    onConfirmStatBoost, // New prop
    onCloseStatBoostModal, // New prop
}) => {
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [characterIdToCenterOnEvent, setCharacterIdToCenterOnEvent] = useState<string | null>(null);
    const [isCenteringAnimationDone, setIsCenteringAnimationDone] = useState(false);
    const [showStoryChoiceModal, setShowStoryChoiceModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);


    const [familyNameInput, setFamilyNameInput] = useState<string>(
        gameState?.familyName || (gameState?.familyMembers && Object.keys(gameState.familyMembers).length > 0
            ? `${getCharacterDisplayName(gameState.familyMembers[Object.keys(gameState.familyMembers)[0]], lang)}${t('family_suffix', lang)}`
            : t('default_family_name_placeholder', lang)))
    ;

    useEffect(() => {
        if (gameState?.familyName && gameState.familyName !== familyNameInput) {
            setFamilyNameInput(gameState.familyName);
        }
    }, [gameState?.familyName, familyNameInput]);


    const onCharacterCenteredOnEvent = useCallback(() => {
        setCharacterIdToCenterOnEvent(null);
        setIsCenteringAnimationDone(true);
    }, []);

    useEffect(() => {
        if (gameState?.activeEvent?.characterId) {
            setCharacterIdToCenterOnEvent(gameState.activeEvent.characterId);
            setIsCenteringAnimationDone(false);
        } else {
            setIsCenteringAnimationDone(false);
        }
    }, [gameState?.activeEvent?.characterId]);

    const handleEventHandled = useCallback(() => {
        // Logic to handle event being handled
    }, []);

    useEffect(() => {
        if (editingBusiness && gameState?.familyBusinesses) {
            const updatedBusiness = gameState.familyBusinesses[editingBusiness.id];
            if (updatedBusiness && JSON.stringify(updatedBusiness.slots) !== JSON.stringify(editingBusiness.slots)) {
                setEditingBusiness(updatedBusiness);
            }
        }
    }, [gameState?.familyBusinesses, editingBusiness]);

    const handleSceneChange = (scene: SceneName) => {
        onSetActiveScene(scene);
        onSetIsPaused(scene !== 'tree');

        if (scene === 'business') {
            onSetMainView('business');
        } else if (mainView === 'business' && (scene === 'tree' || scene === 'log' || scene === 'assets' || scene === 'path')) {
            onSetMainView('tree');
        }
    };

    if (view === 'welcome_back') {
        return <WelcomeBackMenu onContinue={onContinueGame} onStartNew={onStartNewGame} lang={lang} />;
    }

    if (view === 'menu') {
        return (
            <>
                <StartMenu onStart={() => onStartGame('classic')} onShowInstructions={onShowInstructions} lang={lang} onSetLang={onSetLang} />
                {showInstructions && <InstructionsModal onClose={onCloseInstructions} lang={lang} />}
            </>
        );
    }

    if (!gameState) {
        return <View style={[gameUIStyles.flexCenter, gameUIStyles.fullScreen]}><Text>Loading...</Text></View>;
    }

    const renderScene = () => {
        switch (activeScene) {
            case 'tree':
                return (
                    <View style={gameUIStyles.sceneContainer}>
                        <View style={gameUIStyles.familyTreeContainer}>
                            <FamilyTree
                                gameState={gameState}
                                onSelectCharacter={onSetSelectedCharacter}
                                lang={lang}
                                images={avatarImages}
                                manifest={exampleManifest}
                                selectedCharacter={selectedCharacter}
                                characterIdToCenterOnEvent={characterIdToCenterOnEvent}
                                onCharacterCenteredOnEvent={onCharacterCenteredOnEvent}
                            />
                        </View>
                        <TextInput
                            style={gameUIStyles.familyTreeTitleEditable}
                            value={familyNameInput}
                            onChangeText={setFamilyNameInput}
                            onBlur={() => onSetFamilyName(familyNameInput)}
                            onSubmitEditing={() => onSetFamilyName(familyNameInput)}
                        />
                    </View>
                );
            case 'log':
                return <GameLog log={gameState.gameLog} lang={lang} familyMembers={gameState.familyMembers} />;
            case 'assets':
                return <FamilyAssetsPanel
                            purchasedAssets={gameState.purchasedAssets}
                            familyFund={gameState.familyFund}
                            onPurchaseAsset={onPurchaseAsset}
                            lang={lang}
                        />;
            case 'business':
                return <BusinessMap
                            gameState={gameState}
                            onBuyBusiness={onBuyBusiness}
                            onManageBusiness={(business) => setEditingBusiness(business)}
                            lang={lang}
                            images={avatarImages}
                            manifest={exampleManifest}
                            mainView={mainView}
                            onBackToTree={() => {
                                onSetMainView('tree');
                                onSetActiveScene('tree');
                                onSetIsPaused(false);
                            }}
                        />;
            default:
                return null;
        }
    }

    if (activeScene === 'path' && gameState) {
        return (
            <View style={gameUIStyles.mainContainer}>
                <PathOfLifeScreen
                    gameState={gameState}
                    lang={lang}
                    onClaimFeature={onClaimFeature}
                />
                <BottomNav activeScene={activeScene} onSceneChange={handleSceneChange} gameState={gameState} />
            </View>
        );
    }

    return (
        <View style={gameUIStyles.mainContainer}>

            <StoryChoiceModal
                isVisible={showStoryChoiceModal}
                onClose={() => setShowStoryChoiceModal(false)}
                onSelectMode={(mode) => {
                    onStartGame(mode);
                    setShowStoryChoiceModal(false);
                }}
                lang={lang}
            />

            {view === 'gameover' && gameState.gameOverReason && <SummaryScreen gameState={gameState} onRestart={onStartNewGame} lang={lang}/>}

            <ModalManager
                gameState={gameState}
                selectedCharacter={selectedCharacter}
                editingBusiness={editingBusiness}
                avatarImages={avatarImages}
                onEventChoice={onEventChoice}
                onEventModalClose={onEventModalClose}
                onEventHandled={handleEventHandled}
                onSetSelectedCharacter={onSetSelectedCharacter}
                onSchoolChoice={onSchoolChoice}
                onClubChoice={onClubChoice}
                onUniversityChoice={onUniversityChoice}
                onMajorChoice={onMajorChoice}
                onAbandonUniversity={onAbandonUniversity}
                onCareerChoice={onCareerChoice}
                onUnderqualifiedChoice={onUnderqualifiedChoice}
                onOpenAvatarBuilder={onOpenAvatarBuilder}
                onLoanChoice={onLoanChoice}
                onPromotionAccept={onPromotionAccept}
                onAssignToBusiness={onAssignToBusiness}
                onUpgradeBusiness={onUpgradeBusiness}
                onSellBusiness={onSellBusiness}
                setEditingBusiness={setEditingBusiness}
                isCenteringAnimationDone={isCenteringAnimationDone}
            />

            {view === 'playing' && (
                <TouchableOpacity onPress={() => setShowStoryChoiceModal(true)} style={gameUIStyles.storyButton}>
                    <Text style={gameUIStyles.storyButtonText}>{t('story_button', lang)}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={gameUIStyles.settingsButton}>
                <Text style={gameUIStyles.settingsButtonText}>{t('settings_button', lang)}</Text>
            </TouchableOpacity>

            <SettingsModal
                isVisible={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                lang={lang}
                gameSpeed={gameSpeed}
                onSetGameSpeed={onSetGameSpeed}
                onQuitGame={onQuitGame}
                isPaused={isPaused}
                onSetIsPaused={onSetIsPaused}
            />

            {gameState && (
                <UnlockNotificationModal
                    newlyUnlockedFeatureId={gameState.newlyUnlockedFeature}
                    onAcknowledge={onAcknowledgeUnlock}
                    lang={lang}
                />
            )}

            {gameState && pendingStatBoost && (
                <CharacterListModal
                    isVisible={!!pendingStatBoost}
                    characters={Object.values(gameState.familyMembers)}
                    pendingBoost={pendingStatBoost}
                    onConfirm={onConfirmStatBoost}
                    onClose={onCloseStatBoostModal}
                />
            )}

            <View style={gameUIStyles.maxWidthContainer}>
                <View style={gameUIStyles.headerContainer}>
                    <View style={gameUIStyles.headerLeft}>
                        <Text style={gameUIStyles.dateText}>{formatDate(gameState.currentDate.day, gameState.currentDate.year, lang)}</Text>
                    </View>
                    <View style={gameUIStyles.fundBubble}>
                        <Text style={gameUIStyles.fundIcon}>$</Text>
                        <View style={gameUIStyles.fundTextContainer}>
                            <Text style={[gameUIStyles.fundValue, gameState.familyFund >= 0 ? gameUIStyles.fundPositive : gameUIStyles.fundNegative]}>
                                {Math.round(gameState.familyFund).toLocaleString()}
                            </Text>
                            {gameState.monthlyNetChange !== 0 && (
                                <Text style={[gameUIStyles.monthlyChange, gameState.monthlyNetChange >= 0 ? gameUIStyles.monthlyChangePositive : gameUIStyles.monthlyChangeNegative]}>
                                    ({gameState.monthlyNetChange > 0 ? '+' : ''}{Math.round(gameState.monthlyNetChange).toLocaleString()}/mo)
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={gameUIStyles.mainContentGrid}>
                    {renderScene()}
                </View>
            </View>
            <BottomNav activeScene={activeScene} onSceneChange={handleSceneChange} gameState={gameState} />
        </View>
    );
};

const gameUIStyles = StyleSheet.create({
    bottomNavButton: {
        alignItems: 'center',
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 20,
        padding: 4,
    },
    bottomNavButtonActive: {
        backgroundColor: colors.primary,
    },
    bottomNavContainer: {
        backgroundColor: colors.neutral200,
        borderTopWidth: 0,
        bottom: 0,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        left: 0,
        paddingVertical: 15,
        position: 'absolute',
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomNavIcon: {
        height: 50,
        width: 50,
    },
    chunkyButtonBlue: { backgroundColor: colors.primary, borderRadius: 8, padding: 12 },
    chunkyButtonSlate: { backgroundColor: colors.neutral700, borderRadius: 8, padding: 12 },
    chunkyButtonText: { color: colors.white, fontWeight: 'bold' },
    disabledButton: { opacity: 0.5 },
    dateText: { color: colors.textSecondary, fontSize: 21 },
    familyTreeContainer: { flex: 1 },
    familyTreeTitle: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    familyTreeTitleEditable: {
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: 8,
        color: colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingVertical: 4,
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    flexCenter: { alignItems: 'center', justifyContent: 'center' },
    fullScreen: { flex: 1 },
    fundBubble: {
        alignItems: 'center',
        backgroundColor: colors.neutral100,
        borderRadius: 20,
        elevation: 4,
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    fundContainer: { },
    fundIcon: {
        color: colors.success,
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 5,
    },
    fundLabel: { color: colors.textSecondary, fontSize: 16 },
    fundNegative: { color: colors.error },
    fundPositive: { color: colors.textPrimary },
    fundTextContainer: { alignItems: 'baseline', flexDirection: 'row' },
    fundValue: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
    gameTitle: { color: colors.primary, fontSize: 32, fontWeight: 'bold' },
    headerContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { },
    headerRight: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
    mainContainer: { backgroundColor: colors.neutral50, flex: 1 },
    mainContentGrid: { flex: 1 },
    maxWidthContainer: { flex: 1, padding: 16, paddingBottom: 90 },
    monthlyChange: { fontSize: 14, marginLeft: 8 },
    monthlyChangeNegative: { color: colors.error },
    monthlyChangePositive: { color: colors.success },
    noFamilyText: { color: colors.textSecondary, fontStyle: 'italic' },
    overlayControlsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
    },
    sceneContainer: {
        flex: 1,
        position: 'relative',
    },
    settingsButton: {
        backgroundColor: colors.accent,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        position: 'absolute',
        right: 16,
        top: 140,
        zIndex: 10,
    },
    settingsButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    speedPicker: { height: 44, width: responsiveSize(120) },
    speedPickerItem: { height: 44 },
    storyButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        position: 'absolute',
        right: 16,
        top: 90,
        zIndex: 10,
    },
    storyButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
});

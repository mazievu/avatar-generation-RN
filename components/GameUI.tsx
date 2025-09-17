import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ImageSourcePropType, Dimensions, TextInput, Image } from 'react-native';


import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Manifest, Business, Club, Language } from '../core/types';
import { formatDate, getCharacterDisplayName } from '../core/utils';
import { ASSET_DEFINITIONS } from '../core/constants';
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
import { Picker } from '@react-native-picker/picker';
import { ModalManager } from './ModalManager';
import SettingsModal from './SettingsModal';
import { colors } from './designSystem';
import { CLUBS } from '../core/clubsAndEventsData';
import { imageAssets } from './ImageAssets';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

export type SceneName = 'tree' | 'log' | 'assets' | 'business';

const BottomNav: React.FC<{
  activeScene: SceneName;
  onSceneChange: (scene: SceneName) => void;
  lang: Language;
}> = ({ activeScene, onSceneChange, lang }) => {
  return (
    <View style={gameUIStyles.bottomNavContainer}>
      <TouchableOpacity onPress={() => onSceneChange('tree')} style={[gameUIStyles.bottomNavButton, activeScene === 'tree' && gameUIStyles.bottomNavButtonActive]}>
        <Image source={imageAssets['../public/asset/icon_family_tree.webp']} style={gameUIStyles.bottomNavIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('log')} style={[gameUIStyles.bottomNavButton, activeScene === 'log' && gameUIStyles.bottomNavButtonActive]}>
        <Image source={imageAssets['../public/asset/icon_log.webp']} style={gameUIStyles.bottomNavIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('assets')} style={[gameUIStyles.bottomNavButton, activeScene === 'assets' && gameUIStyles.bottomNavButtonActive]}>
        <Image source={imageAssets['../public/asset/icon_assets.webp']} style={gameUIStyles.bottomNavIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('business')} style={[gameUIStyles.bottomNavButton, activeScene === 'business' && gameUIStyles.bottomNavButtonActive]}>
        <Image source={imageAssets['../public/asset/icon_business.webp']} style={gameUIStyles.bottomNavIcon} />
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
    onSetFamilyName: (name: string) => void;
    activeScene: SceneName; // NEW PROP
    onSetActiveScene: (scene: SceneName) => void; // NEW PROP
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
    onSetFamilyName, // Added here
    activeScene, // NEW PROP
    onSetActiveScene, // NEW PROP
}) => {
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [characterIdToCenterOnEvent, setCharacterIdToCenterOnEvent] = useState<string | null>(null); // NEW STATE
    const [isCenteringAnimationDone, setIsCenteringAnimationDone] = useState(false); // NEW STATE
    
    const [showSettingsModal, setShowSettingsModal] = useState(false); // NEW STATE for settings modal
    const [showStoryChoiceModal, setShowStoryChoiceModal] = useState(false);

    // New state for editable family name
    const [familyNameInput, setFamilyNameInput] = useState<string>(
        gameState?.familyName || (gameState?.familyMembers && Object.keys(gameState.familyMembers).length > 0
            ? `${getCharacterDisplayName(gameState.familyMembers[Object.keys(gameState.familyMembers)[0]], lang)}${t('family_suffix', lang)}`
            : t('default_family_name_placeholder', lang)))
    ;

    // Effect to update familyNameInput if gameState.familyName changes externally
    useEffect(() => {
        if (gameState?.familyName && gameState.familyName !== familyNameInput) {
            setFamilyNameInput(gameState.familyName);
        }
    }, [gameState?.familyName]);


    const onCharacterCenteredOnEvent = useCallback(() => { // NEW CALLBACK
        setCharacterIdToCenterOnEvent(null); // This resets the ID in FamilyTree
        setIsCenteringAnimationDone(true); // Indicate animation is done
    }, []);

    // Effect to set characterIdToCenterOnEvent when a new event starts
    useEffect(() => {
        if (gameState?.activeEvent?.characterId) { // Check if activeEvent and characterId exist
            console.log("GameUI: Setting characterIdToCenterOnEvent to:", gameState.activeEvent.characterId);
            setCharacterIdToCenterOnEvent(gameState.activeEvent.characterId);
            setIsCenteringAnimationDone(false); // Reset for new animation
        } else {
            console.log("GameUI: activeEvent.characterId is null or undefined.");
            // If activeEvent is cleared (modal closed), reset animation done flag
            setIsCenteringAnimationDone(false);
        }
    }, [gameState?.activeEvent?.characterId]); // Dependency on activeEvent.characterId

    const handleEventHandled = useCallback(() => {
        // Logic to handle event being handled, e.g., clear current event, update game state
        console.log("Event handled!");
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
        onSetActiveScene(scene); // Always update the active tab

        // Pause if not on 'tree' tab, resume if on 'tree' tab
        onSetIsPaused(scene !== 'tree');

        // Update mainView only if explicitly going to/from 'business'
        if (scene === 'business') {
            onSetMainView('business');
        } else if (mainView === 'business' && (scene === 'tree' || scene === 'log' || scene === 'assets')) { // If currently on business mainView and switching to another non-business scene
            onSetMainView('tree'); // Revert mainView to 'tree'
        }
        // If mainView is already 'tree' and we're going to 'log' or 'assets', it stays 'tree'. This is fine.
    };
    
    if (view === 'welcome_back') {
        return <WelcomeBackMenu onContinue={onContinueGame} onStartNew={onStartNewGame} lang={lang} />;
    }

    if (view === 'menu') {
        return (
            <>
                <StartMenu onStart={() => onStartGame('new')} onShowInstructions={onShowInstructions} lang={lang} onSetLang={onSetLang} />
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
                                characterIdToCenterOnEvent={characterIdToCenterOnEvent} // NEW
                                onCharacterCenteredOnEvent={onCharacterCenteredOnEvent} // NEW
                            />
                        </View>
                        <TextInput
                            style={gameUIStyles.familyTreeTitleEditable} // Style updated to be an overlay
                            value={familyNameInput}
                            onChangeText={setFamilyNameInput}
                            onBlur={() => onSetFamilyName(familyNameInput)} // Save on blur
                            onSubmitEditing={() => onSetFamilyName(familyNameInput)} // Save on submit
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
                onEventHandled={handleEventHandled} // NEW
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
                setEditingBusiness={setEditingBusiness}
                isCenteringAnimationDone={isCenteringAnimationDone} // NEW PROP
            />
            
            {/* Story Button */}
            {view === 'playing' && (
                <TouchableOpacity onPress={() => setShowStoryChoiceModal(true)} style={gameUIStyles.storyButton}>
                    <Text style={gameUIStyles.storyButtonText}>{t('story_button', lang)}</Text>
                </TouchableOpacity>
            )}

            {/* Settings Button */}
            <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={gameUIStyles.settingsButton}>
                <Text style={gameUIStyles.settingsButtonText}>{t('settings_button', lang)}</Text>
            </TouchableOpacity>

            {/* Settings Modal */}
            <SettingsModal
                isVisible={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                lang={lang}
                
                gameSpeed={gameSpeed}
                onSetGameSpeed={onSetGameSpeed}
                onQuitGame={onQuitGame}
                isPaused={isPaused} // NEW PROP
                onSetIsPaused={onSetIsPaused} // NEW PROP
            />

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
                    {/* Removed headerRight content */}
                </View>

                <View style={gameUIStyles.mainContentGrid}>
                    {renderScene()}
                </View>
            </View>
            <BottomNav activeScene={activeScene} onSceneChange={handleSceneChange} lang={lang} />
        </View>
    );
};

// NOTE: This is a simplified stylesheet. A real app would have more extensive styling.
const gameUIStyles = StyleSheet.create({
    flexCenter: { alignItems: 'center', justifyContent: 'center' },
    fullScreen: { flex: 1 },
    mainContainer: { backgroundColor: colors.neutral50, flex: 1 }, // Use new cream background
    maxWidthContainer: { flex: 1, padding: 16, paddingBottom: 90 }, // Increased paddingBottom for taller nav
    headerContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { },
    gameTitle: { color: colors.primary, fontSize: 32, fontWeight: 'bold' },
    dateText: { color: colors.textSecondary, fontSize: 21 }, // Increased font size by ~30%
    fundContainer: { },
    fundTextContainer: { alignItems: 'baseline', flexDirection: 'row' },
    fundLabel: { color: colors.textSecondary, fontSize: 16 },
    fundValue: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
    fundPositive: { color: colors.textPrimary },
    fundNegative: { color: colors.error },
    fundBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral100, // Use light blue-gray for contrast
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    fundIcon: {
        fontSize: 20,
        marginRight: 5,
        color: colors.success, // Use success color from design system
        fontWeight: 'bold',
    },
    monthlyChange: { fontSize: 14, marginLeft: 8 },
    monthlyChangePositive: { color: colors.success },
    monthlyChangeNegative: { color: colors.error },
    overlayControlsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
    },
    headerRight: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
    
    chunkyButtonSlate: { backgroundColor: colors.neutral700, borderRadius: 8, padding: 12 },
    chunkyButtonBlue: { backgroundColor: colors.primary, borderRadius: 8, padding: 12 },
    chunkyButtonText: { color: colors.white, fontWeight: 'bold' },
    speedPicker: { height: 44, width: responsiveSize(120) },
    speedPickerItem: { height: 44 },
    mainContentGrid: { flex: 1 },
    familyTreeTitle: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    familyTreeTitleEditable: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        zIndex: 10,
        borderBottomWidth: 1,
        borderColor: colors.neutral300,
        color: colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    sceneContainer: {
        flex: 1,
        position: 'relative',
    },
    familyTreeContainer: { flex: 1 },
    noFamilyText: { color: colors.textSecondary, fontStyle: 'italic' },
    bottomNavContainer: {
        backgroundColor: colors.neutral200, // Use light blue-gray
        borderTopWidth: 0, // Remove top border for a cleaner look
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        left: 0,
        paddingVertical: 12, // Increased padding
        position: 'absolute',
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    bottomNavButton: {
        alignItems: 'center',
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 4,
        padding: 4,
    },
    bottomNavButtonActive: {
        backgroundColor: colors.primary, // Use primary color for active background
    },
    bottomNavIcon: {
        width: 50, // Reverted to bigger size
        height: 50,
        marginVertical: 4,
    },
    storyButton: {
        position: 'absolute',
        top: 90, // Placed above settings button
        right: 16,
        backgroundColor: colors.primary, // Use primary color
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        zIndex: 10,
    },
    storyButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    settingsButton: {
        position: 'absolute',
        top: 140,
        right: 16,
        backgroundColor: colors.accent, // Use accent color
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        zIndex: 10,
    },
    settingsButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
});

import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameState, Character, Language } from './core/types';
import { exampleManifest } from './core/types';
import { GAME_SPEED_MS, ASSET_DEFINITIONS, UNLOCKABLE_FEATURES } from './core/constants';
import { GameUI } from './components/GameUI';
import AvatarBuilder from './components/AvatarBuilder';
import { initGodMode } from './core/godmod';
import { createGameLogicHandlers } from './core/game';
import { SceneName } from './components/GameUI';
import { reinitializeAllGameData } from './core/gameData';

type GameView = 'menu' | 'playing' | 'gameover';

const allAvatarUrls = new Set<string>();
exampleManifest.forEach((layer) =>
  layer.options.forEach((o) => {
    allAvatarUrls.add(o.previewSrc || o.src);
  })
);
Object.values(ASSET_DEFINITIONS).forEach((asset) => {
    if (asset.imageSrc) {
        allAvatarUrls.add(asset.imageSrc);
    }
});

allAvatarUrls.add('../public/asset/mila.png');
allAvatarUrls.add('../public/asset/max.png');
allAvatarUrls.add('../public/asset/alice.png');
allAvatarUrls.add('../public/asset/lucas.png');
allAvatarUrls.add('../public/asset/daisy.png');

import { imageAssets } from './components/ImageAssets';

const avatarImages: Record<string, number> = imageAssets;

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_MS);
    const [view, setView] = useState<GameView>('menu');
    const [mainView, setMainView] = useState<'tree' | 'business'>('tree');
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [language, setLanguage] = useState<Language>('en');
    const [customizingCharacterId, setCustomizingCharacterId] = useState<string | null>(null);
    const [activeScene, setActiveScene] = useState<SceneName>('tree');
    
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const {
        saveGame,
        handleContinueGame,
        handleStartNewGame,
        handleStartGame,
        gameLoop,
        handleEventChoice,
        handleCloseEventModal,
        handleSchoolChoice,
        handleClubChoice,
        handleUniversityChoice,
        handleMajorChoice,
        handleAbandonUniversity,
        handleCareerChoice,
        handleUnderqualifiedChoice,
        handleLoanChoice,
        handlePromotionAccept,
        handleAssignToBusiness,
        handleUpgradeBusiness,
        handleBuyBusiness,
        handlePurchaseAsset,
        handleAvatarSave,
        handleAvatarSaveNoCost,
        onSellBusiness,
        handleAcknowledgeUnlock,
        stopGameLoop,
        
    } = useMemo(() => createGameLogicHandlers(setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest), [setGameState, language, timerRef, setView, setIsPaused, setLanguage]);

    useEffect(() => {
        initGodMode(setGameState);
        setIsInitialized(true);

        // Initialize AdMob and show App Open Ad
        const initAndShowAds = async () => {
            // await adService.initializeAds(); // Commented out as adService is not defined
            // adService.showAppOpenAd(); // Commented out as adService is not defined
        };
        initAndShowAds();

    }, [setGameState]);

    useEffect(() => {
        reinitializeAllGameData(language);
    }, [language]);

    // Auto-save interval
    useEffect(() => {
        if (view === 'playing' && !isPaused) {
            const interval = setInterval(() => {
                if (gameState) {
                    saveGame(gameState);
                }
            }, 60000); // 60 seconds
            return () => clearInterval(interval);
        }
    }, [view, isPaused, saveGame, gameState]);
    
    // Save on unload - Removed web-specific window.addEventListener
    
    useEffect(() => {
        const isModalOrSpecialViewActive = 
            !!gameState?.activeEvent ||
            (!!gameState?.pendingSchoolChoice && gameState.pendingSchoolChoice.length > 0) ||
            (!!gameState?.pendingUniversityChoice && gameState.pendingUniversityChoice.length > 0) ||
            !!gameState?.pendingMajorChoice ||
            !!gameState?.pendingCareerChoice ||
            !!gameState?.pendingLoanChoice ||
            !!gameState?.pendingPromotion ||
            !!gameState?.pendingUnderqualifiedChoice ||
            !!gameState?.pendingClubChoice ||
            !!customizingCharacterId ||
            mainView === 'business';

        if (isModalOrSpecialViewActive) {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    }, [gameState?.activeEvent, gameState?.pendingSchoolChoice, gameState?.pendingUniversityChoice, gameState?.pendingMajorChoice, gameState?.pendingCareerChoice, gameState?.pendingLoanChoice, gameState?.pendingPromotion, gameState?.pendingUnderqualifiedChoice, gameState?.pendingClubChoice, customizingCharacterId, mainView]);

    useEffect(() => {
        stopGameLoop();
        if (view === 'playing' && !isPaused && !gameState?.gameOverReason) {
            timerRef.current = setInterval(gameLoop, gameSpeed);
        }
        return () => stopGameLoop();
    }, [isPaused, gameSpeed, view, gameLoop, gameState?.gameOverReason, gameState, stopGameLoop]);
    const handleSetSelectedCharacter = useCallback((character: Character | null) => {
       
        setSelectedCharacter(character);
    }, []);

    // New handler for claiming features
    const handleClaimFeature = useCallback((featureId: string) => {
        setGameState(prevGameState => {
            if (!prevGameState) return prevGameState;

            const featureToClaim = UNLOCKABLE_FEATURES.find(f => f.id === featureId);
            if (!featureToClaim) {
                console.warn(`Attempted to claim unknown feature: ${featureId}`);
                return prevGameState;
            }

            if (prevGameState.claimedFeatures.includes(featureId)) {
                console.warn(`Feature ${featureId} already claimed.`);
                return prevGameState;
            }

            // Add the featureId to claimedFeatures
            return {
                ...prevGameState,
                claimedFeatures: [...prevGameState.claimedFeatures, featureId],
            };
        });
    }, []);

    if (!isInitialized) {
        // Simple loading screen
        return (
            <View style={appStyles.loadingContainer}>
                <Text style={appStyles.loadingText}>Initializing...</Text>
            </View>
        );
    }

    if (customizingCharacterId && gameState) {
        const characterToCustomize = gameState.familyMembers[customizingCharacterId];
        return (
          <AvatarBuilder
            manifest={exampleManifest}
            character={characterToCustomize}
            images={avatarImages}
            onSave={(newState) => handleAvatarSave(customizingCharacterId, newState)}
            onClose={() => setCustomizingCharacterId(null)}
            familyFund={gameState.familyFund}
            onWatchAd={() => {
                // adService.showRewardedAd(() => { // Commented out as adService is not defined
                    handleAvatarSaveNoCost(customizingCharacterId, characterToCustomize.avatarState);
                // });
            }}
          />
        );
    }
        return (
        <GestureHandlerRootView style={appStyles.rootView}>
            <GameUI
                    view={view}
                    mainView={mainView}
                    gameState={gameState}
                    isPaused={isPaused}
                    gameSpeed={gameSpeed}
                    showInstructions={showInstructions}
                    selectedCharacter={selectedCharacter}
                    lang={language}
                    avatarImages={avatarImages}
                    onSetLang={setLanguage}
                    onStartGame={handleStartGame}
                    onShowInstructions={() => setShowInstructions(true)}
                    onCloseInstructions={() => setShowInstructions(false)}
                    onQuitGame={handleStartNewGame}
                    onSetIsPaused={setIsPaused}
                    onSetGameSpeed={(speed) => setGameSpeed(Number(speed))}
                    onSetSelectedCharacter={handleSetSelectedCharacter}
                    onOpenAvatarBuilder={setCustomizingCharacterId}
                    onEventChoice={handleEventChoice}
                    onEventModalClose={handleCloseEventModal}
                    onSchoolChoice={handleSchoolChoice}
                    onClubChoice={handleClubChoice}
                    onUniversityChoice={handleUniversityChoice}
                    onMajorChoice={handleMajorChoice}
                    onAbandonUniversity={handleAbandonUniversity}
                    onCareerChoice={handleCareerChoice}
                    onUnderqualifiedChoice={handleUnderqualifiedChoice}
                    onLoanChoice={handleLoanChoice}
                    onPromotionAccept={handlePromotionAccept}
                    onAssignToBusiness={handleAssignToBusiness}
                    onUpgradeBusiness={handleUpgradeBusiness}
                    onBuyBusiness={handleBuyBusiness}
                    onContinueGame={handleContinueGame}
                    onStartNewGame={handleStartNewGame}
                    onPurchaseAsset={handlePurchaseAsset}
                    onSellBusiness={onSellBusiness}
                    onSetMainView={setMainView}
                    onSetFamilyName={function (): void {
                        throw new Error('Function not implemented.');
                    } }
                    activeScene={activeScene}
                    onSetActiveScene={setActiveScene}
                    onAcknowledgeUnlock={() => {}}
                    onClearNewlyUnlockedFeature={handleAcknowledgeUnlock}
                    onClaimFeature={handleClaimFeature} // Pass the new handler
            />
        </GestureHandlerRootView>
    );
};

export { App };

const appStyles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        flex: 1,
        justifyContent: 'center', // slate-50
    },
    loadingText: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
    },
    rootView: {
        flex: 1,
    },
});
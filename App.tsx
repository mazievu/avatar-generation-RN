import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameState, Character, Language } from './core/types';
import { exampleManifest } from './core/types';
import { GAME_SPEED_MS, ASSET_DEFINITIONS } from './core/constants';
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

const avatarImages: Record<string, any> = imageAssets;

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
    const [showStoryChoiceModal, setShowStoryChoiceModal] = useState(false);
    
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
        stopGameLoop,
        SAVE_KEY,
    } = useMemo(() => createGameLogicHandlers(setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest), [setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest]);

    useEffect(() => {
        initGodMode(setGameState);
        setIsInitialized(true);
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
    }, [isPaused, gameSpeed, view, gameLoop, gameState?.gameOverReason, gameState]);
    const handleSetSelectedCharacter = useCallback((character: Character | null) => {
       
        setSelectedCharacter(character);
    }, []);

    if (!isInitialized) {
        // Simple loading screen
        return (
            <View style={appStyles.loadingContainer}>
                <Text style={appStyles.loadingText}>Initializing...</Text>
            </View>
        ); // Or a proper loading screen
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
          />
        );
    }
        return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                    onSetMainView={setMainView}
                    onSetFamilyName={function (name: string): void {
                        throw new Error('Function not implemented.');
                    } }
                    activeScene={activeScene}
                    onSetActiveScene={setActiveScene}
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
});
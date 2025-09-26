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

import { adService } from './services/adService';

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

allAvatarUrls.add('../assets/mila.png');
allAvatarUrls.add('../assets/max.png');
allAvatarUrls.add('../assets/alice.png');
allAvatarUrls.add('../assets/lucas.png');
allAvatarUrls.add('../assets/daisy.png');

import { imageAssets } from './components/ImageAssets';

const avatarImages: Record<string, number> = imageAssets;

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_MS);
    const [view, setView] = useState<GameView>('menu');
    // BƯỚC 1: Xóa state 'mainView'
    // const [mainView, setMainView] = useState<'tree' | 'business'>('tree');
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [language, setLanguage] = useState<Language>('en');
    const [customizingCharacterId, setCustomizingCharacterId] = useState<string | null>(null);
    const [activeScene, setActiveScene] = useState<SceneName>('tree');
    const [pendingStatBoost, setPendingStatBoost] = useState<{ stat: keyof Character['stats'], amount: number, featureId: string } | null>(null);
    
    
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
        handleAcknowledgeUnlock: handleClearNewlyUnlockedFeature,
        stopGameLoop,
        
    } = useMemo(() => createGameLogicHandlers(setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest), [setGameState, language, timerRef, setView, setIsPaused, setLanguage]);

    useEffect(() => {
        initGodMode(setGameState);
        setIsInitialized(true);

        const initAndShowAds = async () => {
            await adService.initializeAds();
            adService.showAppOpenAd();
        };
        initAndShowAds();

    }, [setGameState]);

    useEffect(() => {
        reinitializeAllGameData(language);
    }, [language]);

    useEffect(() => {
        if (view === 'playing' && !isPaused) {
            const interval = setInterval(() => {
                if (gameState) {
                    saveGame(gameState);
                }
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [view, isPaused, saveGame, gameState]);

    const handleAcknowledgeUnlock = useCallback(() => {
        setGameState(prevState => {
            if (!prevState || !prevState.newlyUnlockedFeature) return prevState;

            const featureId = prevState.newlyUnlockedFeature;
            if (prevState.claimedFeatures.includes(featureId)) {
                return { ...prevState, newlyUnlockedFeature: null };
            }

            return {
                ...prevState,
                claimedFeatures: [...prevState.claimedFeatures, featureId],
                newlyUnlockedFeature: null,
            };
        });
    }, []);
    
    useEffect(() => {
        // BƯỚC 2: Cập nhật logic tạm dừng game
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
            activeScene !== 'tree' || // Thay thế 'mainView' bằng 'activeScene'
            !!pendingStatBoost;

        if (isModalOrSpecialViewActive) {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    }, [gameState?.activeEvent, gameState?.pendingSchoolChoice, gameState?.pendingUniversityChoice, gameState?.pendingMajorChoice, gameState?.pendingCareerChoice, gameState?.pendingLoanChoice, gameState?.pendingPromotion, gameState?.pendingUnderqualifiedChoice, gameState?.pendingClubChoice, customizingCharacterId, activeScene, pendingStatBoost]); // Xóa 'mainView' khỏi dependencies

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

    const handleConfirmStatBoost = useCallback((characterId: string) => {
        setGameState(prevGameState => {
            if (!prevGameState || !pendingStatBoost) return prevGameState;

            const nextGameState = { ...prevGameState };
            const characterToBuff = nextGameState.familyMembers[characterId];

            if (characterToBuff) {
                const { stat, amount, featureId } = pendingStatBoost;
                const currentStatValue = characterToBuff.stats[stat];
                const maxStatValue = stat === 'iq' ? 200 : 100;
                characterToBuff.stats[stat] = Math.min(maxStatValue, currentStatValue + amount);
                nextGameState.claimedFeatures = [...nextGameState.claimedFeatures, featureId];
            }

            return nextGameState;
        });
        setPendingStatBoost(null);
    }, [pendingStatBoost]);

    const handleClaimFeature = useCallback((featureId: string) => {
        setGameState(prevGameState => {
            if (!prevGameState) return prevGameState;

            const featureToClaim = UNLOCKABLE_FEATURES.find(f => f.id === featureId);
            if (!featureToClaim || prevGameState.claimedFeatures.includes(featureId)) {
                return prevGameState;
            }

            const nextGameState = { ...prevGameState };

            if (featureToClaim.type === 'mystery_box') {
                const randomFund = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
                nextGameState.familyFund += randomFund;

                const stats: (keyof Character['stats'])[] = ['happiness', 'health', 'iq', 'eq', 'skill'];
                const randomStat = stats[Math.floor(Math.random() * stats.length)];
                const statIncrease = Math.floor(Math.random() * 6);

                setPendingStatBoost({ stat: randomStat, amount: statIncrease, featureId: featureToClaim.id });
                return nextGameState;
            }
            
            nextGameState.claimedFeatures = [...nextGameState.claimedFeatures, featureId];
            return nextGameState;
        });
    }, []);

    if (!isInitialized) {
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
                adService.showRewardedAd(() => {
                    handleAvatarSaveNoCost(customizingCharacterId, characterToCustomize.avatarState);
                });
            }}
          />
        );
    }
        return (
        <GestureHandlerRootView style={appStyles.rootView}>
            {/* BƯỚC 3: Xóa các props không cần thiết */}
            <GameUI
                    view={view}
                    // mainView={mainView} // Đã xóa
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
                    // onSetMainView={setMainView} // Đã xóa
                    onSetFamilyName={function (): void {
                        throw new Error('Function not implemented.');
                    } }
                    activeScene={activeScene}
                    onSetActiveScene={setActiveScene}
                    onAcknowledgeUnlock={handleAcknowledgeUnlock}
                    onClearNewlyUnlockedFeature={handleClearNewlyUnlockedFeature}
                    onClaimFeature={handleClaimFeature}
                    pendingStatBoost={pendingStatBoost}
                    onConfirmStatBoost={handleConfirmStatBoost}
                    onCloseStatBoostModal={() => setPendingStatBoost(null)}
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
        justifyContent: 'center',
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
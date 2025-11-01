import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, AppState, AppStateStatus, Image, ImageSourcePropType } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createGameLogicHandlers } from './core/game';
import { GameState, Character, Language, Manifest } from './core/types';
import { GAME_SPEED_MS, ASSET_DEFINITIONS, UNLOCKABLE_FEATURES } from './core/constants';
import { GameUI } from './components/GameUI';
import { loadAvatarAssets } from './components/ImageAssets';
import { exampleManifest } from './core/types';
import { soundManager } from './services';
import { SceneName } from './components/GameUI';
import { reinitializeAllGameData } from './core/gameData';
import LoadingScreen from './components/LoadingScreen';
import { startBackgroundBaking } from './services/BackgroundBaker';

export default function App() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [view, setView] = useState<'menu' | 'playing' | 'gameover' | 'welcome_back' | 'loading'>('menu');
    const [isPaused, setIsPaused] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [lang, setLang] = useState<Language>('en');
    const [avatarImages, setAvatarImages] = useState<Record<string, ImageSourcePropType>>({});
    const [activeScene, setActiveScene] = useState<SceneName>('tree');
    const [pendingStatBoost, setPendingStatBoost] = useState<{ stat: keyof Character['stats'], amount: number, featureId: string } | null>(null);
    const [charactersToBake, setCharactersToBake] = useState<Character[] | null>(null);

    const appState = useRef(AppState.currentState);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wasPlayingRef = useRef(false);

    useEffect(() => {
        reinitializeAllGameData(lang);
    }, [lang]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (view === 'playing') {
                    setView('welcome_back');
                    setIsPaused(true);
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [view]);

    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_MS);

    const gameLogic = useMemo(() => 
        createGameLogicHandlers(setGameState, lang, timerRef, setView, setIsPaused, setLang, exampleManifest),
        [lang]
    );

    const { gameLoop, stopGameLoop } = gameLogic;

    useEffect(() => {
        const loadAssets = async () => {
            const loadedImages = await loadAvatarAssets(exampleManifest);
            setAvatarImages(loadedImages);
        };
        loadAssets();
    }, []);

    useEffect(() => {
        if (view === 'playing' && !wasPlayingRef.current && gameState) {
            wasPlayingRef.current = true;
            setIsPaused(true);
            setView('loading');
            setCharactersToBake(Object.values(gameState.familyMembers));
        } else if (view === 'menu' || view === 'gameover') {
            wasPlayingRef.current = false;
        }
    }, [view, gameState]);

    useEffect(() => {
        if (view === 'playing' && !isPaused && !gameState?.gameOverReason) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(gameLoop, gameSpeed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, gameSpeed, view, gameLoop, gameState?.gameOverReason, gameState, stopGameLoop]);

    useEffect(() => {
        if (gameState) {
            gameLogic.saveGame(gameState);
        }
    }, [gameState, gameLogic]);

    const handleSetLang = (l: Language) => {
        setLang(l);
    };

    const handleStartGame = (mode: string) => {
        gameLogic.handleStartGame(mode);
        setActiveScene('tree');
    };

    const handleContinueGame = () => {
        gameLogic.handleContinueGame();
    };

    const handleStartNewGame = () => {
        gameLogic.handleStartNewGame();
        setView('menu');
    };

    const handleQuitGame = () => {
        setView('menu');
        setGameState(null);
        setIsPaused(true);
    };

    const handleSetFamilyName = (name: string) => {
        if (gameState) {
            setGameState({ ...gameState, familyName: name });
        }
    };

    const handleAcknowledgeUnlock = () => {
        if (gameState?.newlyUnlockedFeature) {
            const feature = UNLOCKABLE_FEATURES.find(f => f.id === gameState.newlyUnlockedFeature);
            if (feature && feature.type === 'mystery_box') {
                const stats: (keyof Character['stats'])[] = ['iq', 'eq', 'happiness', 'health'];
                const randomStat = stats[Math.floor(Math.random() * stats.length)];
                const amount = 5 + Math.floor(Math.random() * 6); // 5-10
                setPendingStatBoost({ stat: randomStat, amount, featureId: feature.id });
            } else if (feature) {
                gameLogic.handleClaimFeature(feature.id);
            }
        }
        gameLogic.handleAcknowledgeUnlock();
    };

    const handleConfirmStatBoost = (characterId: string) => {
        if (pendingStatBoost && gameState) {
            const char = gameState.familyMembers[characterId];
            if (char) {
                const newStats = { ...char.stats };
                newStats[pendingStatBoost.stat] = Math.min(100, newStats[pendingStatBoost.stat] + pendingStatBoost.amount);
                setGameState({
                    ...gameState,
                    familyMembers: {
                        ...gameState.familyMembers,
                        [characterId]: { ...char, stats: newStats },
                    },
                });
                gameLogic.handleClaimFeature(pendingStatBoost.featureId);
            }
        }
        setPendingStatBoost(null);
    };

    if (view === 'loading' && charactersToBake) {
        return (
            <LoadingScreen
                manifest={exampleManifest}
                characters={charactersToBake}
                images={avatarImages}
                onReady={() => {
                    setCharactersToBake(null);
                    setView('playing');
                    setIsPaused(false);
                    startBackgroundBaking();
                }}
            />
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar style="auto" />
                <GameUI
                    view={view}
                    gameState={gameState}
                    isPaused={isPaused}
                    gameSpeed={gameSpeed}
                    showInstructions={showInstructions}
                    selectedCharacter={selectedCharacter}
                    lang={lang}
                    avatarImages={avatarImages}
                    onSetLang={handleSetLang}
                    onStartGame={handleStartGame}
                    onShowInstructions={() => setShowInstructions(true)}
                    onCloseInstructions={() => setShowInstructions(false)}
                    onQuitGame={handleQuitGame}
                    onSetIsPaused={setIsPaused}
                    onSetGameSpeed={(speed) => setGameSpeed(Number(speed))}
                    onSetSelectedCharacter={setSelectedCharacter}
                    onOpenAvatarBuilder={() => { /* TODO */ }}
                    onEventChoice={gameLogic.handleEventChoice}
                    onEventModalClose={gameLogic.handleCloseEventModal}
                    onSchoolChoice={gameLogic.handleSchoolChoice}
                    onClubChoice={gameLogic.handleClubChoice}
                    onUniversityChoice={gameLogic.handleUniversityChoice}
                    onMajorChoice={gameLogic.handleMajorChoice}
                    onAbandonUniversity={gameLogic.handleAbandonUniversity}
                    onCareerChoice={gameLogic.handleCareerChoice}
                    onUnderqualifiedChoice={gameLogic.handleUnderqualifiedChoice}
                    onLoanChoice={gameLogic.handleLoanChoice}
                    onPromotionAccept={gameLogic.handlePromotionAccept}
                    onAssignToBusiness={gameLogic.handleAssignToBusiness}
                    onUpgradeBusiness={gameLogic.handleUpgradeBusiness}
                    onBuyBusiness={gameLogic.handleBuyBusiness}
                    onContinueGame={handleContinueGame}
                    onStartNewGame={handleStartNewGame}
                    onPurchaseAsset={gameLogic.handlePurchaseAsset}
                    onSellBusiness={gameLogic.onSellBusiness}
                    onSetFamilyName={handleSetFamilyName}
                    activeScene={activeScene}
                    onSetActiveScene={setActiveScene}
                    onAcknowledgeUnlock={handleAcknowledgeUnlock}
                    onClearNewlyUnlockedFeature={gameLogic.handleAcknowledgeUnlock} // Same as acknowledge
                    onClaimFeature={gameLogic.handleClaimFeature}
                    pendingStatBoost={pendingStatBoost}
                    onConfirmStatBoost={handleConfirmStatBoost}
                    onCloseStatBoostModal={() => setPendingStatBoost(null)}
                    onPurchaseSuccess={gameLogic.handlePurchaseSuccess}
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

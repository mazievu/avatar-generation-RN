import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, AppState, ImageSourcePropType } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGameLogicHandlers } from './core/game';
import type { GameState, Character, Language, Manifest } from './core/types';
import { ASSET_DEFINITIONS, UNLOCKABLE_FEATURES } from './core/constants';
import { GameUI } from './components/GameUI';
import { loadAvatarAssets } from './components/ImageAssets';
import { exampleManifest } from './core/types';
import { soundManager } from './services';
import type { SceneName } from './components/GameUI';
import { reinitializeAllGameData } from './core/gameData';
import LoadingScreen from './components/LoadingScreen';
import { startBackgroundBaking } from './services/BackgroundBaker';

const SAVE_KEY = 'generations_savegame';

// Custom hook để buộc một component phải render lại
const useForceUpdate = () => {
    const [, setTick] = useState(0);
    return useCallback(() => {
        setTick(tick => tick + 1);
    }, []);
};

export default function App() {
    const gameStateRef = useRef<GameState | null>(null);
    const [view, setView] = useState<'menu' | 'playing' | 'gameover' | 'loading'>('menu');
    const [hasSavedGame, setHasSavedGame] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [lang, setLang] = useState<Language>('en');
    const [avatarImages, setAvatarImages] = useState<Record<string, ImageSourcePropType>>({});
    const [activeScene, setActiveScene] = useState<SceneName>('tree');
    const [pendingStatBoost, setPendingStatBoost] = useState<{ stat: keyof Character['stats'], amount: number, featureId: string } | null>(null);
    const [charactersToBake, setCharactersToBake] = useState<Character[] | null>(null);
    const [gameSpeed, setGameSpeed] = useState<number>(1); // 1x, 2x, 4x

    const appState = useRef(AppState.currentState);
    const gameLoopRef = useRef<number | null>(null);
    const wasPlayingRef = useRef(false);
    const forceUpdate = useForceUpdate();

    // Các hàm bao bọc để tương tác với game state ref
    const getGameState = useCallback(() => gameStateRef.current, []);
    
    const setGameState = useCallback((updater: GameState | null | ((prevState: GameState | null) => GameState | null)) => {
        let newState: GameState | null;
        if (typeof updater === 'function') {
            const currentState = gameStateRef.current;
            newState = updater(currentState);
        } else {
            newState = updater;
        }
        gameStateRef.current = newState;
        forceUpdate(); // Kích hoạt render lại một cách thủ công
    }, [forceUpdate]);

    useEffect(() => {
        const checkSavedGame = async () => {
            try {
                const savedGame = await AsyncStorage.getItem(SAVE_KEY);
                setHasSavedGame(savedGame !== null);
            } catch (e) {
                console.error("Failed to check for saved game.", e);
                setHasSavedGame(false);
            }
        };
        checkSavedGame();
    }, []);

    useEffect(() => {
        reinitializeAllGameData(lang);
    }, [lang]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (view === 'playing') {
                    setView('menu');
                    setIsPaused(true);
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [view]);

    const gameLogic = useMemo(() =>
        createGameLogicHandlers(
            getGameState,
            setGameState,
            lang,
            setView,
            setIsPaused,
            setLang,
            exampleManifest
        ),
        [lang, getGameState, setGameState]
    );

    useEffect(() => {
        const loadAssets = async () => {
            const loadedImages = await loadAvatarAssets(exampleManifest);
            setAvatarImages(loadedImages);
        };
        loadAssets();
    }, []);

    useEffect(() => {
        if (view === 'playing' && !wasPlayingRef.current && gameStateRef.current) {
            wasPlayingRef.current = true;
            setIsPaused(true);
            setView('loading');
            setCharactersToBake(Object.values(gameStateRef.current.familyMembers));
        } else if (view === 'menu' || view === 'gameover') {
            wasPlayingRef.current = false;
        }
    }, [view]);

    // Vòng lặp game mới
    useEffect(() => {
        let lastTickTime = performance.now();

        const runGameLoop = () => {
            if (!isPaused && view === 'playing') {
                const now = performance.now();
                const delta = now - lastTickTime;
                
                const daysPerSecond = 60;
                const msPerDay = 1000 / daysPerSecond;
                const timeStep = msPerDay / gameSpeed;

                if (delta >= timeStep) {
                    gameLogic.gameTick(); // Thay đổi trực tiếp ref
                    lastTickTime = now - (delta % timeStep);
                }
            }
            gameLoopRef.current = requestAnimationFrame(runGameLoop);
        };

        // Vòng lặp cập nhật UI
        const uiUpdateInterval = setInterval(() => {
            if (!isPaused && view === 'playing') {
                forceUpdate();
            }
        }, 1000); // Cập nhật UI mỗi giây

        gameLoopRef.current = requestAnimationFrame(runGameLoop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
            clearInterval(uiUpdateInterval);
        };
    }, [isPaused, gameSpeed, view, gameLogic, forceUpdate]);


    useEffect(() => {
        const save = () => {
            if (gameStateRef.current) {
                gameLogic.saveGame(gameStateRef.current);
                setHasSavedGame(true);
            }
        };
        // Debounce saving
        const saveTimer = setTimeout(save, 500);
        return () => clearTimeout(saveTimer);
    }, [gameStateRef.current, forceUpdate]); // forceUpdate đảm bảo effect này chạy khi state thay đổi

    const handleSetLang = (l: Language) => {
        setLang(l);
    };

    const handleStartGame = (mode: string) => {
        gameLogic.handleStartGame(mode);
        setActiveScene('tree');
    };

    const handleContinueGame = () => {
        gameLogic.handleContinueGame();
        setHasSavedGame(true);
    };

    const handleStartNewGame = () => {
        gameLogic.handleStartNewGame();
        setView('menu');
        setHasSavedGame(false);
    };

    const handleQuitGame = () => {
        setView('menu');
        setGameState(null);
        setIsPaused(true);
    };

    const handleSetFamilyName = (name: string) => {
        const currentState = gameStateRef.current;
        if (currentState) {
            gameStateRef.current = { ...currentState, familyName: name };
            forceUpdate();
        }
    };

    const handleAcknowledgeUnlock = () => {
        const currentState = gameStateRef.current;
        if (currentState?.newlyUnlockedFeature) {
            const feature = UNLOCKABLE_FEATURES.find(f => f.id === currentState.newlyUnlockedFeature);
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
        if (pendingStatBoost && gameStateRef.current) {
            const char = gameStateRef.current.familyMembers[characterId];
            if (char) {
                const newStats = { ...char.stats };
                newStats[pendingStatBoost.stat] = Math.min(100, newStats[pendingStatBoost.stat] + pendingStatBoost.amount);
                
                const newFamilyMembers = {
                    ...gameStateRef.current.familyMembers,
                    [characterId]: { ...char, stats: newStats },
                };

                gameStateRef.current = {
                    ...gameStateRef.current,
                    familyMembers: newFamilyMembers,
                };
                
                gameLogic.handleClaimFeature(pendingStatBoost.featureId);
                forceUpdate();
            }
        }
        setPendingStatBoost(null);
    };
    
    const handleSetGameSpeed = (speed: number) => {
        setGameSpeed(speed);
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
                    gameState={gameStateRef.current}
                    isPaused={isPaused}
                    gameSpeed={gameSpeed}
                    showInstructions={showInstructions}
                    selectedCharacter={selectedCharacter}
                    lang={lang}
                    avatarImages={avatarImages}
                    hasSavedGame={hasSavedGame}
                    onSetLang={handleSetLang}
                    onStartGame={handleStartGame}
                    onShowInstructions={() => setShowInstructions(true)}
                    onCloseInstructions={() => setShowInstructions(false)}
                    onQuitGame={handleQuitGame}
                    onSetIsPaused={setIsPaused}
                    onSetGameSpeed={handleSetGameSpeed}
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
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, CareerChoice, PurchasedAsset, Business, Pet, GameEvent, Loan, AvatarState, Stats, GameLogEntry, Club } from './core/types';
import { LifePhase, CharacterStatus, RelationshipStatus, Gender } from './core/types';
// FIX: Changed import from COST_OF_LIVING to getCostOfLiving to match the exported member from constants.
import { GAME_SPEED_MS, DAYS_IN_YEAR, EVENTS, SCHOOL_OPTIONS, UNIVERSITY_MAJORS, CAREER_LADDER, VOCATIONAL_TRAINING, INTERNSHIP, MOURNING_PERIOD_YEARS, PENSION_AMOUNT, getCostOfLiving, BUSINESS_DEFINITIONS, ROBOT_HIRE_COST, PET_DATA, BUSINESS_WORKER_BASE_SALARY_MONTHLY, BUSINESS_WORKER_SKILL_MULTIPLIER, ASSET_DEFINITIONS, TRAINEE_SALARY } from './core/constants';
import { CLUBS } from './core/clubsAndEventsData';
import { GameUI } from './components/GameUI';
import AvatarBuilder, { exampleManifest, usePreloadedImages } from './components/AvatarBuilder';
import { SCENARIOS } from './core/scenarios';
import { getLifePhase, addDays, isBefore, getCharacterDisplayName, calculateNewAdjectiveKey, generateRandomAvatar } from './core/utils';
import { Language, t } from './core/localization';
import { initGodMode } from './core/godmod';
import { createGameLogicHandlers } from './core/game';

type GameView = 'menu' | 'playing' | 'gameover' | 'welcome_back';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_MS);
    const [view, setView] = useState<GameView>('menu');
    const [mainView, setMainView] = useState<'tree' | 'business'>('tree');
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [language, setLanguage] = useState<Language>('vi');
    const [customizingCharacterId, setCustomizingCharacterId] = useState<string | null>(null);
    
    const timerRef = useRef<number | null>(null);

    const {
        saveGame,
        initializeGame,
        handleContinueGame,
        handleStartNewGame,
        handleStartGame,
        generateCareerChoices,
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
        ONE_TIME_EVENT_IDS,
    } = useMemo(() => createGameLogicHandlers(setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest), [setGameState, language, timerRef, setView, setIsPaused, setLanguage, exampleManifest]);

    useEffect(() => {
        initGodMode(setGameState);
    }, [setGameState]);
    
    const allAvatarUrls = useMemo(() => {
        const s = new Set<string>();
        exampleManifest.forEach((layer) =>
          layer.options.forEach((o) => {
            s.add(o.previewSrc || o.src);
          })
        );
        s.add('/asset/avatar-face/face/old.png');
        s.add('/asset/mila.png');
        s.add('/asset/max.png');
        s.add('/asset/alice.png');
        s.add('/asset/lucas.png');
        s.add('/asset/daisy.png');
        s.add('/asset/avatar-face/face/baby.png');
        s.add('/asset/avatar-face/face/normal.png');
        return Array.from(s);
    }, []);
    const { loaded: avatarImages } = usePreloadedImages(allAvatarUrls);

    

    // Initial load check
    useEffect(() => {
        try {
            const savedGame = localStorage.getItem(SAVE_KEY);
            if (savedGame) {
                const savedState = JSON.parse(savedGame);
                if (savedState.lang) {
                    setLanguage(savedState.lang);
                }
                setView('welcome_back');
            } else {
                setView('menu');
            }
        } catch (error) {
            console.error("Failed to check for saved game:", error);
            setView('menu');
        }
        setIsInitialized(true);
    }, []);
     // Auto-save interval
    useEffect(() => {
        if (view === 'playing' && !isPaused) {
            const interval = setInterval(() => {
                saveGame(gameState);
            }, 60000); // 60 seconds
            return () => clearInterval(interval);
        }
    }, [view, isPaused, saveGame, gameState]);
    
    // Save on unload
    useEffect(() => {
        window.addEventListener('beforeunload', () => saveGame(gameState));
        return () => {
            window.removeEventListener('beforeunload', () => saveGame(gameState));
        };
    }, [saveGame, gameState]);
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
        }
    }, [gameState?.activeEvent, gameState?.pendingSchoolChoice, gameState?.pendingUniversityChoice, gameState?.pendingMajorChoice, gameState?.pendingCareerChoice, gameState?.pendingLoanChoice, gameState?.pendingPromotion, gameState?.pendingUnderqualifiedChoice, gameState?.pendingClubChoice, customizingCharacterId, mainView]);

    useEffect(() => {
        stopGameLoop();
        if (view === 'playing' && !isPaused && !gameState?.gameOverReason) {
            timerRef.current = window.setInterval(() => gameLoop(), gameSpeed);
        }
        return () => stopGameLoop();
    }, [isPaused, gameSpeed, view, gameLoop, gameState?.gameOverReason, gameState]);
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen">Initializing...</div>; // Or a proper loading screen
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
            onSetSelectedCharacter={setSelectedCharacter}
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
        />
    );
};

export { App };

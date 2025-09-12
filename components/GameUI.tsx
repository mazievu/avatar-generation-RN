import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ImageSourcePropType, Dimensions } from 'react-native';


import type { GameState, Character, EventChoice, SchoolOption, UniversityMajor, Manifest, Business, Club, Language } from '../core/types';
import { formatDate, getCharacterDisplayName } from '../core/utils';
import { ASSET_DEFINITIONS } from '../core/constants';
import { FamilyTree } from './FamilyTree';
import { GameLog } from './GameLog';
import { SummaryScreen } from './SummaryScreen';
import { StartMenu } from './StartMenu';
import { InstructionsModal } from './InstructionsModal';    
import { WelcomeBackMenu } from './WelcomeBackMenu';
import { t } from '../core/localization';
import { exampleManifest } from '../core/types';
import { BusinessMap } from './BusinessMap';
import { FamilyAssetsPanel } from './FamilyAssetsPanel';
import { Picker } from '@react-native-picker/picker';
import { ModalManager } from './ModalManager';

const { width: screenWidth } = Dimensions.get('window');
import { CLUBS } from '../core/clubsAndEventsData';
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

type SceneName = 'tree' | 'log' | 'assets' | 'business';

const BottomNav: React.FC<{
  activeScene: SceneName;
  onSceneChange: (scene: SceneName) => void;
  lang: Language;
}> = ({ activeScene, onSceneChange, lang }) => {
  return (
    <View style={gameUIStyles.bottomNavContainer}>
      <TouchableOpacity onPress={() => onSceneChange('tree')} style={[gameUIStyles.bottomNavButton, activeScene === 'tree' && gameUIStyles.bottomNavButtonActive]}>
        <Text>{t('scene_tree', lang)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('log')} style={[gameUIStyles.bottomNavButton, activeScene === 'log' && gameUIStyles.bottomNavButtonActive]}>
        <Text>{t('scene_log', lang)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('assets')} style={[gameUIStyles.bottomNavButton, activeScene === 'assets' && gameUIStyles.bottomNavButtonActive]}>
        <Text>{t('scene_assets', lang)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSceneChange('business')} style={[gameUIStyles.bottomNavButton, activeScene === 'business' && gameUIStyles.bottomNavButtonActive]}>
        <Text>{t('scene_business', lang)}</Text>
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
    const [activeScene, setActiveScene] = useState<SceneName>('tree');
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    
    useEffect(() => {
        if (editingBusiness && gameState?.familyBusinesses) {
            const updatedBusiness = gameState.familyBusinesses[editingBusiness.id];
            if (updatedBusiness && JSON.stringify(updatedBusiness.slots) !== JSON.stringify(editingBusiness.slots)) {
                setEditingBusiness(updatedBusiness);
            }
        }
    }, [gameState?.familyBusinesses, editingBusiness]);

    const handleSceneChange = (scene: SceneName) => {
        setActiveScene(scene);
    };
    
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

    const renderScene = () => {
        switch (activeScene) {
            case 'tree':
                return (
                    <>
                        <Text style={gameUIStyles.familyTreeTitle}>{t('family_tree_title', lang)}</Text>
                        <View style={gameUIStyles.familyTreeContainer}>
                            <FamilyTree gameState={gameState} onSelectCharacter={onSetSelectedCharacter} lang={lang} images={avatarImages} manifest={exampleManifest} selectedCharacter={selectedCharacter} />
                        </View>
                    </>
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
                                setActiveScene('tree');
                            }}
                        />;
            default:
                return null;
        }
    }

    return (
        <View style={gameUIStyles.mainContainer}>
            {view === 'gameover' && gameState.gameOverReason && <SummaryScreen gameState={gameState} onRestart={onStartNewGame} lang={lang}/>}
            
            <ModalManager
                gameState={gameState}
                selectedCharacter={selectedCharacter}
                editingBusiness={editingBusiness}
                avatarImages={avatarImages}
                onEventChoice={onEventChoice}
                onEventModalClose={onEventModalClose}
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
            />
            
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
                            <TouchableOpacity onPress={() => onSetLang('en')} style={[gameUIStyles.languageButton, lang === 'en' && gameUIStyles.languageButtonActive]}>
                                <Text style={[gameUIStyles.languageButtonText, lang === 'en' ? gameUIStyles.languageButtonTextActive : gameUIStyles.languageButtonTextInactive]}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onSetLang('vi')} style={[gameUIStyles.languageButton, lang === 'vi' && gameUIStyles.languageButtonActive]}>
                                <Text style={[gameUIStyles.languageButtonText, lang === 'vi' ? gameUIStyles.languageButtonTextActive : gameUIStyles.languageButtonTextInactive]}>VI</Text>
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
    mainContainer: { backgroundColor: '#f0f4f8', flex: 1 },
    maxWidthContainer: { flex: 1, padding: 16, paddingBottom: 60 }, // Added paddingBottom to avoid overlap with bottom nav
    headerContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { },
    gameTitle: { color: '#ec4899', fontSize: 32, fontWeight: 'bold' },
    dateText: { color: '#64748b', fontSize: 16 },
    fundContainer: { },
    fundTextContainer: { alignItems: 'baseline', flexDirection: 'row' },
    fundLabel: { color: '#64748b', fontSize: 16 },
    fundValue: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
    fundPositive: { color: '#1f2937' },
    fundNegative: { color: '#ef4444' },
    monthlyChange: { fontSize: 14, marginLeft: 8 },
    monthlyChangePositive: { color: '#22c55e' },
    monthlyChangeNegative: { color: '#ef4444' },
    headerRight: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
    languageButtonsContainer: { backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', padding: 4 },
    languageButton: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
    languageButtonActive: { backgroundColor: '#6366f1' }, // indigo-500
    languageButtonText: { fontWeight: 'bold' },
    languageButtonTextActive: { color: 'white' },
    languageButtonTextInactive: { color: '#475569' }, // slate-600
    chunkyButtonSlate: { backgroundColor: '#64748b', borderRadius: 8, padding: 12 },
    chunkyButtonBlue: { backgroundColor: '#3b82f6', borderRadius: 8, padding: 12 },
    chunkyButtonText: { color: 'white', fontWeight: 'bold' },
    speedPicker: { height: 44, width: 150 },
    speedPickerItem: { height: 44 },
    mainContentGrid: { flex: 1 },
    familyTreeTitle: { color: '#6366f1', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    familyTreeContainer: { flex: 1 },
    noFamilyText: { color: '#64748b', fontStyle: 'italic' },
    bottomNavContainer: {
        backgroundColor: '#f0f4f8',
        borderColor: '#ccc',
        borderTopWidth: 1,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        left: 0,
        paddingVertical: 8,
        position: 'absolute',
        right: 0,
    },
    bottomNavButton: {
        alignItems: 'center',
        padding: 8,
    },
    bottomNavButtonActive: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
});

// e:\game\avatar-generation-RN\screens\PathOfLifeScreen.tsx

import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Animated,
    Pressable,
    ImageBackground,
    Dimensions,
} from 'react-native';
import type { GameState, Language } from '../core/types';
import { PATH_NODES, UNLOCKABLE_FEATURES } from '../core/constants';
import { t } from '../core/localization';

// --- Asset Imports ---
const bgImage = require('../assets/path_of_life_bg.webp');
const pathTrackImage = require('../assets/path_background.png');
const gemImage = require('../assets/gem.webp');
const wingedHeartImage = require('../assets/winged_heart.webp');
const chestImage = require('../assets/chest.webp');
const bubbleImage = require('../assets/bubble.webp');
const lockImage = require('../assets/lock.webp');
const claimButtonImage = require('../assets/claim_button.webp');
const glowEffectImage = require('../assets/glow_effect.webp');

// --- Interfaces ---
interface PathOfLifeScreenProps {
    gameState: GameState;
    lang: Language;
    onClaimFeature: (featureId: string) => void;
}

// --- Constants ---
const NODE_SPACING = 100; // Vertical space between each level
const TOP_OFFSET = 100; // Space at the top
const BOTTOM_OFFSET = 100; // Space at the bottom
const MAX_LEVEL = Math.max(...PATH_NODES.map(node => node.level));
const CONTENT_HEIGHT = MAX_LEVEL * NODE_SPACING + TOP_OFFSET + BOTTOM_OFFSET;

const { width: screenWidth } = Dimensions.get('window');

// --- Helper Components ---

const MilestoneMarker: React.FC<{ level: number, specialAsset?: 'winged_heart' | 'gem' }> = ({ level, specialAsset }) => {
    const image = specialAsset === 'winged_heart' ? wingedHeartImage : gemImage;
    return (
        <View style={[styles.node, styles.milestone, { top: CONTENT_HEIGHT - (level * NODE_SPACING) - BOTTOM_OFFSET }]}>
            <Image source={image} style={styles.milestoneIcon} />
        </View>
    );
};

const RewardNode: React.FC<{
    node: Extract<typeof PATH_NODES[number], { type: 'reward' }>,
    isUnlocked: boolean,
    isClaimed: boolean,
    onClaim: (featureId: string) => void,
    lang: Language
}> = ({ node, isUnlocked, isClaimed, onClaim, lang }) => {
    const feature = UNLOCKABLE_FEATURES.find(f => f.id === node.featureId);
    if (!feature) return null;

    const canClaim = isUnlocked && !isClaimed;

    return (
        <View style={[
            styles.node,
            styles.reward,
            { top: CONTENT_HEIGHT - (node.level * NODE_SPACING) - BOTTOM_OFFSET },
            node.alignment === 'left' ? styles.rewardLeft : styles.rewardRight
        ]}>
            <ImageBackground source={bubbleImage} style={styles.rewardBubble} resizeMode="contain">
                <Text style={styles.rewardTitle}>{t(feature.nameKey, lang)}</Text>
                <Text style={styles.rewardDesc}>{t(feature.descriptionKey, lang)}</Text>
            </ImageBackground>

            <View style={styles.rewardChestContainer}>
                <Image source={chestImage} style={styles.rewardChest} />
                {!isUnlocked && <Image source={lockImage} style={styles.lockIcon} />}
                {canClaim && <Image source={glowEffectImage} style={styles.glowEffect} />}
            </View>

            {canClaim && (
                <Pressable onPress={() => onClaim(node.featureId)} style={styles.claimButton}>
                    <ImageBackground source={claimButtonImage} style={styles.claimButtonBg}>
                        <Text style={styles.claimButtonText}>{t('claim_button', lang)}</Text>
                    </ImageBackground>
                </Pressable>
            )}
        </View>
    );
};


// --- Main Component ---

export const PathOfLifeScreen: React.FC<PathOfLifeScreenProps> = ({ gameState, lang, onClaimFeature }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const animatedValue = useRef(new Animated.Value(0)).current;

    const highestLevel = gameState.totalChildrenBorn;
    const currentProgress = Math.min(highestLevel / MAX_LEVEL, 1);

    const animatedHeight = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: currentProgress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [currentProgress]);

    useEffect(() => {
        const screenHeight = Dimensions.get('window').height;
        const yPos = CONTENT_HEIGHT - (highestLevel * NODE_SPACING) - (screenHeight / 2);
        scrollViewRef.current?.scrollTo({ y: Math.max(0, yPos), animated: true });
    }, [highestLevel]);

    return (
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
            <Text style={styles.screenTitle}>{t('path_of_life_title', lang)}</Text>
            
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.pathContainer, { height: CONTENT_HEIGHT }]}>
                    {/* Layer 1: Background Track */}
                    <Image
                        source={pathTrackImage}
                        style={styles.pathTrack}
                        resizeMode="stretch"
                    />

                    {/* Layer 2: Animated Progress Fill */}
                    <Animated.View style={[styles.pathFill, { height: animatedHeight }]} />

                    {/* Layer 3: Nodes */}
                    {PATH_NODES.map((node, index) => {
                        if (node.type === 'milestone') {
                            return <MilestoneMarker key={`milestone-${index}`} level={node.level} specialAsset={node.specialAsset} />;
                        } else {
                            const isUnlocked = highestLevel >= node.level;
                            const isClaimed = gameState.claimedFeatures.includes(node.featureId);
                            return (
                                <RewardNode
                                    key={`reward-${index}`}
                                    node={node}
                                    isUnlocked={isUnlocked}
                                    isClaimed={isClaimed}
                                    onClaim={onClaimFeature}
                                    lang={lang}
                                />
                            );
                        }
                    })}
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    pathContainer: {
        position: 'relative',
        width: 40,
        alignSelf: 'center',
        marginTop: TOP_OFFSET,
        marginBottom: BOTTOM_OFFSET,
    },
    pathTrack: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    pathFill: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        backgroundColor: '#FF69B4', // Hot Pink, can be replaced with a gradient
    },
    node: {
        position: 'absolute',
        alignItems: 'center',
    },
    milestone: {
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50,
        height: 50,
    },
    milestoneIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    reward: {
        width: screenWidth * 0.4,
        height: 120,
    },
    rewardLeft: {
        right: '150%',
    },
    rewardRight: {
        left: '150%',
    },
    rewardBubble: {
        width: '100%',
        height: '100%',
        padding: 10,
        justifyContent: 'center',
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    rewardDesc: {
        fontSize: 12,
        color: '#555',
    },
    rewardChestContainer: {
        position: 'absolute',
        bottom: -20,
        width: 60,
        height: 60,
    },
    rewardChest: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    lockIcon: {
        position: 'absolute',
        width: 30,
        height: 30,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
        resizeMode: 'contain',
    },
    glowEffect: {
        position: 'absolute',
        width: 100,
        height: 100,
        top: -20,
        left: -20,
        resizeMode: 'contain',
        opacity: 0.8,
    },
    claimButton: {
        position: 'absolute',
        bottom: -50,
        width: 100,
        height: 40,
    },
    claimButtonBg: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    claimButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

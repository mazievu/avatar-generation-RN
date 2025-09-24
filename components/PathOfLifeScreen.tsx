import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal, ScrollView, View, ImageBackground, Image, StyleSheet, Text, Pressable, Animated } from 'react-native';
import { GameState, Language, UnlockableFeature } from '../core/types';
import { PATH_NODES, UNLOCKABLE_FEATURES } from '../core/constants';
import { t } from '../core/localization';
import { colors } from './designSystem';

// Import assets
const bgImage = require('../assets/path_of_life_bg.webp');
const titleBannerImage = require('../assets/path_of_life_banner.webp');
const pathTrackImage = require('../assets/path_background.png');
const wingedHeartImage = require('../assets/winged_heart.webp');
const gemImage = require('../assets/gem.webp');
const glowEffectImage = require('../assets/glow_effect.webp');
const bubbleImage = require('../assets/bubble.webp');
const chestImage = require('../assets/chest.webp');
const lockImage = require('../assets/lock.webp');
const claimButtonImage = require('../assets/claim_button.webp');

// --- REPLACED PathNodeItem ---
interface PathNodeItemProps {
  node: { level: number; featureId: string; alignment: 'left' | 'right' };
  feature: UnlockableFeature;
  isGlowing: boolean;
  isClaimable: boolean;
  isClaimed: boolean;
  isLocked: boolean;
  positionStyle: object;
  onClaim: (featureId: string) => void;
  onShowInfo: (feature: UnlockableFeature) => void;
  lang: Language;
}

const PathNodeItem: React.FC<PathNodeItemProps> = ({
  node, feature, isGlowing, isClaimable, isClaimed, isLocked, positionStyle, onClaim, onShowInfo, lang
}) => {
  // CONSTRAINT 5: State for button press effect
  const [isPressed, setIsPressed] = useState(false);

  const isSpecialMilestone = node.level % 10 === 0 && node.level > 0;
  const markerImage = isSpecialMilestone ? wingedHeartImage : gemImage;
  const isAlignedRight = node.alignment === 'right';

  return (
    <View style={[styles.nodeContainer, positionStyle]}>
      
      {/* CONSTRAINT 1: Milestone is separate on the track */}
      <View style={styles.milestoneOnTrack}>
        {isGlowing && <Image source={glowEffectImage} style={styles.glowEffect} resizeMode="contain" />}
        <ImageBackground source={markerImage} style={styles.milestoneImage} resizeMode="contain">
          <Text style={styles.milestoneText}>{node.level}</Text>
        </ImageBackground>
      </View>
      
      {/* CONSTRAINT 1: Reward is separate on the side */}
      <View style={[styles.rewardOnSide, isAlignedRight ? styles.rewardRight : styles.rewardLeft]}>
        <ImageBackground 
          source={bubbleImage} 
          style={[styles.rewardBubble, !isAlignedRight && styles.bubbleFlipped]}
          resizeMode="stretch"
        >
          {/* CONSTRAINT 3: Chest is fully inside */}
          <View style={styles.chestInsideBubble}>
            <Image source={chestImage} style={styles.chestImage} resizeMode="contain" />
          </View>
        </ImageBackground>

        {/* CONSTRAINT 3: Lock is overlapping */}
        {isLocked && (
          <Image source={lockImage} style={styles.lockOverlapping} resizeMode="contain" />
        )}
        
        {/* CONSTRAINT 4: Info button is outside, styled correctly */}
        <Pressable onPress={() => onShowInfo(feature)} style={styles.infoButtonStyled}>
            <Text style={styles.infoButtonText}>i</Text>
        </Pressable>

        {/* CONSTRAINT 5: Claim button has press effect */}
        {isClaimable && (
          <Pressable 
            onPress={() => onClaim(feature.id)}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[styles.claimButtonContainer, { transform: [{ translateY: isPressed ? 2 : 0 }] }]}
          >
            <ImageBackground source={claimButtonImage} style={styles.claimButton} resizeMode="stretch">
              <Text style={styles.claimButtonText}>{t('claim_button_text', lang)}</Text>
            </ImageBackground>
          </Pressable>
        )}

        {isClaimed && <Text style={styles.claimedText}>{t('claimed_text', lang)}</Text>}
      </View>
    </View>
  );
};


// Main component remains the same
interface PathOfLifeScreenProps {
  gameState: GameState;
  lang: Language;
  onClaimFeature: (featureId: string) => void;
}

export const PathOfLifeScreen: React.FC<PathOfLifeScreenProps> = ({ gameState, lang, onClaimFeature }) => {
  const [infoModalFeature, setInfoModalFeature] = useState<UnlockableFeature | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const highestLevel = PATH_NODES[PATH_NODES.length - 1].level;
  const contentHeight = highestLevel * 15;
  const currentProgress = gameState.totalChildrenBorn;
  const overallProgress = currentProgress / highestLevel;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
      Animated.timing(progressAnimation, {
          toValue: overallProgress,
          duration: 500,
          useNativeDriver: false,
      }).start();
  }, [overallProgress, progressAnimation]);

  const animatedHeight = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
  });

  const currentGlowLevel = useMemo(() => {
      const lastUnlockableNode = [...PATH_NODES]
          .reverse()
          .find(node => currentProgress >= node.level);
      return lastUnlockableNode ? lastUnlockableNode.level : null;
  }, [currentProgress]);

  useEffect(() => {
    const scrollPosition = contentHeight * (1 - (currentProgress / highestLevel));
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  }, [currentProgress, contentHeight, highestLevel]);

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <Image source={titleBannerImage} style={styles.screenTitleBanner} resizeMode="contain" />

      <ScrollView ref={scrollViewRef} style={styles.scrollContainer} contentContainerStyle={{ paddingVertical: 50 }}>
        <View style={[styles.pathContainer, { height: contentHeight }]}>
          <Image source={pathTrackImage} style={styles.pathTrack} resizeMode="stretch" />
          <Animated.View style={[styles.pathFill, { height: animatedHeight }]} />
          
          {PATH_NODES.map(node => {
            const feature = UNLOCKABLE_FEATURES.find(f => f.id === node.featureId);
            if (!feature) return null;

            const isPassed = currentProgress >= node.level;
            const isClaimed = gameState.claimedFeatures.includes(node.featureId);
            const isClaimable = isPassed && !isClaimed;
            const isCurrentGlowTarget = node.level === currentGlowLevel;
            const positionStyle = { bottom: `${(node.level / highestLevel) * 100}%` };

            return (
              <PathNodeItem
                key={`node-${node.level}`}
                node={node}
                feature={feature}
                isGlowing={isCurrentGlowTarget}
                isClaimable={isClaimable}
                isClaimed={isClaimed}
                isLocked={!isPassed}
                positionStyle={positionStyle}
                onClaim={onClaimFeature}
                onShowInfo={setInfoModalFeature}
                lang={lang}
              />
            );
          })}
        </View>
      </ScrollView>

      {infoModalFeature && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={!!infoModalFeature}
          onRequestClose={() => setInfoModalFeature(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t(infoModalFeature.nameKey, lang)}</Text>
              <Text style={styles.modalDescription}>{t(infoModalFeature.descriptionKey, lang)}</Text>
              <Pressable style={styles.modalCloseButton} onPress={() => setInfoModalFeature(null)}>
                <Text style={styles.modalCloseButtonText}>{t('common.close', lang)}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ImageBackground>
  );
};

// --- REPLACED StyleSheet ---
const styles = StyleSheet.create({
    // --- Basic styles (background, scroll, path...) ---
    background: { flex: 1, alignItems: 'center' },
    screenTitleBanner: { width: '80%', height: 80, marginTop: 50, marginBottom: 10 },
    scrollContainer: { width: '100%' },
    pathContainer: { alignSelf: 'center', position: 'relative', width: 20 },
    pathTrack: { position: 'absolute', width: '100%', height: '100%' },
    pathFill: { position: 'absolute', width: '100%', backgroundColor: '#FF69B4', bottom: 0 },

    // --- Container for each level (Invisible) ---
    nodeContainer: { position: 'absolute', width: '100%', height: 120, justifyContent: 'center' },
    
    // --- Cluster 1: Milestone on track ---
    milestoneOnTrack: { position: 'absolute', width: 100, height: 100, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
    milestoneImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    milestoneText: { color: 'white', fontSize: 24, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    glowEffect: { position: 'absolute', width: 150, height: 150 },

    // --- Cluster 2: Reward on the side ---
    rewardOnSide: {
        position: 'absolute',
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center', // Center vertically
    },
    rewardLeft: { right: '50%', marginRight: 30 },
    rewardRight: { left: '50%', marginLeft: 30 },
    
    // CONSTRAINT 2: Square, non-squashed bubble
    rewardBubble: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleFlipped: { transform: [{ scaleX: -1 }] },
    
    // CONSTRAINT 3: Chest inside bubble
    chestInsideBubble: {
        width: '70%',
        height: '70%',
    },
    chestImage: { width: '100%', height: '100%' },
    
    // CONSTRAINT 3: Lock half-in, half-out
    lockOverlapping: {
        position: 'absolute',
        width: 50, 
        height: 50,
        bottom: 20, 
        zIndex: 15, // On top of the bubble
    },
    
    // Claim button and claimed status
    claimButtonContainer: {
        position: 'absolute',
        bottom: 25, 
        zIndex: 20, // On top of the lock
    },
    claimButton: { width: 120, height: 45, justifyContent: 'center', alignItems: 'center' },
    claimButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    claimedText: { color: colors.success, fontWeight: 'bold', position: 'absolute', bottom: 35 },

    // CONSTRAINT 4: Info button with orange bg and black border
    infoButtonStyled: {
        position: 'absolute',
        top: 20, // Adjust position
        right: 5, // Adjust position
        width: 28,
        height: 28,
        borderRadius: 14, 
        backgroundColor: '#FFAC33',
        borderWidth: 2, 
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    infoButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // --- Modal Styles (unchanged) ---
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalContainer: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 15, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    modalCloseButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
    modalCloseButtonText: { color: 'white', fontWeight: 'bold' },
});
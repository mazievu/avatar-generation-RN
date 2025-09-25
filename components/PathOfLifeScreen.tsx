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
            {feature.type === 'specific_feature' && feature.iconAsset ? (
              <Image source={feature.iconAsset} style={styles.featureIcon} resizeMode="contain" />
            ) : (
              <Image source={chestImage} style={styles.chestImage} resizeMode="contain" />
            )}
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

// NEW LOGIC FOR FIXED SPACING
export const PathOfLifeScreen: React.FC<PathOfLifeScreenProps> = ({ gameState, lang, onClaimFeature }) => {
  const [infoModalFeature, setInfoModalFeature] = useState<UnlockableFeature | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [claimedNotification, setClaimedNotification] = useState<UnlockableFeature | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const nodeSpacing = 400; // New: Fixed spacing between nodes
  const contentHeight = (PATH_NODES.length - 1) * nodeSpacing; // New: Height based on fixed spacing

  const currentProgress = gameState.totalChildrenBorn;

  const handleClaim = (featureId: string) => {
    onClaimFeature(featureId);
    const feature = UNLOCKABLE_FEATURES.find(f => f.id === featureId);
    if (feature) {
        setClaimedNotification(feature);
    }
  };

  // New: Find the index of the last passed node for progress bar and scrolling
  const lastPassedNodeIndex = useMemo(() => {
    for (let i = PATH_NODES.length - 1; i >= 0; i--) {
      if (currentProgress >= PATH_NODES[i].level) {
        return i;
      }
    }
    return -1; // No nodes passed yet
  }, [currentProgress]);

  // New: Progress is now based on the index of the last passed node
  const overallProgress = lastPassedNodeIndex >= 0 ? lastPassedNodeIndex / (PATH_NODES.length - 1) : 0;
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

  // New: Scrolling logic updated for fixed spacing
  useEffect(() => {
    if (scrollViewRef.current && lastPassedNodeIndex > -1) {
      const scrollPosition = contentHeight - (lastPassedNodeIndex * nodeSpacing);
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  }, [lastPassedNodeIndex, contentHeight, nodeSpacing]);

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.titleContainer}>
            <Image source={titleBannerImage} style={styles.screenTitleBanner} resizeMode="contain" />
            <Pressable onPress={() => setShowInfoModal(true)} style={styles.bannerInfoIcon}>
                <Text style={styles.bannerInfoIconText}>i</Text>
            </Pressable>
        </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollContainer} contentContainerStyle={{ paddingTop: 50, paddingBottom: 120 }}>
        <View style={[styles.pathContainer, { height: contentHeight }]}>
          <Image source={pathTrackImage} style={styles.pathTrack} resizeMode="stretch" />
          <Animated.View style={[styles.pathFill, { height: animatedHeight }]} />
          
          {PATH_NODES.map((node, index) => { // New: Get index from map
            const feature = UNLOCKABLE_FEATURES.find(f => f.id === node.featureId);
            if (!feature) return null;

            const isPassed = currentProgress >= node.level;
            const isClaimed = gameState.claimedFeatures.includes(node.featureId);
            const isClaimable = isPassed && !isClaimed;
            const isCurrentGlowTarget = node.level === currentGlowLevel;
            // New: Position style based on index and fixed spacing
            const positionStyle = { bottom: index * nodeSpacing };

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
                onClaim={handleClaim}
                onShowInfo={setInfoModalFeature}
                lang={lang}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Modal to display detailed information */}
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

      {/* Modal for general info */}
      {showInfoModal && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('path_of_life_info_title', lang)}</Text>
              <Text style={styles.modalDescription}>{t('path_of_life_info_desc', lang)}</Text>
              <Pressable style={styles.modalCloseButton} onPress={() => setShowInfoModal(false)}>
                <Text style={styles.modalCloseButtonText}>{t('common.close', lang)}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal for claim notification */}
      {claimedNotification && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={!!claimedNotification}
          onRequestClose={() => setClaimedNotification(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('feature_unlocked', lang)}</Text>
              <Text style={styles.modalDescription}>
                {t('you_have_unlocked', lang)} {t(claimedNotification.nameKey, lang)}!
              </Text>
              <Pressable style={styles.modalCloseButton} onPress={() => setClaimedNotification(null)}>
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 10,
        width: '90%',
        position: 'relative',
    },
    screenTitleBanner: {
        width: '80%',
        height: 80,
    },
    bannerInfoIcon: {
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: [{ translateY: -14 }],
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
    bannerInfoIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollContainer: { width: '100%' },
    pathContainer: { alignSelf: 'center', position: 'relative', width: 20 },
    pathTrack: { position: 'absolute', width: '100%', height: '100%' },
    pathFill: { position: 'absolute', width: '100%', backgroundColor: '#FF69B4', bottom: 0 },

    // --- Container for each level (Invisible) ---
    nodeContainer: { position: 'absolute', width: '100%', height: 120, justifyContent: 'center' },
    
    // --- Cluster 1: Milestone on track ---
    milestoneOnTrack: {
        position: 'absolute',
        // Kích thước mặc định cho Gem (nhỏ hơn 30%)
        width: 70, // 100 * 0.7
        height: 70, // 100 * 0.7
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    milestoneImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    // Style riêng cho Wing Heart để làm nó to hơn
    specialMilestone: {
        width: 120, // 100 * 1.2
        height: 120, // 100 * 1.2
    },
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    chestImage: { width: '100%', height: '100%' },
    featureIcon: { width: '90%', height: '90%' },
    
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

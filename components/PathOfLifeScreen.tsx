import React, { useRef, useEffect, useMemo } from 'react'; // Added useMemo
import { ScrollView, View, ImageBackground, Image, StyleSheet, Text, Pressable, Animated } from 'react-native';
import { GameState, Language, UnlockableFeature } from '../core/types';
import { PATH_NODES, UNLOCKABLE_FEATURES } from '../core/constants';
import { t } from '../core/localization';
import { colors } from './designSystem';

// Import các assets đã chuẩn bị

// const pathBackgroundImage = require('../assets/path_background.webp'); // Removed
const wingedHeartImage = require('../assets/winged_heart.webp');
const gemImage = require('../assets/gem.webp');
const glowEffectImage = require('../assets/glow_effect.webp');
const bubbleImage = require('../assets/bubble.webp');
const chestImage = require('../assets/chest.webp');
const lockImage = require('../assets/lock.webp');
const claimButtonImage = require('../assets/claim_button.webp');

interface MilestoneMarkerProps {
  level: number;
  isGlowing: boolean; // Changed from isCurrent
  style: object;
  asset?: 'winged_heart' | 'gem';
}

const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({ level, isGlowing, style, asset }) => {
  const markerImage = asset === 'winged_heart' ? wingedHeartImage : gemImage;

  return (
    <View style={[styles.milestoneContainer, style]}>
      {isGlowing && <Image source={glowEffectImage} style={styles.glowEffect} />} {/* Changed isCurrent to isGlowing */}
      <ImageBackground source={markerImage} style={styles.milestoneImage}>
        <Text style={styles.milestoneText}>{level}</Text>
      </ImageBackground>
    </View>
  );
};

interface RewardNodeProps {
  feature: UnlockableFeature | undefined;
  isClaimable: boolean;
  isClaimed: boolean;
  isLocked: boolean;
  alignment: 'left' | 'right';
  style: object;
  onClaim: (featureId: string) => void; // New prop for claiming
}

const RewardNode: React.FC<RewardNodeProps> = ({ feature, isClaimable, isClaimed, isLocked, alignment, style, onClaim }) => {
  if (!feature) {
    return null; // Should not happen if PATH_NODES is correctly configured
  }

  return (
    <View style={[styles.rewardContainer, alignment === 'left' ? styles.rewardLeft : styles.rewardRight, style]}>
      <ImageBackground source={bubbleImage} style={styles.rewardBubble}>
        <Image source={chestImage} style={styles.chestImage} />
        {/* Nút thông tin (i) ở đây */}
      </ImageBackground>
      
      {isLocked && <Image source={lockImage} style={styles.lockImage} />}
      {isClaimable && (
        <Pressable onPress={() => onClaim(feature.id)}>
          <ImageBackground source={claimButtonImage} style={styles.claimButton}>
            <Text style={styles.claimButtonText}>{t('claim_button_text', 'en')}</Text> {/* Assuming 'en' for now, will pass lang later */}
          </ImageBackground>
        </Pressable>
      )}
      {isClaimed && <Text style={styles.claimedText}>{t('claimed_text', 'en')}</Text>}
    </View>
  );
};

interface PathOfLifeScreenProps {
  gameState: GameState;
  lang: Language;
  onClaimFeature: (featureId: string) => void; // New prop for claiming features
}

export const PathOfLifeScreen: React.FC<PathOfLifeScreenProps> = ({ gameState, lang, onClaimFeature }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Tính toán chiều cao tổng thể của lộ trình
  const highestLevel = PATH_NODES[PATH_NODES.length - 1].level;
  const contentHeight = highestLevel * 10; // Ví dụ: mỗi level tương ứng 10 pixels, adjust as needed

  const currentProgress = gameState.totalChildrenBorn; // Moved here for useMemo dependency

  const overallProgress = currentProgress / highestLevel; // Giá trị từ 0 đến 1

  // Sử dụng Animated.Value để tạo hiệu ứng mượt mà
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
      Animated.timing(progressAnimation, {
          toValue: overallProgress,
          duration: 500,
          useNativeDriver: false,
      }).start();
  }, [overallProgress, progressAnimation]);

  // Chuyển đổi giá trị progress (0-1) thành chuỗi phần trăm ('0%' - '100%')
  const animatedHeight = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
  });

  // TÍNH TOÁN MỐC CẦN SÁNG
  const currentGlowLevel = useMemo(() => {
      // Tìm node cuối cùng (có level cao nhất) mà người chơi đã vượt qua
      const lastPassedNode = [...PATH_NODES]
          .reverse() // Đảo ngược mảng để tìm từ cao xuống thấp
          .find(node => node.type === 'milestone' && currentProgress >= node.level);
      
      // Trả về level của node đó, hoặc null nếu chưa qua mốc nào
      return lastPassedNode ? lastPassedNode.level : null;
  }, [currentProgress]); // Chỉ tính lại khi progress thay đổi


  // Logic để xác định vị trí cần cuộn tới
  useEffect(() => {
    // For now, scroll to the highest achieved milestone or the end
    const scrollPosition = (currentProgress / highestLevel) * contentHeight;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  }, [currentProgress, contentHeight, highestLevel]);


  return (
    <View style={styles.background}>
      {/* Banner "Path of Life" ở đây (có thể đặt ngoài ScrollView) */}
      <Text style={styles.screenTitle}>{t('path_of_life_title', lang)}</Text>

      <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.scrollContainer, { height: contentHeight }]}>
        <View style={[styles.pathContainer, { height: contentHeight }]}>
          {/* LỚP 1: Trục Nền Tĩnh (ảnh PNG) - REMOVED */}
          <View style={styles.pathTrack} /> {/* Placeholder for the static track */}
          
          {/* LỚP 2: Phần Tiến độ Động (View được animate) */}
          <Animated.View 
              style={[styles.pathFill, { height: animatedHeight }]} 
          />
          
          {/* Render các node (mốc và phần thưởng) */ }
          {PATH_NODES.map(node => {
            const isPassed = currentProgress >= node.level;

            // Tính vị trí tuyệt đối từ dưới lên
            const positionStyle = { bottom: `${(node.level / highestLevel) * 100}%` };

            if (node.type === 'milestone') {
              // KIỂM TRA XEM MỐC NÀY CÓ PHẢI LÀ MỐC CẦN SÁNG KHÔNG
              const isCurrentGlowTarget = node.level === currentGlowLevel;

              return <MilestoneMarker 
                        key={`milestone-${node.level}`} 
                        level={node.level} 
                        isGlowing={isCurrentGlowTarget} // Passed isGlowing prop
                        style={positionStyle} 
                        asset={node.specialAsset} 
                      />;
            }

            if (node.type === 'reward') {
              const feature = UNLOCKABLE_FEATURES.find(f => f.id === node.featureId);
              const isClaimed = gameState.claimedFeatures.includes(node.featureId);
              const isClaimable = isPassed && !isClaimed;
              
              return (
                <RewardNode
                  key={`reward-${node.level}-${node.featureId}`}
                  feature={feature}
                  isClaimable={isClaimable}
                  isClaimed={isClaimed}
                  isLocked={!isPassed}
                  alignment={node.alignment}
                  style={positionStyle}
                  onClaim={onClaimFeature}
                />
              );
            }
            return null;
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'cover',
  },
  chestImage: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
  },
  claimButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    resizeMode: 'contain',
    width: 100,
  },
  claimButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  claimedText: {
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10,
  },
  glowEffect: {
    height: 80,
    opacity: 0.6,
    position: 'absolute',
    width: 80, // Adjust size of glow effect
  },
  lockImage: {
    height: 40,
    position: 'absolute',
    tintColor: 'rgba(0,0,0,0.7)',
    width: 40, // Make it semi-transparent
  },
  milestoneContainer: {
    alignItems: 'center',
    alignSelf: 'center', // Đảm bảo nó nằm giữa
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    width: 50, // Size of milestone marker
  },
  milestoneImage: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  milestoneText: {
    color: colors.neutral50,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pathContainer: {
    alignSelf: 'center',
    height: '100%', // Chiều cao của toàn bộ lộ trình
    position: 'relative', // Để các lớp con có thể định vị tuyệt đối
    width: 40, // Chiều rộng của cả trục
  },
  pathFill: {
      position: 'absolute',
      width: '100%',
      backgroundColor: '#FF69B4', // Màu hồng sáng hoặc gradient
      bottom: 0, // Quan trọng: Bắt đầu lấp đầy từ dưới lên
  },
  pathTrack: { // NEW: Placeholder for the static track
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(128, 128, 128, 0.3)', // Greyish transparent color
  },
  rewardBubble: {
    width: 80, // Size of reward bubble
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rewardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end', // Default to right alignment
    position: 'absolute',
    width: '50%', // Takes up half the screen width
  },
  rewardLeft: {
    justifyContent: 'flex-end',
    left: 0,
    paddingRight: 40, // Khoảng cách tới trục
  },
  rewardRight: {
    justifyContent: 'flex-start',
    paddingLeft: 40, // Khoảng cách tới trục
    right: 0,
  },
  screenTitle: {
    color: colors.neutral50,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    width: '100%', // Add some padding to the top and bottom
  }
});
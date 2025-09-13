import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

interface SmokeAnimationProps {
  shouldAnimate: boolean;
  color?: string;
}

export const SmokeAnimation: React.FC<SmokeAnimationProps> = ({ shouldAnimate, color = '#A0AEC0' }) => {
  const opacity1 = useSharedValue(0);
  const scale1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);

  const opacity2 = useSharedValue(0);
  const scale2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);

  useEffect(() => {
    if (shouldAnimate) {
      // Reset values
      opacity1.value = 0; scale1.value = 0; translateY1.value = 0;
      opacity2.value = 0; scale2.value = 0; translateY2.value = 0;

      // Animation for first smoke puff
      translateY1.value = withTiming(-60, { duration: 900, easing: Easing.out(Easing.ease) }); // Increased translateY
      scale1.value = withTiming(1.8, { duration: 900 }); // Increased scale
      opacity1.value = withDelay(100, withTiming(0, { duration: 800 }));

      // Animation for second smoke puff (slightly delayed)
      translateY2.value = withDelay(200, withTiming(-70, { duration: 1000, easing: Easing.out(Easing.ease) })); // Increased translateY
      scale2.value = withDelay(200, withTiming(2.2, { duration: 1000 })); // Increased scale
      opacity2.value = withDelay(300, withTiming(0, { duration: 900 }));
    }
  }, [shouldAnimate]);

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY1.value, scale: scale1.value }],
      opacity: opacity1.value,
      backgroundColor: color,
      left: '50%', // Center horizontally
      marginLeft: -7.5, // Half of width (15) to truly center
      top: 0, // Start from the top of the stat bar
      zIndex: 100, // High zIndex
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY2.value, scale: scale2.value }],
      opacity: opacity2.value,
      backgroundColor: color,
      left: '50%', // Center horizontally
      marginLeft: -7.5 + 5, // Offset slightly for second puff
      top: -5, // Offset slightly
      zIndex: 100, // High zIndex
    };
  });

  return shouldAnimate ? (
    <View style={styles.container}>
      <Animated.View style={[styles.smokePuff, animatedStyle1]} />
      <Animated.View style={[styles.smokePuff, animatedStyle2]} />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // alignSelf: 'center', // Removed alignSelf
    width: 30, // Container width
    height: 30, // Container height
    left: '50%',
    marginLeft: -15, // Half of container width
    top: 0, // Start from the top of the stat bar
    zIndex: 100, // High zIndex
  },
  smokePuff: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#A0AEC0',
  },
});
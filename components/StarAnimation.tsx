import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface StarAnimationProps {
  shouldAnimate: boolean;
  color?: string;
}

export const StarAnimation: React.FC<StarAnimationProps> = ({ shouldAnimate, color = '#FFD700' }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (shouldAnimate) {
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0;

      translateY.value = withTiming(-80, { duration: 1000, easing: Easing.out(Easing.ease) }); // Increased translateY
      opacity.value = withDelay(200, withTiming(0, { duration: 800 })); // Adjusted duration
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [shouldAnimate, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
      left: '50%', // Center horizontally
      marginLeft: -10, // Half of width (20) to truly center
      top: 0, // Start from the top of the stat bar
      zIndex: 100, // High zIndex
    };
  });

  return shouldAnimate ? (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg height="20" width="20" viewBox="0 0 24 24" fill={color}>
        <Path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.908-7.416 3.908 1.48-8.279-6.064-5.828 8.332-1.151z"/>
      </Svg>
    </Animated.View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
// src/components/StatBar.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useAnimatedProps } from 'react-native-reanimated';
import { TextInput } from 'react-native-gesture-handler';
import { StarAnimation } from './StarAnimation'; // Import StarAnimation
import { SmokeAnimation } from './SmokeAnimation'; // Import SmokeAnimation

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  Icon?: React.ElementType;
  color?: string;
  initialValue: number;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const StatBar: React.FC<StatBarProps> = ({ label, value, max, Icon, color = '#60a5fa', initialValue }) => {
  const progress = useSharedValue(initialValue);
  const scale = useSharedValue(1);
  const changeTextOpacity = useSharedValue(0);
  const changeTextTranslateY = useSharedValue(0);

  const shouldAnimateStars = useSharedValue(0); // 0 for false, 1 for true
  const shouldAnimateSmoke = useSharedValue(0); // 0 for false, 1 for true

  const statChange = value - initialValue;
  const statChangeColor = statChange > 0 ? '#22c55e' : statChange < 0 ? '#ef4444' : color;

  useEffect(() => {
    progress.value = withTiming(value, { duration: 500 });
    scale.value = withSpring(1.2, { damping: 2, stiffness: 200 }, () => {
      scale.value = withSpring(1);
    });

    if (statChange !== 0) {
      changeTextOpacity.value = 1;
      changeTextTranslateY.value = withTiming(-20, { duration: 500 }, () => {
        changeTextOpacity.value = withTiming(0, { duration: 300 });
        changeTextTranslateY.value = 0;
      });

      if (statChange > 0) {
        shouldAnimateStars.value = 1;
        // Reset after animation
        setTimeout(() => { shouldAnimateStars.value = 0; }, 1000);
      } else if (statChange < 0) {
        shouldAnimateSmoke.value = 1;
        // Reset after animation
        setTimeout(() => { shouldAnimateSmoke.value = 0; }, 1000);
      }
    }
  }, [value, progress, scale, statChange, changeTextOpacity, changeTextTranslateY, shouldAnimateStars, shouldAnimateSmoke]);

  const animatedFillStyle = useAnimatedStyle(() => {
    const percentage = (progress.value / max) * 100;
    return {
      width: `${percentage}%`,
      backgroundColor: statChangeColor,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedChangeTextStyle = useAnimatedStyle(() => {
    return {
      opacity: changeTextOpacity.value,
      transform: [{ translateY: changeTextTranslateY.value }],
      color: statChangeColor,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(progress.value)}`,
    } as any;
  });

  return (
    <View style={styles.statRow}>
      {Icon && <Icon width={24} height={24} color="#334155" />}
      <Text style={styles.statLabel}>{label}</Text>

      <View style={styles.barContainer}>
        <View style={styles.statBarBackground}>
          <Animated.View style={[styles.statBarFill, animatedFillStyle]} />
        </View>
      </View>

      <Animated.View style={animatedTextStyle}>
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={`${Math.round(value)}`}
          style={styles.statValue}
          animatedProps={animatedProps}
        />
      </Animated.View>

      {statChange !== 0 && (
        <Animated.View style={[styles.changeTextContainer, animatedChangeTextStyle]}>
          <Text style={styles.changeText}>
            {statChange > 0 ? `+${statChange}` : statChange}
          </Text>
        </Animated.View>
      )}

      {/* Star/Smoke Animations - Moved outside statBarBackground */}
      <StarAnimation shouldAnimate={shouldAnimateStars.value === 1} />
      <SmokeAnimation shouldAnimate={shouldAnimateSmoke.value === 1} />
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flex: 0.6,
    marginHorizontal: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  changeTextContainer: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    right: 0,
    top: -10,
  },
  statBarBackground: {
    backgroundColor: '#e2e8f0',
    borderRadius: 7,
    height: 14,
    
    justifyContent: 'center', // Center the animations vertically
  },
  statBarFill: {
    borderRadius: 7,
    height: '100%',
  },
  statLabel: {
    color: '#334155',
    flex: 0.3,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    position: 'relative',
  },
  statValue: {
    color: '#334155',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 35,
    padding: 0,
    textAlign: 'right',
  },
});
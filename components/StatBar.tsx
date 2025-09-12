// src/components/StatBar.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useAnimatedProps } from 'react-native-reanimated';
import { TextInput } from 'react-native-gesture-handler';

// Import các icon SVG của bạn tại đây
// import IqIcon from './icons/IqIcon';
// import HappinessIcon from './icons/HappinessIcon';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  Icon?: React.ElementType; // Cho phép truyền component Icon vào
  color?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const StatBar: React.FC<StatBarProps> = ({ label, value, max, Icon, color = '#60a5fa' }) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(value, { duration: 500 });
    // Hiệu ứng nảy
    scale.value = withSpring(1.2, { damping: 2, stiffness: 200 }, () => {
      scale.value = withSpring(1);
    });
  }, [value, progress, scale]);

  const animatedFillStyle = useAnimatedStyle(() => {
    const percentage = (progress.value / max) * 100;
    return {
      width: `${percentage}%`,
      backgroundColor: color,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
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
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flex: 0.6, // Quan trọng: Chiếm toàn bộ không gian còn lại
    marginHorizontal: 8,
  },
  statBarBackground: {
    backgroundColor: '#e2e8f0',
    borderRadius: 7,
    height: 14,
    overflow: 'hidden', // Đảm bảo fill không tràn ra ngoài
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
  },
  statValue: {
    minWidth: 35, // Đảm bảo đủ không gian
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#334155',
    padding: 0, // Xóa padding mặc định của TextInput
  },
});
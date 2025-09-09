// src/components/StatBar.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

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

export const StatBar: React.FC<StatBarProps> = ({ label, value, max, Icon, color = '#60a5fa' }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate khi giá trị prop thay đổi
    Animated.timing(animValue, {
      toValue: value,
      duration: 500,
      useNativeDriver: false, // `width` không được hỗ trợ bởi native driver
    }).start();
  }, [value]);

  // Nội suy giá trị animation thành chuỗi phần trăm
  const barWidth = animValue.interpolate({
    inputRange: [0, max],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp', // Đảm bảo giá trị không vượt ra ngoài [0%, 100%]
  });

  return (
    <View style={styles.statRow}>
      {Icon && <Icon width={24} height={24} color="#334155" />}
      <Text style={styles.statLabel}>{label}</Text>
      
      <View style={styles.barContainer}>
        <View style={styles.statBarBackground}>
          <Animated.View style={[styles.statBarFill, { width: barWidth, backgroundColor: color }]} />
        </View>
      </View>
      
      <Text style={styles.statValue}>{Math.round(value)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    flex: 0.3,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginLeft: 8,
  },
  barContainer: {
    flex: 0.6, // Quan trọng: Chiếm toàn bộ không gian còn lại
    marginHorizontal: 8,
  },
  statBarBackground: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 7,
    overflow: 'hidden', // Đảm bảo fill không tràn ra ngoài
  },
  statBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  statValue: {
    flex: 0.1,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#334155',
  },
});
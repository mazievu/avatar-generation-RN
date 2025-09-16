
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { formatCurrency } from '../core/utils';

interface IncomeAnimationProps {
  netIncome: number;
  characterId: string;
  currentDate: { day: number; year: number };
}

const IncomeAnimation: React.FC<IncomeAnimationProps> = ({ netIncome, characterId, currentDate }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const lastShownDate = useRef<{ day: number; year: number } | null>(null);

  useEffect(() => {
    const month = Math.floor(currentDate.day / 30);
    const lastShownMonth = lastShownDate.current ? Math.floor(lastShownDate.current.day / 30) : -1;

    if (netIncome !== 0 && (lastShownDate.current === null || month !== lastShownMonth || currentDate.year !== lastShownDate.current.year)) {
      lastShownDate.current = currentDate;
      fadeAnim.setValue(1);
      translateYAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -50,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [netIncome, characterId, currentDate]);

  if (netIncome === 0) {
    return null;
  }

  const incomeColor = netIncome > 0 ? '#4CAF50' : '#F44336'; // Green for positive, Red for negative

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <Text style={[styles.incomeText, { color: incomeColor }]}>
        {formatCurrency(netIncome)}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: -20,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default IncomeAnimation;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Animated, ImageSourcePropType, Dimensions } from 'react-native';


import type { Character, Manifest, Language } from '../core/types'; // Giả sử các types này đã được định nghĩa
import { getCharacterDisplayName } from '../core/utils';
import { MaleIcon, FemaleIcon } from './icons';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview'; // Component này cũng cần được viết cho RN

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

// Props cho component
interface CharacterNodeProps {
  character: Character;
  onClick: () => void;
  lang: Language; // Added lang prop based on usage in getCharacterDisplayName
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  // images và manifest có thể cần cách tiếp cận khác trong RN, 
  // ví dụ như truyền URI hoặc dùng require()
}

export const CharacterNode: React.FC<CharacterNodeProps> = ({ character, onClick, lang, manifest, images }) => {
  const { isPlayerCharacter, isAlive, gender, age, monthlyNetIncome } = character;
  const displayName = getCharacterDisplayName(character, lang);

  // --- Animation Setup ---
  const [showMoney, setShowMoney] = useState(false);
  const moneyFlyAnim = useRef(new Animated.Value(0)).current; // 1 giá trị điều khiển cả opacity và vị trí

  useEffect(() => {
    if (!isAlive) return;
    const intervalId = setInterval(() => {
      setShowMoney(true);
      // Reset và bắt đầu animation
      moneyFlyAnim.setValue(0);
      Animated.timing(moneyFlyAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true, // Quan trọng để có hiệu năng tốt
      }).start(() => {
        setShowMoney(false);
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isAlive, moneyFlyAnim]);

  // Nội suy giá trị animation
  const moneyTranslateY = moneyFlyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -48], // Di chuyển lên trên 48px
  });

  const moneyOpacity = moneyFlyAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 0.4, 0], // Mờ dần ở cuối
  });
  
  // --- Dynamic Styles ---
  const avatarContainerStyle = [
    styles.avatarBase,
    { 
      borderColor: isPlayerCharacter ? '#facc15' : '#cbd5e1',
      backgroundColor: !isAlive ? '#e2e8f0' : 'transparent',
    },
    !isAlive && styles.deceased, // Áp dụng opacity
  ];
  
  const netIncomeColor = monthlyNetIncome >= 0 ? '#16a34a' : '#ef4444';
  const netIncomeSign = monthlyNetIncome > 0 ? '+' : '';
  const formattedIncome = `${netIncomeSign}${Math.round(monthlyNetIncome).toLocaleString()}`;
  
  return (
    <Pressable style={styles.container} onPress={onClick}>
      {({ pressed }) => (
        <>
          <View style={[styles.avatarWrapper, pressed && styles.avatarPressed]}>
            <View style={avatarContainerStyle}>
              {character.staticAvatarUrl ? (
                <AgeAwareAvatarPreview character={character} size={{ width: 96, height: 96 }} manifest={manifest} images={images} />
              ) : (
                gender === 'Male' 
                    ? <MaleIcon width={48} height={48} color="#0284c7" /> 
                    : <FemaleIcon width={48} height={48} color="#db2777" />
              )}
            </View>

            {isAlive && (
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{age}</Text>
              </View>
            )}
          </View>

          <Text style={styles.nameText} numberOfLines={1}>
            {displayName}
          </Text>

          {isAlive && (
            <View style={styles.incomeContainer}>
              <Text style={[styles.incomeText, { color: netIncomeColor }]}>
                {formattedIncome}/mo
              </Text>
              {showMoney && (
                <Animated.View style={[
                  styles.moneyFlyEffect,
                  { 
                    opacity: moneyOpacity,
                    transform: [{ translateY: moneyTranslateY }] 
                  }
                ]}>
                  <Text style={[styles.moneyFlyText, { color: netIncomeColor }]}>
                    {formattedIncome}$
                  </Text>
                </Animated.View>
              )}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 112, // Tương đương w-28
    gap: 4,
  },
  avatarWrapper: {
    width: 96, // Tương đương w-24
    height: 96, // Tương đương h-24
    position: 'relative',
    // transitionProperty: 'transform', // Hiệu ứng scale khi nhấn - Not directly supported in RN StyleSheet
    // transitionDuration: '0.2s', // Not directly supported in RN StyleSheet
  },
  avatarPressed: {
    transform: [{ scale: 1.1 }], // Hiệu ứng khi nhấn
  },
  avatarBase: {
    width: '100%',
    height: '100%',
    borderRadius: 48, // Một nửa chiều rộng/cao để tạo hình tròn
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow cho Android
    elevation: 5,
  },
  deceased: {
    opacity: 0.6, // Thay cho grayscale
  },
  ageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  ageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: '#1e293b',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 4,
    width: '100%',
  },
  incomeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeText: {
    fontSize: 12,
    fontFamily: 'monospace', // Tương đương font-mono
    fontWeight: 'bold',
  },
  moneyFlyEffect: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  moneyFlyText: {
    fontSize: 15,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
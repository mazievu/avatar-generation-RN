import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import type { Character, Manifest, Language } from '../core/types'; // Corrected path
import { Gender } from '../core/types'; // Added Gender import
import { getCharacterDisplayName } from '../core/utils'; // Corrected path
import { MaleIcon, FemaleIcon } from './icons'; // Corrected import path for icons
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview'; // Use existing component

// Props for component
interface LocalizedProps {
  lang: Language;
}

interface CharacterNodeProps extends LocalizedProps {
  character: Character;
  onClick: () => void;
  images: Record<string, ImageSourcePropType>; // Keep this from existing CharacterNode
  manifest: Manifest; // Keep this from existing CharacterNode
}

export const CharacterNode: React.FC<CharacterNodeProps> = ({ character, onClick, lang, images, manifest }) => {
  const { isPlayerCharacter, isAlive, gender, age, monthlyNetIncome } = character;
  const displayName = getCharacterDisplayName(character, lang);

  // --- Animation Setup using Reanimated ---
  const moneyEffectOpacity = useSharedValue(0);
  const moneyEffectTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!isAlive) return;
    const intervalId = setInterval(() => {
      // Reset and start animation
      moneyEffectOpacity.value = 1; // Start visible
      moneyEffectTranslateY.value = 0; // Start at original position

      moneyEffectOpacity.value = withSequence(
        withTiming(1, { duration: 200 }), // Stay visible for a bit
        withTiming(0, { duration: 1000 }) // Fade out
      );
      moneyEffectTranslateY.value = withTiming(-48, { duration: 1200 }); // Move up 48px

    }, 2000);

    return () => clearInterval(intervalId);
  }, [isAlive, moneyEffectOpacity, moneyEffectTranslateY]);

  const moneyEffectStyle = useAnimatedStyle(() => {
    return {
      opacity: moneyEffectOpacity.value,
      transform: [{ translateY: moneyEffectTranslateY.value }],
    };
  });
  
  // --- Dynamic Styles ---
  const avatarContainerStyle = [
    styles.avatarBase,
    { 
      borderColor: isPlayerCharacter ? '#facc15' : '#cbd5e1',
      backgroundColor: !isAlive ? '#e2e8f0' : 'transparent',
    },
    !isAlive && styles.deceased, // Apply opacity
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
              {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
                <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{ width: 96, height: 96 }} style={!isAlive ? { opacity: 0.6 } : undefined} />
              ) : (
                gender === Gender.Male 
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
              {/* Reanimated Animated.View for money fly effect */}
              <Animated.View style={[
                styles.moneyFlyEffect,
                moneyEffectStyle
              ]}>
                <Text style={[styles.moneyFlyText, { color: netIncomeColor }]}>
                  {formattedIncome}$
                </Text>
              </Animated.View>
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
    // transitionProperty: 'transform', // Not directly applicable in RN StyleSheet
    // transitionDuration: '0.2s', // Not directly applicable in RN StyleSheet
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
    // fontFamily: 'monospace', // React Native doesn't have a generic 'monospace' font family. Needs specific font.
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
import * as React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import type { Character, Manifest, Language } from '../core/types';
import { Gender } from '../core/types';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { MaleIcon, FemaleIcon } from './icons';

interface LocalizedProps {
    lang: Language;
}

interface CharacterNodeProps extends LocalizedProps {
    character: Character;
    onClick: () => void;
    images: Record<string, ImageSourcePropType>; // Changed from HTMLImageElement
    manifest: Manifest;
}

export const CharacterNode: React.FC<CharacterNodeProps> = ({ character, onClick, lang, images, manifest }) => {
  const isPlayerLineage = character.isPlayerCharacter;
  const { isAlive, gender, age, monthlyNetIncome } = character;
  const displayName = getCharacterDisplayName(character, lang);

  const moneyEffectOpacity = useSharedValue(0);
  const moneyEffectTranslateY = useSharedValue(0);

  React.useEffect(() => {
    if (!isAlive) return;
    const intervalId = setInterval(() => {
        moneyEffectOpacity.value = 1;
        moneyEffectTranslateY.value = 0;
        moneyEffectOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 1000 })
        );
        moneyEffectTranslateY.value = withTiming(-20, { duration: 1200 });
    }, 2000);
    return () => clearInterval(intervalId);
  }, [isAlive, moneyEffectOpacity, moneyEffectTranslateY]);

  const moneyEffectStyle = useAnimatedStyle(() => ({
      opacity: moneyEffectOpacity.value,
      transform: [{ translateY: moneyEffectTranslateY.value }],
  }));

  const nodeBgColorStyle = !isAlive ? characterNodeStyles.nodeBgDeceased : characterNodeStyles.nodeBgAlive;
  const borderColorStyle = isPlayerLineage ? characterNodeStyles.borderPlayer : characterNodeStyles.borderNormal;
  const grayscaleStyle = !isAlive ? characterNodeStyles.grayscale : null;
  const netIncomeColorStyle = monthlyNetIncome >= 0 ? characterNodeStyles.netIncomePositive : characterNodeStyles.netIncomeNegative;
  const netIncomeSign = monthlyNetIncome > 0 ? '+' : '';
  return (
    <TouchableOpacity onPress={onClick} style={[characterNodeStyles.container, borderColorStyle, nodeBgColorStyle]}>
      <View style={characterNodeStyles.avatarWrapper}>
        {(character.avatarState || character.staticAvatarUrl) && Object.keys(images).length > 0 ? (
          <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{ width: 96, height: 96 }} style={grayscaleStyle === null ? undefined : grayscaleStyle} />
        ) : (
          gender === Gender.Male ? <MaleIcon /> : <FemaleIcon />
        )}
        {isAlive && (
          <Text style={characterNodeStyles.ageText}>
            {age}
          </Text>
        )}
      </View>

      <Text style={characterNodeStyles.displayNameText}>
        {displayName}
      </Text>

      {isAlive && (
        <View style={characterNodeStyles.netIncomeWrapper}>
          <Text style={[characterNodeStyles.netIncomeText, netIncomeColorStyle]}>
            {netIncomeSign}${Math.round(monthlyNetIncome).toLocaleString()}/mo
          </Text>

          <Animated.View style={[characterNodeStyles.netIncomeEffect, moneyEffectStyle]}>
            <Text style={[characterNodeStyles.netIncomeEffectText, netIncomeColorStyle]}>
              {netIncomeSign}{Math.round(monthlyNetIncome).toLocaleString()}$
            </Text>
          </Animated.View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const characterNodeStyles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        margin: 4,
    },
    nodeBgDeceased: {
        backgroundColor: '#e2e8f0', // slate-200
    },
    nodeBgAlive: {
        backgroundColor: 'transparent',
    },
    borderPlayer: {
        borderColor: '#fbbf24', // amber-400
    },
    borderNormal: {
        borderColor: '#cbd5e1', // slate-300
    },
    grayscale: {
        // This would typically be an image style, not a View style.
        // For React Native, you might need to apply a colorFilter or use a specific image processing library
        // if a true grayscale effect is needed. For now, I'll leave it as a placeholder.
        // If AgeAwareAvatarPreview handles image styles, it should be passed there.
    },
    avatarWrapper: {
        position: 'relative',
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageText: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        paddingHorizontal: 4,
        borderRadius: 4,
        fontSize: 12,
    },
    displayNameText: {
        marginTop: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    netIncomeWrapper: {
        position: 'relative',
        marginTop: 2,
        overflow: 'hidden', // To contain the animated money effect
    },
    netIncomeText: {
        fontSize: 12,
        textAlign: 'center',
    },
    netIncomePositive: {
        color: '#22c55e', // green-600
    },
    netIncomeNegative: {
        color: '#ef4444', // red-500
    },
    netIncomeEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        // Animation for this would be handled by Animated API in RN
    },
    netIncomeEffectText: {
        fontSize: 12,
        fontWeight: 'bold',
        // Animation for this would be handled by Animated API in RN
    },
});

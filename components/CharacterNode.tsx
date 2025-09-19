import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageSourcePropType, Dimensions } from 'react-native';
import type { Character, Manifest, Language } from '../core/types';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// --- BƯỚC 1: TÍNH TOÁN KÍCH THƯỚC LINH HOẠT ---
const screenWidth = Dimensions.get('window').width;
// Giả sử có một khoảng padding/margin tổng là 32px trên màn hình (16px mỗi bên)
const contentWidth = screenWidth - 32;
// Chúng ta muốn hiển thị khoảng 3 node trên một hàng, với khoảng cách giữa chúng
const NODE_COUNT_PER_ROW = 3;
const NODE_MARGIN = 8;
const nodeContainerWidth = (contentWidth / NODE_COUNT_PER_ROW) - (NODE_MARGIN * 2);

// Kích thước avatar sẽ dựa trên kích thước của container
const avatarSize = nodeContainerWidth * 0.85;

interface CharacterNodeProps {
  character: Character;
  onClick: () => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
}

export const CharacterNode: React.FC<CharacterNodeProps> = ({ character, onClick, lang, manifest, images }) => {
  const { isPlayerCharacter, isAlive, age, monthlyNetIncome } = character;
  const displayName = getCharacterDisplayName(character, lang);

  // --- BƯỚC 2: ÁP DỤNG KÍCH THƯỚC LINH HOẠT VÀO STYLE ---
  // We create this inside the component so it can access props like `isPlayerCharacter`
  const dynamicStyles = StyleSheet.create({
    ageBadge: {
      alignItems: 'center',
      backgroundColor: '#1e293b',
      borderColor: 'white',
      borderRadius: 13,
      borderWidth: 2,
      height: 26,
      justifyContent: 'center',
      minWidth: 26, // Dùng minWidth để số tuổi lớn vẫn hiển thị được
      paddingHorizontal: 4,
      position: 'absolute',
      right: -2,
      top: -2,
    },
    avatarBase: {
      alignItems: 'center',
      backgroundColor: '#e2e8f0', // Always have a background color for consistency
      borderColor: isPlayerCharacter ? '#facc15' : '#cbd5e1',
      borderRadius: avatarSize / 2, // Luôn là hình tròn
      borderWidth: 3,
      height: '100%',
      justifyContent: 'center',
      overflow: 'hidden',
      width: '100%',
    },
    avatarWrapper: {
      height: avatarSize,
      position: 'relative',
      width: avatarSize,
    },
    container: {
      alignItems: 'center',
      gap: 4,
      width: nodeContainerWidth,
     // marginHorizontal: NODE_MARGIN, // Khoảng cách giữa các node
     // marginBottom: 16, // Add some vertical spacing
    },
  });

  const netIncomeColor = monthlyNetIncome >= 0 ? '#16a34a' : '#ef4444';
  const formattedIncome = `${monthlyNetIncome > 0 ? '+' : ''}${Math.round(monthlyNetIncome).toLocaleString()}`;

  return (
    <Pressable style={dynamicStyles.container} onPress={onClick}>
      {({ pressed }) => (
        <>
          <View style={[dynamicStyles.avatarWrapper, pressed && { transform: [{ scale: 1.1 }] }]}>
            <View style={[dynamicStyles.avatarBase, !isAlive && styles.deceased]}>
              {/* Simplified: Always use AgeAwareAvatarPreview. It handles static URLs internally. */}
              <AgeAwareAvatarPreview character={character} size={{ width: avatarSize, height: avatarSize }} manifest={manifest} images={images} />
            </View>
            {isAlive && (
              <View style={dynamicStyles.ageBadge}>
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
            </View>
          )}
        </>
      )}
    </Pressable>
  );
};

// --- BƯỚC 3: GIỮ LẠI CÁC STYLE KHÔNG PHỤ THUỘC KÍCH THƯỚC ---
const styles = StyleSheet.create({
  ageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deceased: {
    opacity: 0.6,
  },
  incomeContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    position: 'relative', // Give it a fixed height to prevent layout shifts
  },
  incomeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameText: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    color: '#1e293b',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    textAlign: 'center',
    width: '100%',
  },
});
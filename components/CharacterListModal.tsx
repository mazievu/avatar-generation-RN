import React, { useState, useCallback } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import type { Character, Stats } from '../core/types';
import { getCharacterDisplayName } from '../core/utils';
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon } from './icons';

interface CharacterListModalProps {
  isVisible: boolean;
  characters: Character[];
  pendingBoost: { stat: keyof Stats; amount: number; featureId: string } | null;
  onConfirm: (characterId: string) => void;
  onClose: () => void;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const CharacterListModal: React.FC<CharacterListModalProps> = ({
  isVisible,
  characters,
  pendingBoost,
  onConfirm,
  onClose,
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const handleSelectCharacter = useCallback((characterId: string) => {
    setSelectedCharacterId(characterId);
  }, []);

  const handleConfirmPress = useCallback(() => {
    if (selectedCharacterId) {
      onConfirm(selectedCharacterId);
    }
  }, [selectedCharacterId, onConfirm]);

  const renderStatIcon = (statName: keyof Stats, value: number) => {
    let IconComponent;
    let color;
    switch (statName) {
      case 'iq':
        IconComponent = IqIcon;
        color = '#60a5fa';
        break;
      case 'happiness':
        IconComponent = HappinessIcon;
        color = '#facc15';
        break;
      case 'eq':
        IconComponent = EqIcon;
        color = '#a78bfa';
        break;
      case 'health':
        IconComponent = HealthIcon;
        color = '#ef4444';
        break;
      case 'skill':
        IconComponent = SkillIcon;
        color = '#4ade80';
        break;
      default:
        return null;
    }
    return (
      <View style={styles.statItem} key={statName}>
        <IconComponent color={color} style={styles.statIcon} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
    );
  };

  const renderCharacterItem = useCallback(
    ({ item }: { item: Character }) => {
      const isSelected = item.id === selectedCharacterId;
      const displayName = getCharacterDisplayName(item, 'en'); // Assuming 'en' for display in modal

      return (
        <TouchableOpacity
          style={[styles.characterItem, isSelected && styles.selectedCharacterItem]}
          onPress={() => handleSelectCharacter(item.id)}
        >
          <AgeAwareAvatarPreview
            character={item}
            size={{ width: 60, height: 60 }}
            manifest={[]}
            images={{}}
          />
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{displayName}</Text>
            <View style={styles.statsContainer}>
              {renderStatIcon('iq', item.stats.iq)}
              {renderStatIcon('happiness', item.stats.happiness)}
              {renderStatIcon('eq', item.stats.eq)}
              {renderStatIcon('health', item.stats.health)}
              {renderStatIcon('skill', item.stats.skill)}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedCharacterId, handleSelectCharacter],
  );

  if (!pendingBoost) {
    return null; // Should not be visible if no pending boost
  }

  const statNameMap: Record<keyof Stats, string> = {
    iq: 'Thông minh',
    happiness: 'Hạnh phúc',
    eq: 'EQ',
    health: 'Sức khỏe',
    skill: 'Kỹ năng',
  };

  const boostMessage = `+${pendingBoost.amount} ${statNameMap[pendingBoost.stat]}`;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn nhân vật nhận thưởng</Text>
          <Text style={styles.boostInfo}>{boostMessage}</Text>

          <FlatList
            data={characters.filter(char => char.isAlive)}
            renderItem={renderCharacterItem}
            keyExtractor={(item) => item.id}
            style={styles.characterList}
            contentContainerStyle={styles.characterListContent}
          />

          <TouchableOpacity
            style={[styles.confirmButton, !selectedCharacterId && styles.confirmButtonDisabled]}
            onPress={handleConfirmPress}
            disabled={!selectedCharacterId}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  boostInfo: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  characterList: {
    width: '100%',
    maxHeight: screenHeight * 0.5,
  },
  characterListContent: {
    paddingBottom: 10,
  },
  characterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCharacterItem: {
    borderColor: '#007bff',
    backgroundColor: '#e0f0ff',
  },
  characterInfo: {
    marginLeft: 10,
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  statIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#555',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CharacterListModal;

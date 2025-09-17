import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import type { Language } from '../core/types';
import { SCENARIOS } from '../core/scenarios';
import { t } from '../core/localization';
import { colors } from './designSystem';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface StoryChoiceModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectMode: (mode: string) => void;
  lang: Language;
}

export const StoryChoiceModal: React.FC<StoryChoiceModalProps> = ({ isVisible, onClose, onSelectMode, lang }) => {
  console.log('StoryChoiceModal rendered, isVisible:', isVisible);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={storyChoiceModalStyles.centeredView}>
        <View style={storyChoiceModalStyles.modalView}>
          <Text style={storyChoiceModalStyles.modalTitle}>{t('choose_story_title', lang)}</Text>
          <ScrollView style={storyChoiceModalStyles.scenarioList}>
            {SCENARIOS.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={storyChoiceModalStyles.scenarioButton}
                onPress={() => onSelectMode(scenario.id)}
              >
                <Text style={storyChoiceModalStyles.scenarioName}>{t(scenario.nameKey, lang)}</Text>
                <Text style={storyChoiceModalStyles.scenarioDescription}>{t(scenario.descriptionKey, lang)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={storyChoiceModalStyles.closeButton}
            onPress={onClose}
          >
            <Text style={storyChoiceModalStyles.closeButtonText}>{t('close_button', lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const storyChoiceModalStyles = StyleSheet.create({
  centeredView: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    elevation: 2,
    padding: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    color: colors.primary,
    fontSize: responsiveFontSize(22),
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    borderRadius: 20,
    elevation: 5,
    margin: 20,
    maxWidth: 400,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '80%',
  },
  scenarioButton: {
    backgroundColor: colors.neutral100,
    borderBottomWidth: 3,
    borderColor: colors.neutral200,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  scenarioDescription: {
    color: colors.textSecondary,
    fontSize: responsiveFontSize(14),
    marginTop: 5,
  },
  scenarioList: {
    marginBottom: 20,
    width: '100%',
  },
  scenarioName: {
    color: colors.textPrimary,
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
  },
});
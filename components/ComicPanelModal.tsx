// src/components/ComicPanelModal.tsx
import React from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const responsiveSize = (size: number) => Math.round(size * (screenWidth / 375));

interface ComicPanelModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  rotate?: string;
}

export const ComicPanelModal: React.FC<ComicPanelModalProps> = ({
  visible,
  onClose,
  children,
  rotate = '-1.5deg'
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable 
            style={[styles.panelContainer, { transform: [{ rotate }] }]} 
            onPress={() => { /* Ngăn click xuyên qua */ }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSize(24),
  },
  panelContainer: {
    flex: 1, // Quan trọng: Cung cấp không gian cho con
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#facc15',
    padding: responsiveSize(24),
  },
});
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
  flexContent?: boolean; 
  closeButtonComponent?: React.ReactNode;
  disableDismissOnPressOutside?: boolean; // New prop
}

export const ComicPanelModal: React.FC<ComicPanelModalProps> = ({
  visible,
  onClose,
  children,
  rotate = '-1.5deg',
  flexContent = false,
  closeButtonComponent,
  disableDismissOnPressOutside = false, // Destructure new prop with default
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={disableDismissOnPressOutside ? () => {} : onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={disableDismissOnPressOutside ? () => {} : onClose}>
        {closeButtonComponent && (
          <View style={styles.absoluteCloseButtonContainer}>
            {closeButtonComponent}
          </View>
        )}
        <Pressable 
             style={[
                styles.panelContainer, 
                flexContent && styles.flexContainer, // Áp dụng flex: 1 nếu prop là true
                { transform: [{ rotate }] }
            ]} 
            onPress={() => { /* Ngăn click xuyên qua */ }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  absoluteCloseButtonContainer: {
    position: 'absolute',
    right: responsiveSize(10), 
    top: responsiveSize(10), 
    zIndex: 10, 
  },
  flexContainer: {
    flex: 1,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    padding: responsiveSize(24),
  },
   panelContainer: {
     // Quan trọng: Cung cấp không gian cho con
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#facc15',
    padding: responsiveSize(24),
  },
});
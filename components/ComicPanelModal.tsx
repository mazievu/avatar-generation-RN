// src/components/ComicPanelModal.tsx
import React from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const responsiveSize = (size: number) => Math.round(size * (screenWidth / 375));

interface ComicPanelModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  flexContent?: boolean; 
  closeButtonComponent?: React.ReactNode;
  disableDismissOnPressOutside?: boolean; // New prop
  rotate?: string;
}

export const ComicPanelModal: React.FC<ComicPanelModalProps> = ({
  visible,
  onClose,
  children,
  flexContent = false,
  closeButtonComponent,
  disableDismissOnPressOutside = false, // Destructure new prop with default
  rotate = '0deg',
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
                { transform: [{ rotate }] },
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
    backgroundColor: 'white',
    borderColor: '#facc15',
    borderRadius: 24,
    borderWidth: 6,
    maxWidth: 500,
    padding: responsiveSize(24),
    width: '100%',
  },
});
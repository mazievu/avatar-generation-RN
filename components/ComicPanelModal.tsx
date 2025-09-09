// src/components/ComicPanelModal.tsx

import React from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveSize = (size: number) => Math.round(size * scale);

interface ComicPanelModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  rotate?: string; // Tùy chọn để thay đổi độ nghiêng cho mỗi modal
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
      {/* Lớp nền mờ, khi nhấn vào sẽ đóng modal */}
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        
        {/* Wrapper để tạo hiệu ứng nghiêng */}
        <View style={{ transform: [{ rotate }] }}>
          <Pressable 
            // Ngăn sự kiện "onPress" lan ra lớp nền mờ
            onPress={e => e.stopPropagation()} 
            style={styles.panelContainer}
          >
            {/* View này tạo ra bóng đổ "chunky" */}
            <View style={styles.panelShadow} />

            {/* View này là panel nội dung chính */}
            <View style={styles.panelContent}>
              {children}
            </View>
          </Pressable>
        </View>

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
    width: '100%',
    maxWidth: 500, // Giới hạn chiều rộng tối đa trên tablet
  },
  // --- Kỹ thuật giả lập bóng đổ chunky ---
  panelShadow: {
    position: 'absolute',
    top: responsiveSize(6),
    left: responsiveSize(6),
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 24,
  },
  // --- Panel nội dung chính ---
  panelContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#facc15', // yellow-400
    padding: responsiveSize(24),
    width: '100%',
    maxHeight: '95%', // Đảm bảo không quá cao
  },
});
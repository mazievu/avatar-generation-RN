import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalBaseProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const ModalBase: React.FC<ModalBaseProps> = ({ isVisible, onClose, title, children }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalBaseStyles.centeredView}>
        <View style={modalBaseStyles.modalView}>
          {title && (
            <View style={modalBaseStyles.modalHeader}>
              <Text style={modalBaseStyles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={modalBaseStyles.closeButton}>
                <Text style={modalBaseStyles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={modalBaseStyles.modalBody}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalBaseStyles = StyleSheet.create({
  centeredView: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center', // Semi-transparent background
  },
  closeButton: {
    backgroundColor: '#FF6347', // Tomato color
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBody: {
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  modalTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Adjust width as needed
    maxHeight: '80%', // Adjust max height as needed
  },
});

export default ModalBase;

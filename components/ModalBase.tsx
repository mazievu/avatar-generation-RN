import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { soundManager } from '../services';

interface ModalBaseProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentContainerStyle?: object;
}

const ModalBase: React.FC<ModalBaseProps> = ({ isVisible, onClose, title, children, contentContainerStyle }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalBaseStyles.centeredView}>
        <View style={modalBaseStyles.modalView}>
          {!!title && (
            <View style={modalBaseStyles.modalHeader}>
              <Text style={modalBaseStyles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => { soundManager.play('click'); onClose(); }} style={modalBaseStyles.closeButton}>
                <Text style={modalBaseStyles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={[modalBaseStyles.modalBody, contentContainerStyle]}>
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
    justifyContent: 'center',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#FF6347',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
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
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    margin: 20,
    maxHeight: '80%',
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
});

export default ModalBase;
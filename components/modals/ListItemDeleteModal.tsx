import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { screenWidth, screenHeight, baseFontSize, isSmallScreen } from '@/constants/Config';

interface DeleteListModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteListModal: React.FC<DeleteListModalProps> = ({
  visible,
  onClose,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleDeletePress = useCallback(() => {
    onDelete();
    onClose();
  }, [onDelete, onClose]);

  const handleBackdropPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalListOverlay} onPress={handleBackdropPress}>
        <View style={[styles.modalView]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <Text style={[styles.modalTitle, styles.textColor]}>Delete list</Text>
          <Text style={[styles.modalDescription, styles.textColor]}>
            Are you sure you'd like to delete this list?
          </Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleDeletePress}>
            <Text style={styles.saveButtonText}>Delete list</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const getStyles = (colors: any) => {

  return StyleSheet.create({
    modalListOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: isSmallScreen ? 10 : 20,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 5, // Android shadow
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', // Web shadow
        },
      }),
      width: '80%',
      maxWidth: 400,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: isSmallScreen ? 4 : 8,
    },
    closeButtonText: {
      fontSize: baseFontSize * 1.5,
      fontWeight: 'bold',
      color: 'grey',
    },
    modalTitle: {
      fontSize: baseFontSize * 1.2,
      fontWeight: 'bold',
      marginBottom: isSmallScreen ? 5 : 10,
      textAlign: 'center',
    },
    modalDescription: {
      marginBottom: isSmallScreen ? 10 : 20,
      textAlign: 'center',
      color: '#555',
      fontSize: baseFontSize,
    },
    saveButton: {
      backgroundColor: '#7F1D1D',
      borderRadius: 5,
      paddingVertical: isSmallScreen ? 6 : 10,
      paddingHorizontal: isSmallScreen ? 10 : 20,
      elevation: 2,
    },
    saveButtonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: baseFontSize,
    },
    textColor: {
      color: colors.text,
    },
  });
};

export default DeleteListModal;
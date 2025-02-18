import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { screenWidth, screenHeight, baseFontSize, isSmallScreen } from '@/constants/Config';

interface AddItemGroceryModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: { name: string; path: string }, mode: 'add' | 'edit') => void;
  mode: 'add' | 'edit';
  initialData?: { name: string; path: string };
}

const AddItemGroceryModal: React.FC<AddItemGroceryModalProps> = ({ visible, onClose, onAddItem, mode, initialData }) => {
  const { colors } = useTheme();
  const styles = getModalStyles(colors);

  const [name, setName] = useState(initialData?.name || '');
  const [path, setPath] = useState(initialData?.path || '');;

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setPath(initialData.path || '');
    } else {
      setName('');
      setPath('');
    }
  }, [mode, initialData]);
  const handleAddItem = () => {
    onAddItem({ ...initialData, name, path }, mode);
    setName('');
    setPath('');
    onClose();
  };

  const handleModalPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleModalPress}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{mode === 'add' ? 'Add a new item' : 'Edit item'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
              <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={(styles.placeholder as any).color}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Path</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={path}
                onChangeText={setPath}
                placeholder="Path"
                placeholderTextColor={(styles.placeholder as any).color}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
            <Text style={styles.addItemButtonText}>{mode === 'add' ? 'Add item' : 'Save item'}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const getModalStyles = (colors: any) => {

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 8,
      width: '80%',
      maxWidth: 400,
      padding: isSmallScreen ? 10 : 20,
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
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 8 : 15,
    },
    modalTitle: {
      fontSize: baseFontSize * 1.1,
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
    },
    closeButtonContainer: {
      padding: isSmallScreen ? 4 : 8,
    },
    closeButton: {
      fontSize: baseFontSize * 1.2,
      ...Platform.select({
        ios: {
          fontWeight: '600',
        },
        android: {
          fontWeight: 'bold',
        },
      }),
    },
    modalBody: {
      marginBottom: isSmallScreen ? 8 : 15,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 5 : 10,
    },
    label: {
      fontSize: baseFontSize,
      marginBottom: 0, // Remove marginBottom
      marginRight: 10,
      width: '25%', // Adjust as needed
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 4,
      paddingVertical: isSmallScreen ? 6 : 8,
      paddingHorizontal: isSmallScreen ? 8 : 12,
      fontSize: baseFontSize,
    },
    placeholder: {
      color: '#999',
      fontSize: baseFontSize,
    },
    addItemButton: {
      backgroundColor: '#2962FF',
      paddingVertical: isSmallScreen ? 8 : 10,
      borderRadius: 5,
    },
    addItemButtonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: baseFontSize,
    },
  });
}

export default AddItemGroceryModal;
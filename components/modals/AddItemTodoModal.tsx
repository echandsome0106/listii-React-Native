import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '@react-navigation/native';

import SelectInput from '@/components/ui/SelectInput';

interface AddItemTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: { name: string; priority: string;}, mode: 'add' | 'edit') => void;
  mode: 'add' | 'edit';
  initialData?: { name: string; priority: string;};
}

interface ModalStyles {
  modalOverlay: StyleProp<ViewStyle>;
  modalContent: StyleProp<ViewStyle>;
  modalHeader: StyleProp<ViewStyle>;
  modalTitle: StyleProp<TextStyle>;
  closeButton: StyleProp<TextStyle>;
  modalBody: StyleProp<ViewStyle>;
  label: StyleProp<TextStyle>;
  input: StyleProp<TextStyle>;
  addItemButton: StyleProp<ViewStyle>;
  addItemButtonText: StyleProp<TextStyle>;
}

const AddItemTodoModal: React.FC<AddItemTodoModalProps> = ({ visible, onClose, onAddItem, mode, initialData }) => {
  const { colors } = useTheme();
  const styles = getModalStyles(colors);

  const [name, setName] = useState(initialData?.name || '');
  const [priorityType, setPriorityType] = useState('Low');
  const priorityTypes = ['Low', 'Medium', 'High', 'Urgent'];

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setPriorityType(initialData.priority || '');
    } else {
      setName('');
      setPriorityType('Low');
    }
  }, [mode, initialData]);

  const handleAddItem = () => {
    onAddItem({ ...initialData, name, priority: priorityType }, mode);

    setName('');
    setPriorityType('Low');
    onClose();
  };

  const handleModalPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSelectpriorityType = (type: string) => {
    setPriorityType(type);
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
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Item Name"
              placeholderTextColor={(styles.placeholder as any).color}
            />

            <SelectInput
              label="Priority"
              value={priorityType}
              options={priorityTypes}
              onSelect={handleSelectpriorityType}
              colors={colors}
            />
          </View>

          <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
            <Text style={styles.addItemButtonText}>{mode === 'add' ? 'Add item' : 'Save item'}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const getModalStyles = (colors: Theme['colors']): ModalStyles =>
  StyleSheet.create<ModalStyles>({
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
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      fontSize: 20,
    },
    modalBody: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 10,
    },
    placeholder: {
      color: '#999',
    },
    addItemButton: {
      backgroundColor: '#2962FF',
      paddingVertical: 10,
      borderRadius: 5,
    },
    addItemButtonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

export default AddItemTodoModal;
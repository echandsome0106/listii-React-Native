import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  Clipboard,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocalSearchParams } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';
import { toggleTheme, selectThemeMode } from '@/store/reducers/themeSlice';
import * as groceryReducer from '@/store/reducers/groceryReducer';
import * as todoReducer from '@/store/reducers/todoReducer';
import * as bookmarkReducer from '@/store/reducers/bookmarkReducer';
import * as noteReducer from '@/store/reducers/noteReducer';
import * as groceryAction from '@/store/actions/groceryAction';
import * as bookmarkAction from '@/store/actions/bookmarkAction';
import * as todoAction from '@/store/actions/todoAction';
import * as noteAction from '@/store/actions/noteAction';
import { useColorScheme } from '@/hooks/useColorScheme';

import AddItemGroceryModal from '@/components/modals/AddItemGroceryModal';
import AddItemTodoModal from '@/components/modals/AddItemTodoModal';
import AddItemBookmarkModal from '@/components/modals/AddItemBookmarkModal';
import AddItemNoteModal from '@/components/modals/AddItemNoteModal';

import AlertModal from '@/components/modals/AlertModal';
import ListItemMenuModal from '@/components/modals/ListItemMenuModal';
import ListItemDeleteModal from '@/components/modals/ListItemDeleteModal';

import SelectInput from '@/components/ui/SelectInput';
import GroceryItem from '@/components/ui/GroceryItem';
import TodoItem from '@/components/ui/TodoItem';
import BookmarkItem from '@/components/ui/BookmarkItem';
import NoteItem from '@/components/ui/NoteItem';
import Nav from '@/components/ui/Nav';
import { screenWidth, screenHeight, baseFontSize, isSmallScreen } from '@/constants/Config';

// Define Types
interface ColorsType {
  text: string;
}

interface LocalSearchParams {
  type: 'Grocery' | 'ToDo' | 'Bookmark' | 'Note';
  name: string;
}
// Arrow Components
const UpArrow = ({size, colors}) => (
  <Text><Ionicons style={{bottom: size}} name="chevron-up-sharp" size={20} color={colors.text} /></Text>
);

const DownArrow = ({size, colors}) => (
  <Text><Ionicons style={{top: size}} name="chevron-down-sharp" size={20} color={colors.text} /></Text>
);

const ListDetailScreen = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1000;
  const styles = getStyles(colors, isLargeScreen);
  const category = useLocalSearchParams<LocalSearchParams>();
  const colorScheme = useColorScheme();

  const dispatch = useDispatch();

  const userInfo = useSelector((state) => state.auth);
  const userId = useMemo(() => userInfo.user? userInfo.user.id: null, [userInfo]);

  let tempReducer: any;
  let tempAction: any;

  switch (category.type) {
    case 'Grocery':
      tempReducer = groceryReducer;
      tempAction = groceryAction;
      break;
    case 'ToDo':
      tempReducer = todoReducer;
      tempAction = todoAction;
      break;
    case 'Bookmark':
      tempReducer = bookmarkReducer;
      tempAction = bookmarkAction;
      break;
    case 'Note':
      tempReducer = noteReducer;
      tempAction = noteAction;
      break;
  }

  let itemlist = useSelector(state => tempReducer.selectItemsByListId(state));
  itemlist = useMemo(() => {
    try {
      if (itemlist == undefined) return [];
      else return [...itemlist[category.id]].reverse();
    }catch(e) {
      return [];
    }
  }, [itemlist]);
  
  
  const { addItemByDB, updateItemByDB, removeItemByDB, updateAllItemsTrueByDB, 
    updateAllItemsFalseByDB, removeItemsFalseByDB, removeItemsTrueByDB } = tempAction;

  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Are you absolutely sure?');
  const [alertContent, setAlertContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [showCartItems, setShowCartItems] = useState(true);
  const [showListItems, setShowListItems] = useState(true);

  const cartItems = useMemo(() => itemlist.filter((item) => item.is_check), [itemlist]);
  const listItems = useMemo(() => itemlist.filter((item) => !item.is_check), [itemlist]);

  const handleAlert = useCallback(() => {
    if (selectedStatus === 'Check items' ||
      selectedStatus === 'Check bookmarks' || selectedStatus === 'Check notes') {
        updateAllItemsTrueByDB({userId, listId: category.id}, dispatch);
    } else if (selectedStatus === 'Clear unchecked items' ||
      selectedStatus === 'Clear active bookmarks' || selectedStatus === 'Clear notes') {
        removeItemsFalseByDB({userId, listId: category.id}, dispatch);
    } else if (selectedStatus === 'Uncheck cart'
      || selectedStatus === 'Uncheck tasks' || selectedStatus === 'Uncheck bookmarks' || selectedStatus === 'Uncheck notes') {
        updateAllItemsFalseByDB({userId, listId: category.id}, dispatch);
    } else if (selectedStatus === 'Clear cart'
      || selectedStatus === 'Clear completed tasks' || selectedStatus === 'Clear hidden bookmarks' || selectedStatus === 'Clear hidden notes') {
        removeItemsTrueByDB({userId, listId: category.id}, dispatch);
    }
    setAlertModalVisible(false);
  }, [dispatch, selectedStatus, updateAllItemsTrueByDB, removeItemsFalseByDB, updateAllItemsFalseByDB, removeItemsTrueByDB, setAlertModalVisible]);

  let listTypes: string[] = [];
  if (listItems.length > 0) {
    if (category.type === 'Bookmark') {
      listTypes.push('Check bookmarks');
      listTypes.push('Clear active bookmarks');
    } else if (category.type === 'Note') {
      listTypes.push('Check notes');
      listTypes.push('Clear notes');
    } else {
      listTypes.push('Check items');
      listTypes.push('Clear unchecked items');
    }
  }
  if (cartItems.length > 0) {
    if (category.type === 'Grocery') {
      listTypes.push('Uncheck cart');
      listTypes.push('Clear cart');
    } else if (category.type === 'ToDo') {
      listTypes.push('Uncheck tasks');
      listTypes.push('Clear completed tasks');
    } else if (category.type === 'Bookmark') {
      listTypes.push('Uncheck bookmarks');
      listTypes.push('Clear hidden bookmarks');
    } else if (category.type === 'Note') {
      listTypes.push('Uncheck notes');
      listTypes.push('Clear hidden notes');
    }
  }
  const handleSelectListType = useCallback((status: string) => {
    setSelectedStatus(status);
    if (status === 'Check items' ||
      status === 'Check bookmarks' || status === 'Check notes') {
      setAlertContent('');
    } else if (status === 'Clear unchecked items' ||
      status === 'Clear active bookmarks' || status === 'Clear notes') {
      setAlertContent('This action cannot be undone. This will permanently remove your unchecked items from our servers.');
    } else if (status === 'Uncheck cart'
      || status === 'Uncheck tasks' || status === 'Uncheck bookmarks' || status === 'Uncheck notes') {
      setAlertContent('');
    } else if (status === 'Clear cart'
      || status === 'Clear completed tasks' || status === 'Clear hidden bookmarks' || status === 'Clear hidden notes') {
      setAlertContent('This action cannot be undone. This will permanently remove your completed tasks from our servers.');
    }
    setAlertModalVisible(true);
  }, [setSelectedStatus, setAlertContent, setAlertModalVisible]);

  const openAddItemModal = useCallback(() => {
    setIsAddItemModalVisible(true);
  }, [setIsAddItemModalVisible]);

  const closeAddItemModal = useCallback(() => {
    setSelectedItem(null);
    setIsAddItemModalVisible(false);
  }, [setSelectedItem, setIsAddItemModalVisible]);

  const handleAddNewItem = useCallback((item: any, mode: string) => {
    if (mode === 'add') {
      addItemByDB({ userId, listId: category.id, item: {...item, id: uuidv4()} }, dispatch);
    } else {
      updateItemByDB({ userId, listId: category.id, item: {...item, id: selectedItem!.id} }, dispatch);
    }

    setSelectedItem(null);
    closeAddItemModal();
  }, [dispatch, addItemByDB, updateItemByDB, selectedItem, closeAddItemModal]);

  const calculateTotal = useCallback((items: any[]) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price || '0') * (item.quantity || 1)), 0);
  }, []);

  const cartTotal = useMemo(() => calculateTotal(cartItems), [cartItems, calculateTotal]);
  const listTotal = useMemo(() => calculateTotal(listItems), [listItems, calculateTotal]);

  const handleToggleCheck = useCallback((itemId: string) => {
    const itemToUpdate = itemlist.find((item) => item.id === itemId);
    if (itemToUpdate) {
      updateItemByDB({ userId, listId: category.id, item: {...itemToUpdate, is_check: !itemToUpdate.is_check} }, dispatch);
    }
  }, [itemlist, dispatch, updateItemByDB]);

  const [isVisible, setVisible] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuButtonLayout, setMenuButtonLayout] = useState<any>(null);

  const openMenuModal = useCallback((ref: any, itemId: any) => {
    if (ref.current) {
      ref.current.measure((fx, fy, width, height, px, py) => {
        setMenuButtonLayout({ x: px, y: py, width, height });
        setSelectedId(itemId);
        setVisible(true);
      });
    }
  }, [setMenuButtonLayout, setSelectedId, setVisible]);

  const onMenuClose = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDelete = useCallback(() => {
    if (selectedItem) {
      removeItemByDB({userId, listId: category.id, itemId: selectedItem.id}, dispatch);
      setSelectedItem(null);
      setDeleteModalVisible(false);
    }
  }, [dispatch, removeItemByDB, selectedItem, setAlertModalVisible, setDeleteModalVisible]);

  const handleItemMenu = useCallback((data: any) => {
    let item = itemlist.find((item: { id: string; }) => item.id === data.id);
    setSelectedItem(item);
    if (data.type == 'edit') openAddItemModal();
    else if (data.type == 'delete') setDeleteModalVisible(true);
    else if (data.type == 'copy') Clipboard.setString(item.note);
  }, [itemlist, setSelectedItem, openAddItemModal, setDeleteModalVisible]);

  return (
    <SafeAreaView style={[styles.container, styles.bgColor]}>
      <Nav page='listDetail' openAddItemModal={openAddItemModal}/>
      <ScrollView style={styles.scrollContainer}>
        <SelectInput
          label=""
          value={category.name}
          options={listTypes}
          onSelect={handleSelectListType}
          colors={colors}
          style={{ width: 200, paddingVertical: 10 }}
        />

        {category.type === 'Grocery' && (
          <>
            {
              listItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.groceryLabel}>
                        <Text style={[styles.textColor]}>{listItems.length}</Text> list items totaling: R
                        <Text style={[styles.textColor, {color: '#007bff'}]}>{listTotal}</Text></Text>
                    </View>
                    <View style={styles.sectionRight}>
                      {
                        width > 500? (
                          <Text style={[styles.groceryLabel, {color: '#999'}]}>{cartItems.length} list items totaling: R{cartTotal}</Text>
                        ):(<></>)
                      }
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowListItems(!showListItems)}>
                        {showListItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                 
                  {showListItems && (
                    <View>
                      {listItems.map(item => (
                        <GroceryItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }

            {
              cartItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.groceryLabel}>
                          <Text style={[styles.textColor]}>{cartItems.length}</Text> cart items totaling: R
                          <Text style={[styles.textColor, {color: '#007bff'}]}>{cartTotal}</Text></Text>
                    </View>
                    <View style={styles.sectionRight}>
                      {
                        width > 500? (
                          <Text style={[styles.groceryLabel, {color: '#999'}]}>{listItems.length} list items totaling: R{listTotal}</Text>
                        ): (<></>)
                      }
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowCartItems(!showCartItems)}>
                        {showCartItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showCartItems && (
                    <View>
                      {cartItems.map(item => (
                        <GroceryItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }
          </>
        )}

        {category.type === 'ToDo' && (
          <>
            {
              listItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> task in progress</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowListItems(!showListItems)}>
                        {showListItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showListItems && (
                    <View>
                      {listItems.map(item => (
                        <TodoItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }

            {
              cartItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> task completed</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowCartItems(!showCartItems)}>
                        {showCartItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showCartItems && (
                    <View>
                      {cartItems.map(item => (
                        <TodoItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }
          </>
        )}

        {category.type === 'Bookmark' && (
          <>
            {
              listItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> bookmarks active</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowListItems(!showListItems)}>
                        {showListItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showListItems && (
                    <View>
                      {listItems.map(item => (
                        <BookmarkItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }

            {
              cartItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> bookmarks hidden</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowCartItems(!showCartItems)}>
                        {showCartItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showCartItems && (
                    <View>
                      {cartItems.map(item => (
                        <BookmarkItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }
          </>
        )}

        {category.type === 'Note' && (
          <>
            {
              listItems.length > 0? (
                <>
                <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> notes active</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowListItems(!showListItems)}>
                        {showListItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                {showListItems && (
                  <View>
                    {listItems.map(item => (
                      <NoteItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                    ))}
                  </View>
                )}
                </>
              ): (<></>)
            }

            {
              cartItems.length > 0? (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.label}>
                        <Text style={[styles.label, {color: '#007bff'}]}>{listItems.length}</Text> notes hidden</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowCartItems(!showCartItems)}>
                        {showCartItems ? (
                          <View style={{bottom: 14}}>
                            <DownArrow size={7} colors={colors} />
                            <UpArrow size={7} colors={colors} />
                          </View>
                        ) : (
                          <View  style={{top: -14}}>
                            <UpArrow size={-7} colors={colors} />
                            <DownArrow size={-7} colors={colors} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showCartItems && (
                    <View>
                      {cartItems.map(item => (
                        <NoteItem key={item.id} item={item} openMenuModal={openMenuModal} handleToggleCheck={handleToggleCheck} />
                      ))}
                    </View>
                  )}
                </>
              ): (<></>)
            }
          </>
        )}

        <AlertModal
          visible={alertModalVisible}
          title={alertTitle}
          content={alertContent}
          onClose={() => setAlertModalVisible(false)}
          onConfirm={handleAlert}
        />
        <ListItemDeleteModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onDelete={handleDelete}
        />
        <ListItemMenuModal
          isVisible={isVisible}
          selectedId={selectedId}
          menuButtonLayout={menuButtonLayout}
          onMenuClose={onMenuClose}
          onItemPress={handleItemMenu}
          activeTab='Detail'
          detailTab={category.type}
        />
      </ScrollView>

      {/* Render the correct AddItemModal based on the category */}
      {(() => {
        switch (category.type) {
          case 'Grocery':
            return (
              <AddItemGroceryModal
                visible={isAddItemModalVisible}
                onClose={closeAddItemModal}
                onAddItem={handleAddNewItem}
                mode={selectedItem ? 'edit' : 'add'}
                initialData={selectedItem}
              />
            );
          case 'ToDo':
            return (
              <AddItemTodoModal
                visible={isAddItemModalVisible}
                onClose={closeAddItemModal}
                onAddItem={handleAddNewItem}
                mode={selectedItem ? 'edit' : 'add'}
                initialData={selectedItem}
              />
            );
          case 'Bookmark':
            return (
              <AddItemBookmarkModal
                visible={isAddItemModalVisible}
                onClose={closeAddItemModal}
                onAddItem={handleAddNewItem}
                mode={selectedItem ? 'edit' : 'add'}
                initialData={selectedItem}
              />
            );
          case 'Note':
            return (
              <AddItemNoteModal
                visible={isAddItemModalVisible}
                onClose={closeAddItemModal}
                onAddItem={handleAddNewItem}
                mode={selectedItem ? 'edit' : 'add'}
                initialData={selectedItem}
              />
            );
        }
      })()}
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isLargeScreen: boolean) => {

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContainer: {
      paddingHorizontal: isLargeScreen? 40: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingTop: 15,
    },
    headerLogo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmallScreen ? 5 : 10,
    },
    logo: {
      fontSize: baseFontSize * 1.5,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    newlist: {
      backgroundColor: '#007bff',
      paddingVertical: isSmallScreen ? 6 : 8,
      paddingHorizontal: isSmallScreen ? 12 : 16,
      borderRadius: 5,
      marginRight: isSmallScreen ? 5 : 10,
    },
    newlistText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: baseFontSize,
    },
    signout: {
      backgroundColor: '#007bff',
      paddingVertical: isSmallScreen ? 6 : 8,
      paddingHorizontal: isSmallScreen ? 12 : 16,
      borderRadius: 5,
      marginRight: isSmallScreen ? 5 : 10,
    },
    signoutText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: baseFontSize,
    },
    bgColor: {
      backgroundColor: colors.background,
    },
    textColor: {
      color: colors.text,
      fontSize: baseFontSize
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionToggle: {
      marginLeft: 10,
      height: 37,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 5,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      paddingVertical: isSmallScreen ? 6 : 8,
      paddingHorizontal: 8,
      fontSize: baseFontSize,
      color: colors.text,
      borderRadius: 5,
    },
    groceryLabel: {
      paddingVertical: isSmallScreen ? 6 : 8,
      paddingHorizontal: 8,
      fontSize: baseFontSize,
      color: colors.text,
      borderRadius: 5,
      backgroundColor: colors.groceryText
    },
    listItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    listItem: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    listItemShop: {
      fontSize: baseFontSize * 0.8,
      color: colors.text,
    },
    listItemName: {
      fontSize: baseFontSize,
      color: colors.text,
    },
  });
}
export default ListDetailScreen;
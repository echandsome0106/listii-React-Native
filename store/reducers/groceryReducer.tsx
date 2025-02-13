import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GroceryItem {
  id: string;
  name: string;
  price: string;
  quantity: string;
  shop: string;
  isCart: boolean;
}

interface GroceryState {
  items: GroceryItem[];
}

const initialState: GroceryState = {
  items: [],
};

const grocerySlice = createSlice({
  name: 'grocery',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<GroceryItem>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateItem: (state, action: PayloadAction<GroceryItem>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    setAllItemsIsCart: (state, action: PayloadAction<boolean>) => {
      state.items = state.items.map(item => ({ ...item, isCart: action.payload }));
    },

    setAllItemsFalse: (state) => {
      state.items = state.items.map(item =>
        item.isCart ? { ...item, isCart: false } : item
      );
    },

    setAllItemsTrue: (state) => {
      state.items = state.items.map(item =>
        !item.isCart ? { ...item, isCart: true } : item
      );
    },

    removeItemsFalse: (state) => {
      state.items = state.items.filter(item => item.isCart);
    },

    removeItemsTrue: (state) => {
      state.items = state.items.filter(item => !item.isCart);
    },
  },
});

export const {
  addItem,
  removeItem,
  updateItem,
  setAllItemsIsCart,
  setAllItemsFalse,
  setAllItemsTrue,
  removeItemsFalse,
  removeItemsTrue,
} = grocerySlice.actions;

export default grocerySlice.reducer;
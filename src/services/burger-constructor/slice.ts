import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';
import { orderBurger } from './action';

interface IConstructorState {
  constructorItems: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderError: string | null;
}

const initialState: IConstructorState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null,
  orderError: null
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    // Добавить ингредиент в конструктор
    addIngredient: (state, action: PayloadAction<TConstructorIngredient>) => {
      state.constructorItems.ingredients.push(action.payload);
    },

    // Удалить ингредиент по ID
    removeIngredient: (state, action: PayloadAction<string>) => {
      const index = state.constructorItems.ingredients.findIndex(
        (item) => item._id === action.payload
      );
      if (index !== -1) {
        state.constructorItems.ingredients.splice(index, 1);
      }
    },

    // Переместить ингредиент вверх/вниз
    moveIngredient: (
      state,
      action: PayloadAction<{ index: number; direction: 'up' | 'down' }>
    ) => {
      const { index, direction } = action.payload;
      const items = [...state.constructorItems.ingredients];
      if (direction === 'up' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      state.constructorItems.ingredients = items;
    },

    // Установить булку
    setBun: (state, action: PayloadAction<TIngredient>) => {
      state.constructorItems.bun = action.payload;
    },

    // Закрыть модальное окно заказа
    closeOrderModal: (state) => {
      state.orderModalData = null;
      state.orderError = null;
    },

    // Сбросить конструктор после заказа
    resetConstructor: (state) => {
      state.constructorItems = { bun: null, ingredients: [] };
    }
  },
  extraReducers: (builder) => {
    builder
      // Заказ отправляется
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
        state.orderError = null;
      })
      // Заказ успешен
      .addCase(
        orderBurger.fulfilled,
        (state, action: PayloadAction<{ order: TOrder; name: string }>) => {
          state.orderRequest = false;
          state.orderModalData = action.payload.order;
        }
      )
      // Заказ провален
      .addCase(
        orderBurger.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.orderRequest = false;
          state.orderError = action.payload ?? 'Failed to place order';
        }
      );
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  setBun,
  closeOrderModal,
  resetConstructor
} = constructorSlice.actions;

export default constructorSlice.reducer;
export { orderBurger } from './action';

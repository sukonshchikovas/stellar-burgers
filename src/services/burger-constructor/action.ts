import { orderBurgerApi } from '@api';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { TOrder } from '@utils-types';

// Функция для отправки заказа
export const orderBurger = createAsyncThunk<
  { order: TOrder; name: string },
  string[],
  { rejectValue: string }
>('constructor/orderBurger', async (ingredientsIds, { rejectWithValue }) => {
  try {
    const response = await orderBurgerApi(ingredientsIds);
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to place order'
    );
  }
});

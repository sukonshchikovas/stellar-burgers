import { createAsyncThunk } from '@reduxjs/toolkit';

import { TIngredient } from '../../utils/types';
import { getIngredientsApi } from '@api';

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    const ingredients = await getIngredientsApi();
    return ingredients;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch ingredients'
    );
  }
});

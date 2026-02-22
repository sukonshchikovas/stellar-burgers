import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '../../utils/types';
import { fetchIngredients } from './action';

interface IngredientsState {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
  ingredientModalData: TIngredient | null;
}

const initialState: IngredientsState = {
  items: [],
  loading: false,
  error: null,
  ingredientModalData: null
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredientModalData: (
      state,
      action: PayloadAction<TIngredient | null>
    ) => {
      state.ingredientModalData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<TIngredient[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(
        fetchIngredients.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload ?? 'Failed to fetch ingredients';
        }
      );
  }
});

export default ingredientsSlice.reducer;

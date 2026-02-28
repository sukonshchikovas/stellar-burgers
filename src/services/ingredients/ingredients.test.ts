import { expect, test, describe, jest, beforeEach } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer, { setIngredientModalData } from './slice';
import { fetchIngredients } from './action';
import { TIngredient } from '../../utils/types';
import * as ingredientsApi from '@api';

describe('тест ingredientsReducer', () => {
  const mockIngredient: TIngredient = {
    _id: 'ing-1',
    name: 'Филе',
    type: 'main',
    calories: 150,
    proteins: 25,
    fat: 5,
    carbohydrates: 0,
    price: 200,
    image: 'url',
    image_mobile: 'url',
    image_large: 'url'
  };
  const mockIngredients = [mockIngredient];

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('обработка async-экшенов', () => {
    test('успешная загрузка ингредиентов', async () => {
      jest
        .spyOn(ingredientsApi, 'getIngredientsApi')
        .mockResolvedValue(mockIngredients);

      const store = configureStore({
        reducer: {
          ingredients: ingredientsReducer
        }
      });

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;

      expect(state).toEqual({
        items: mockIngredients,
        loading: false,
        error: null,
        ingredientModalData: null
      });
    });

    test('устанавливает loading = true при начале запроса', async () => {
      let resolvePromise: (value: TIngredient[]) => void;
      const pendingPromise = new Promise<TIngredient[]>((res) => {
        resolvePromise = res;
      });

      jest
        .spyOn(ingredientsApi, 'getIngredientsApi')
        .mockReturnValue(pendingPromise);

      const store = configureStore({
        reducer: { ingredients: ingredientsReducer }
      });

      store.dispatch(fetchIngredients());

      await Promise.resolve();

      const state = store.getState().ingredients;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.items).toEqual([]);

      resolvePromise!(mockIngredients);
      await Promise.resolve();
    });

    test('обрабатывает ошибку при загрузке ингредиентов', async () => {
      jest
        .spyOn(ingredientsApi, 'getIngredientsApi')
        .mockRejectedValue(new Error('Network error'));

      const store = configureStore({
        reducer: { ingredients: ingredientsReducer }
      });

      await store.dispatch(fetchIngredients());
      const state = store.getState().ingredients;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
      expect(state.items).toEqual([]);
    });
  });

  test('setIngredientModalData устанавливает данные ингредиента', () => {
    const initialState = ingredientsReducer(undefined, { type: '@@INIT' });

    const action = setIngredientModalData(mockIngredient);
    const newState = ingredientsReducer(initialState, action);

    expect(newState.ingredientModalData).toEqual(mockIngredient);
  });
});

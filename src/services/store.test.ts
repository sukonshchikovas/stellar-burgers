import { UnknownAction } from '@reduxjs/toolkit';
import { rootReducer } from './store'; // или импортируйте rootReducer отдельно
import ingredientsReducer from './ingredients/slice';
import constructorReducer from './burger-constructor/slice';
import authReducer from './auth/slice';
import feedReducer from './order/slice';

describe('rootReducer', () => {
  const unknownAction: UnknownAction = { type: 'UNKNOWN_ACTION' };

  test('должен возвращать корректное начальное состояние при undefined state и неизвестном экшене', () => {
    const initialState = rootReducer(undefined, unknownAction);

    expect(initialState).toEqual({
      ingredients: ingredientsReducer(undefined, unknownAction),
      burgerConstructor: constructorReducer(undefined, unknownAction),
      auth: authReducer(undefined, unknownAction),
      feed: feedReducer(undefined, unknownAction)
    });
  });
});

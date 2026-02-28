import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  setBun,
  resetConstructor,
  IConstructorState,
  orderBurger
} from './slice';
import type { TIngredient, TConstructorIngredient, TOrder } from '@utils-types';
import { UnknownAction } from '@reduxjs/toolkit';

jest.mock('@api', () => ({
  orderBurgerApi: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}));

import { v4 as uuidv4 } from 'uuid';

describe('burger-constructor slice', () => {
  // Тестовые данные
  const mockIngredient: TIngredient = {
    _id: 'ing-1',
    name: 'Флюоресцентная котлета',
    type: 'main',
    calories: 420,
    proteins: 42,
    fat: 24,
    carbohydrates: 4,
    price: 999,
    image: 'url',
    image_mobile: 'url',
    image_large: 'url'
  };

  const mockBun: TIngredient = {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    calories: 420,
    proteins: 42,
    fat: 24,
    carbohydrates: 4,
    price: 1234,
    image: 'url',
    image_mobile: 'url',
    image_large: 'url'
  };

  const createConstructorIngredient = (
    ingredient: TIngredient,
    id: string
  ): TConstructorIngredient => ({
    ...ingredient,
    id
  });

  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid-123');
  });

  describe('addIngredient', () => {
    test('должен добавить ингредиент с уникальным id', () => {
      const initialState = constructorReducer(undefined, { type: '@@INIT' });
      const action = addIngredient(mockIngredient);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients).toHaveLength(1);
      expect(newState.constructorItems.ingredients[0]).toEqual({
        ...mockIngredient,
        id: 'test-uuid-123'
      });
    });

    test('должен добавлять несколько ингредиентов с разными id', () => {
      (uuidv4 as jest.Mock)
        .mockReturnValueOnce('uuid-0')
        .mockReturnValueOnce('uuid-1');

      let state = constructorReducer(undefined, { type: '@@INIT' });
      state = constructorReducer(state, addIngredient(mockIngredient));
      state = constructorReducer(state, addIngredient(mockIngredient));

      expect(state.constructorItems.ingredients).toHaveLength(2);
      expect(state.constructorItems.ingredients[0].id).toBe('uuid-0');
      expect(state.constructorItems.ingredients[1].id).toBe('uuid-1');
    });
  });

  describe('removeIngredient', () => {
    test('должен удалить ингредиент по id', () => {
      const ingredients = [
        { ...mockIngredient, id: 'id-1' },
        { ...mockIngredient, id: 'id-2' },
        { ...mockIngredient, id: 'id-3' }
      ];

      const initialState = {
        ...constructorReducer(undefined, { type: '@@INIT' }),
        constructorItems: { bun: null, ingredients }
      };

      const action = removeIngredient('id-2');
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients).toHaveLength(2);
      expect(newState.constructorItems.ingredients.map((i) => i.id)).toEqual([
        'id-1',
        'id-3'
      ]);
    });
  });

  describe('moveIngredient', () => {
    const ingredients = [
      { ...mockIngredient, id: 'id-1' },
      { ...mockIngredient, id: 'id-2' },
      { ...mockIngredient, id: 'id-3' }
    ];

    const createTestState = () => ({
      ...constructorReducer(undefined, { type: '@@INIT' }),
      constructorItems: { bun: null, ingredients: [...ingredients] }
    });

    test('должен переместить ингредиент вверх', () => {
      const initialState = createTestState();
      const action = moveIngredient({ index: 1, direction: 'up' });
      const newState = constructorReducer(initialState, action);

      const ids = newState.constructorItems.ingredients.map((i) => i.id);
      expect(ids).toEqual(['id-2', 'id-1', 'id-3']);
    });

    test('должен переместить ингредиент вниз', () => {
      const initialState = createTestState();
      const action = moveIngredient({ index: 0, direction: 'down' });
      const newState = constructorReducer(initialState, action);

      const ids = newState.constructorItems.ingredients.map((i) => i.id);
      expect(ids).toEqual(['id-2', 'id-1', 'id-3']);
    });

    test('не перемещает первый элемент вверх', () => {
      const initialState = createTestState();
      const action = moveIngredient({ index: 0, direction: 'up' });
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients.map((i) => i.id)).toEqual([
        'id-1',
        'id-2',
        'id-3'
      ]);
    });

    test('не перемещает последний элемент вниз', () => {
      const initialState = createTestState();
      const action = moveIngredient({ index: 2, direction: 'down' });
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients.map((i) => i.id)).toEqual([
        'id-1',
        'id-2',
        'id-3'
      ]);
    });
  });

  describe('setBun', () => {
    test('должен установить булку', () => {
      const initialState = constructorReducer(undefined, { type: '@@INIT' });
      const action = setBun(mockBun);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.bun).toEqual(mockBun);
    });

    test('должен заменять предыдущую булку', () => {
      const initialState = {
        ...constructorReducer(undefined, { type: '@@INIT' }),
        constructorItems: { bun: mockBun, ingredients: [] }
      };

      const newBun = { ...mockBun, _id: 'bun-2', name: 'Новая булка' };
      const action = setBun(newBun);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.bun).toEqual(newBun);
    });
  });

  describe('resetConstructor', () => {
    test('сбрасывает constructorItems к начальному состоянию', () => {
      const populatedState = {
        ...constructorReducer(undefined, { type: '@@INIT' }),
        constructorItems: {
          bun: mockBun,
          ingredients: [createConstructorIngredient(mockIngredient, 'id-1')]
        }
      };

      const action = resetConstructor();
      const newState = constructorReducer(populatedState, action);

      expect(newState.constructorItems).toEqual({ bun: null, ingredients: [] });
    });
  });
});

describe('обработка async-экшенов', () => {
  const mockOrder: TOrder = {
    _id: 'order-123',
    status: 'done',
    name: 'Бургер с котлетой',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:35:00.000Z',
    number: 42000,
    ingredients: ['ing-1', 'ing-2', 'ing-3']
  };

  const mockPayload = {
    order: mockOrder,
    name: 'Бургер с котлетой'
  };

  const getInitialState = (): IConstructorState =>
    constructorReducer(undefined, { type: '@@INIT' } as UnknownAction);

  test('при вызове orderBurger.pending: orderRequest = true, error = null, остальные поля не меняются', () => {
    // 📦 Исходное состояние с данными для проверки неизменности
    const initialState: IConstructorState = {
      ...getInitialState(),
      orderRequest: false,
      orderError: 'Old error',
      orderModalData: { _id: 'old-order' } as TOrder,
      constructorItems: {
        bun: { _id: 'bun-1', name: 'Bun' } as any,
        ingredients: [{ id: 'uuid-1', _id: 'ing-1', name: 'Ing' } as any]
      }
    };

    const pendingAction = orderBurger.pending('request-id', ['ing-1', 'ing-2']);
    const newState = constructorReducer(initialState, pendingAction);

    expect(newState.orderRequest).toBe(true);
    expect(newState.orderError).toBeNull();
    expect(newState.orderModalData).toEqual(initialState.orderModalData);
    expect(newState.constructorItems).toEqual(initialState.constructorItems);
  });

  test('при вызове orderBurger.fulfilled: данные записаны, orderRequest = false, error = null, constructorItems сброшен', () => {
    const initialState: IConstructorState = {
      ...getInitialState(),
      orderRequest: true,
      orderError: 'Old error',
      orderModalData: { _id: 'old-order' } as TOrder,
      constructorItems: {
        bun: { _id: 'bun-1', name: 'Bun' } as any,
        ingredients: [
          { id: 'uuid-1', _id: 'ing-1', name: 'Ing1' } as any,
          { id: 'uuid-2', _id: 'ing-2', name: 'Ing2' } as any
        ]
      }
    };

    const fulfilledAction = orderBurger.fulfilled(mockPayload, 'request-id', [
      'ing-1',
      'ing-2'
    ]);
    const newState = constructorReducer(initialState, fulfilledAction);

    expect(newState.orderModalData).toEqual(mockOrder);
    expect(newState.orderRequest).toBe(false);
    expect(newState.orderError).toBe('Old error');
    expect(newState.constructorItems.bun).toBeNull();
    expect(newState.constructorItems.ingredients).toEqual([]);
  });

  test('при вызове orderBurger.rejected с Error: error = message, orderRequest = false, остальные поля не меняются', () => {
    const initialState: IConstructorState = {
      ...getInitialState(),
      orderRequest: true,
      orderModalData: { _id: 'old-order' } as TOrder,
      constructorItems: {
        bun: { _id: 'bun-1', name: 'Bun' } as any,
        ingredients: [{ id: 'uuid-1', _id: 'ing-1', name: 'Ing' } as any]
      }
    };

    const rejectedAction = orderBurger.rejected(
      new Error('Error'),
      'request-id',
      []
    );
    const newState = constructorReducer(initialState, rejectedAction);

    expect(newState.orderError).toBe('Failed to place order');
    expect(newState.orderRequest).toBe(false);
    expect(newState.orderModalData).toEqual(initialState.orderModalData);
    expect(newState.constructorItems).toEqual(initialState.constructorItems);
  });
});

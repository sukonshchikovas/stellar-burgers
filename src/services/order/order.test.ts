import { expect, test, describe, jest, beforeEach } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import feedReducer, { clearCurrentOrder } from './slice';
import { fetchFeeds, fetchUserOrders, fetchOrderById } from './action';
import * as feedApi from '@api';
import * as cookieUtils from '../../utils/cookie';
import { TOrder } from '@utils-types';

describe('order test', () => {
  const mockOrder: TOrder = {
    _id: 'order-1',
    status: 'done',
    name: 'Бургер',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:35:00.000Z',
    number: 12345,
    ingredients: ['ing-1', 'ing-2']
  };

  const mockFeedsResponse = {
    success: true,
    orders: [mockOrder],
    total: 150,
    totalToday: 25
  };

  const mockOrders = [
    mockOrder,
    { ...mockOrder, _id: 'order-2', number: 12346 }
  ];

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('clearCurrentOrder сбрасывает currentOrder в null', () => {
    const initialState = feedReducer(undefined, { type: '@@INIT' });
    const newState = feedReducer(
      { ...initialState, currentOrder: mockOrder },
      clearCurrentOrder()
    );

    expect(newState.currentOrder).toBeNull();
  });

  describe('async thunk: fetchFeeds', () => {
    test('успешная загрузка ленты заказов', async () => {
      jest.spyOn(feedApi, 'getFeedsApi').mockResolvedValue(mockFeedsResponse);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      await store.dispatch(fetchFeeds());
      const state = store.getState().feed;

      expect(state.orders).toEqual(mockFeedsResponse.orders);
      expect(state.total).toBe(mockFeedsResponse.total);
      expect(state.totalToday).toBe(mockFeedsResponse.totalToday);
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);

      expect(feedApi.getFeedsApi).toHaveBeenCalledTimes(1);
    });

    test('ошибка при загрузке ленты заказов', async () => {
      jest
        .spyOn(feedApi, 'getFeedsApi')
        .mockRejectedValue(new Error('Network error'));

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      const result = await store.dispatch(fetchFeeds());
      const state = store.getState().feed;

      if (fetchFeeds.rejected.match(result)) {
        expect(result.payload).toBe('Network error');
      }

      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });

    test('устанавливает loading = true при начале запроса', async () => {
      let resolvePromise: (value: typeof mockFeedsResponse) => void;
      const pendingPromise = new Promise<typeof mockFeedsResponse>((res) => {
        resolvePromise = res;
      });

      jest.spyOn(feedApi, 'getFeedsApi').mockReturnValue(pendingPromise);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      store.dispatch(fetchFeeds());
      await Promise.resolve();

      const state = store.getState().feed;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      resolvePromise!(mockFeedsResponse);
    });
  });

  describe('async thunk: fetchUserOrders', () => {
    beforeEach(() => {
      jest.spyOn(cookieUtils, 'getCookie').mockReturnValue('mock-access-token');
    });

    test('успешная загрузка заказов пользователя', async () => {
      jest.spyOn(feedApi, 'getOrdersApi').mockResolvedValue(mockOrders);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      await store.dispatch(fetchUserOrders());
      const state = store.getState().feed;

      expect(state.orders).toEqual(mockOrders);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('ошибка при загрузке заказов пользователя', async () => {
      jest
        .spyOn(feedApi, 'getOrdersApi')
        .mockRejectedValue(new Error('Unauthorized'));

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      const result = await store.dispatch(fetchUserOrders());
      const state = store.getState().feed;

      if (fetchUserOrders.rejected.match(result)) {
        expect(result.payload).toBe('Unauthorized');
      }

      expect(state.error).toBe('Unauthorized');
      expect(state.loading).toBe(false);
    });

    test('устанавливает loading = true при начале запроса', async () => {
      let resolvePromise: (value: typeof mockOrders) => void;
      const pendingPromise = new Promise<typeof mockOrders>((res) => {
        resolvePromise = res;
      });

      jest.spyOn(feedApi, 'getOrdersApi').mockReturnValue(pendingPromise);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      store.dispatch(fetchUserOrders());

      await Promise.resolve();

      const state = store.getState().feed;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      resolvePromise!(mockOrders);
    });

    test('обрабатывает случай, когда API вернул success: false', async () => {
      jest.spyOn(feedApi, 'getOrdersApi').mockRejectedValue({
        success: false,
        message: 'Invalid token'
      });

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      const result = await store.dispatch(fetchUserOrders());

      expect(fetchUserOrders.rejected.match(result)).toBe(true);

      const state = store.getState().feed;
      expect(state.error).toBeTruthy();
      expect(state.loading).toBe(false);
    });
  });

  describe('async thunk: fetchOrderById', () => {
    const orderNumber = 12345;
    const mockOrderResponse = { success: true, orders: [mockOrder] };

    test('успешная загрузка заказа по номеру', async () => {
      jest
        .spyOn(feedApi, 'getOrderByNumberApi')
        .mockResolvedValue(mockOrderResponse);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      await store.dispatch(fetchOrderById(orderNumber));
      const state = store.getState().feed;

      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(feedApi.getOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
    });

    test('ошибка при загрузке заказа по номеру', async () => {
      jest
        .spyOn(feedApi, 'getOrderByNumberApi')
        .mockRejectedValue(new Error('Order not found'));

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      const result = await store.dispatch(fetchOrderById(orderNumber));
      const state = store.getState().feed;

      if (fetchOrderById.rejected.match(result)) {
        expect(result.payload).toBe('Order not found');
      }

      expect(state.error).toBe('Order not found');
      expect(state.loading).toBe(false);
    });

    test('устанавливает loading = true при начале запроса', async () => {
      let resolvePromise: (value: typeof mockOrderResponse) => void;
      const pendingPromise = new Promise<typeof mockOrderResponse>((res) => {
        resolvePromise = res;
      });

      jest
        .spyOn(feedApi, 'getOrderByNumberApi')
        .mockReturnValue(pendingPromise);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      store.dispatch(fetchOrderById(orderNumber));
      await Promise.resolve();

      const state = store.getState().feed;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.currentOrder).toBeNull();

      resolvePromise!(mockOrderResponse);
    });

    test('обрабатывает случай, когда API вернул success: false', async () => {
      jest.spyOn(feedApi, 'getOrderByNumberApi').mockResolvedValue({
        success: false,
        orders: []
      } as any);

      const store = configureStore({
        reducer: { feed: feedReducer }
      });

      await store.dispatch(fetchOrderById(orderNumber));

      const state = store.getState().feed;

      expect(state.currentOrder).toBeUndefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

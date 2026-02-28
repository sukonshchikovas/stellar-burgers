import { expect, test, describe, jest, beforeEach } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './slice';
import {
  getUser,
  loginUser,
  registerUser,
  updateUser,
  logoutUser
} from './action';
import { TUser } from '../../utils/types';
import * as api from '../../utils/burger-api';
import * as cookieUtils from '../../utils/cookie';

jest.mock('@api');
jest.mock('../../utils/cookie');

describe('auth slice', () => {
  const mockUser: TUser = {
    email: 'test@example.com',
    name: 'Тест Пользователь'
  };

  const mockApiResponse = {
    success: true,
    accessToken: 'access-123',
    refreshToken: 'refresh-456',
    user: mockUser
  };

  const mockStorage = () => {
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    } as unknown as Storage;
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    mockStorage();
  });

  test('logout сбрасывает user и isAuthenticated', () => {
    const initialState = {
      ...authReducer(undefined, { type: '@@INIT' }),
      user: mockUser,
      isAuthenticated: true
    };

    const action = logout();
    const newState = authReducer(initialState, action);

    expect(newState.user).toBeNull();
    expect(newState.isAuthenticated).toBe(false);
  });

  describe('async thunk: getUser', () => {
    test('успешное получение пользователя', async () => {
      jest.spyOn(api, 'getUserApi').mockResolvedValue({
        success: true,
        user: mockUser
      });

      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(getUser());
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    test('ошибка при получении пользователя', async () => {
      jest
        .spyOn(api, 'getUserApi')
        .mockRejectedValue(new Error('Token expired'));

      const store = configureStore({ reducer: { auth: authReducer } });
      const result = await store.dispatch(getUser());
      const state = store.getState().auth;

      if (getUser.rejected.match(result)) {
        expect(result.error.message).toBe('Token expired');
      }

      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(true);
      expect(state.user).toBeNull();
    });
  });

  describe('async thunk: registerUser', () => {
    const registerData = {
      email: 'new@example.com',
      name: 'Новый Пользователь',
      password: 'secure123'
    };

    test('успешная регистрация пользователя', async () => {
      jest.spyOn(api, 'registerUserApi').mockResolvedValue(mockApiResponse);
      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(registerUser(registerData));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(api.registerUserApi).toHaveBeenCalledWith(registerData);
    });
  });

  describe('async thunk: loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'secure123'
    };

    test('успешная авторизация пользователя', async () => {
      jest.spyOn(api, 'loginUserApi').mockResolvedValue(mockApiResponse);

      const setCookieSpy = jest
        .spyOn(cookieUtils, 'setCookie')
        .mockImplementation(() => {});

      const store = configureStore({ reducer: { auth: authReducer } });

      await store.dispatch(loginUser(loginData));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();

      expect(api.loginUserApi).toHaveBeenCalledTimes(1);
      expect(api.loginUserApi).toHaveBeenCalledWith(loginData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-456'
      );
      expect(setCookieSpy).toHaveBeenCalledWith(
        'accessToken',
        'access-token-123'
      );
    });

    test('ошибка при авторизации пользователя', async () => {
      jest
        .spyOn(api, 'loginUserApi')
        .mockRejectedValue(new Error('Invalid credentials'));

      const setCookieSpy = jest
        .spyOn(cookieUtils, 'setCookie')
        .mockImplementation(() => {});

      const store = configureStore({ reducer: { auth: authReducer } });

      const result = await store.dispatch(loginUser(loginData));
      const state = store.getState().auth;

      if (loginUser.rejected.match(result)) {
        expect(result.error.message).toBe('Invalid credentials');
      }
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(setCookieSpy).not.toHaveBeenCalled();

      expect(api.loginUserApi).toHaveBeenCalledTimes(1);
      expect(api.loginUserApi).toHaveBeenCalledWith(loginData);
    });
  });

  describe('async thunk: updateUser', () => {
    const updateData = {
      name: 'Обновлённое имя',
      email: 'updated@example.com'
    };

    const updatedUser: TUser = {
      name: 'Обновлённое имя',
      email: 'updated@example.com'
    };

    const mockApiResponse = {
      success: true,
      user: updatedUser
    };

    test('успешное обновление данных пользователя', async () => {
      jest.spyOn(api, 'updateUserApi').mockResolvedValue(mockApiResponse);

      const store = configureStore({ reducer: { auth: authReducer } });

      await store.dispatch(updateUser(updateData));
      const state = store.getState().auth;

      expect(state.user).toEqual(updatedUser);
      expect(api.updateUserApi).toHaveBeenCalledWith(updateData);
    });

    test('ошибка при обновлении данных пользователя', async () => {
      jest
        .spyOn(api, 'updateUserApi')
        .mockRejectedValue(new Error('Update failed'));

      const store = configureStore({ reducer: { auth: authReducer } });

      // 🔹 Предварительно устанавливаем пользователя в стейт (чтобы проверить, что он не изменился при ошибке)
      const initialState = {
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
        error: null
      };
      const storeWithUser = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: initialState }
      });

      const result = await storeWithUser.dispatch(updateUser(updateData));
      const state = storeWithUser.getState().auth;

      if (updateUser.rejected.match(result)) {
        expect(result.error.message).toBe('Update failed');
      }

      expect(state.user).toEqual(mockUser);
      expect(api.updateUserApi).toHaveBeenCalledWith(updateData);
    });

    test('обновляет только переданные поля пользователя', async () => {
      const partialData = { name: 'Только имя' };
      const partialUser = { ...mockUser, ...partialData };

      jest.spyOn(api, 'updateUserApi').mockResolvedValue({
        success: true,
        user: partialUser
      });

      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(updateUser(partialData));
      const state = store.getState().auth;

      expect(state.user).toEqual(partialUser);
      expect(state.user?.name).toBe('Только имя');

      expect(api.updateUserApi).toHaveBeenCalledWith(partialData);
    });
  });

  describe('async thunk: logoutUser', () => {
    test('успешный выход из системы', async () => {
      jest.spyOn(api, 'logoutApi').mockResolvedValue({ success: true });

      const deleteCookieSpy = jest
        .spyOn(cookieUtils, 'deleteCookie')
        .mockImplementation(() => {});

      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: mockUser,
            isAuthenticated: true,
            isAuthChecked: true,
            error: null
          }
        }
      });

      await store.dispatch(logoutUser());
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();

      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(deleteCookieSpy).toHaveBeenCalledWith('accessToken');
    });

    test('ошибка при выходе из системы', async () => {
      jest
        .spyOn(api, 'logoutApi')
        .mockRejectedValue(new Error('Logout failed'));

      const deleteCookieSpy = jest
        .spyOn(cookieUtils, 'deleteCookie')
        .mockImplementation(() => {});

      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: mockUser,
            isAuthenticated: true,
            isAuthChecked: true,
            error: null
          }
        }
      });

      const result = await store.dispatch(logoutUser());
      const state = store.getState().auth;

      if (logoutUser.rejected.match(result)) {
        expect(result.error.message).toBe('Logout failed');
      }

      expect(state.user).toEqual(mockUser);

      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});

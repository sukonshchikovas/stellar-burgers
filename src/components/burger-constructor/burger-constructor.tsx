import { FC, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { RootState, useDispatch, useSelector } from '../../services/store';

import {
  removeIngredient,
  moveIngredient,
  orderBurger,
  closeOrderModal,
  resetConstructor
} from '../../services/burger-constructor/slice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { constructorItems, orderRequest, orderModalData } = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  // Получаем пользователя из auth-слайса
  const user = useSelector((state: RootState) => state.auth.user);

  const onOrderClick = () => {
    // Если нет булки или запрос уже в процессе — ничего не делаем
    if (!constructorItems.bun || orderRequest) return;

    // Проверка авторизации
    if (!user) {
      // Перенаправляем на логин, сохраняя текущую локацию для возврата
      navigate('/login', { state: { from: location } });
      return;
    }

    // Формируем массив ID ингредиентов для заказа: [bun, ...ingredients, bun]
    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map(
        (item: TConstructorIngredient) => item._id
      ),
      constructorItems.bun._id
    ];

    dispatch(orderBurger(ingredientIds));
  };

  const handleCloseModal = () => {
    dispatch(closeOrderModal());
    dispatch(resetConstructor());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={handleCloseModal}
    />
  );
};

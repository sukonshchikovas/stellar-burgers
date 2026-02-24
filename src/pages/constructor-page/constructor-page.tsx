import { useSelector, useDispatch } from '../../services/store';
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './constructor-page.module.css';
import { BurgerIngredients, BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';
import { FC } from 'react';
import { orderBurger } from '../../services/burger-constructor/action';

export const ConstructorPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const ingredientsState = useSelector((state) => state.ingredients);
  const isIngredientsLoading = ingredientsState.loading;

  const { bun, ingredients: constructorIngredients } = useSelector(
    (state) => state.burgerConstructor.constructorItems
  );

  const user = useSelector((state) => state.auth.user);

  // Собираем массив _id ингредиентов для заказа
  const ingredientsIds = [
    bun?._id,
    ...constructorIngredients.map((item) => item._id),
    bun?._id
  ].filter(Boolean) as string[];

  if (isIngredientsLoading) {
    return (
      <main className={styles.containerMain}>
        <Preloader />
      </main>
    );
  }

  return (
    <>
      <main className={styles.containerMain}>
        <h1
          className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
        >
          Соберите бургер
        </h1>
        <div className={`${styles.main} pl-5 pr-5`}>
          <BurgerIngredients />
          <BurgerConstructor />
        </div>
      </main>
    </>
  );
};

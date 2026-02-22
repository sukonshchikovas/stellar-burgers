import { forwardRef, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { TIngredientsCategoryProps } from './type';
import { TIngredient } from '@utils-types';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { addIngredient, setBun } from '../../services/burger-constructor/slice';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  const dispatch = useDispatch();

  const { bun, ingredients: constructorItems } = useSelector(
    (state) => state.burgerConstructor.constructorItems
  );

  const handleAddIngredient = (ingredient: TIngredient) => {
    if (ingredient.type === 'bun') {
      dispatch(setBun(ingredient));
    } else {
      dispatch(addIngredient({ ...ingredient, id: ingredient._id }));
    }
  };

  const ingredientsCounters = useMemo(() => {
    const counters: { [key: string]: number } = {};
    constructorItems.forEach((item: TIngredient) => {
      counters[item._id] = (counters[item._id] || 0) + 1;
    });
    if (bun) counters[bun._id] = 2;
    return counters;
  }, [bun, constructorItems]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
      onAddIngredient={handleAddIngredient}
    />
  );
});

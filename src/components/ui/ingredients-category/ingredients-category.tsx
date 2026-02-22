import styles from './ingredients-category.module.css';
import { forwardRef } from 'react';
import { TIngredientsCategoryUIProps } from './type';
import { BurgerIngredient } from '@components';
import { TIngredient } from '@utils-types';

export const IngredientsCategoryUI = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryUIProps & {
    onAddIngredient?: (ingredient: TIngredient) => void;
  }
>(
  (
    { title, titleRef, ingredients, ingredientsCounters, onAddIngredient },
    ref
  ) => (
    <>
      <h3 className='text text_type_main-medium mt-10 mb-6' ref={titleRef}>
        {title}
      </h3>
      <ul className={styles.items} ref={ref}>
        {ingredients.map((ingredient) => (
          <BurgerIngredient
            ingredient={ingredient}
            key={ingredient._id}
            count={ingredientsCounters?.[ingredient._id]}
            handleAdd={() => onAddIngredient?.(ingredient)}
          />
        ))}
      </ul>
    </>
  )
);

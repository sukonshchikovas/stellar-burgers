import { FC, memo } from 'react';
import { useDispatch } from '../../services/store';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';

import {
  moveIngredient,
  removeIngredient
} from '../../services/burger-constructor/slice';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient, index, totalItems, dataCy, dataId }) => {
    const dispatch = useDispatch();

    const handleMoveUp = () => {
      dispatch(moveIngredient({ index, direction: 'up' }));
    };

    const handleMoveDown = () => {
      dispatch(moveIngredient({ index, direction: 'down' }));
    };

    const handleClose = () => {
      dispatch(removeIngredient(ingredient.id));
    };

    return (
      <BurgerConstructorElementUI
        ingredient={ingredient}
        index={index}
        totalItems={totalItems}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleClose={handleClose}
        dataCy={dataCy}
        dataId={dataId}
      />
    );
  }
);

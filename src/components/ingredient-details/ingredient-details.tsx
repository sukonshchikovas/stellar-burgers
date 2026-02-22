import { FC, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useDispatch, useSelector } from '../../services/store';
import { useParams } from 'react-router-dom';

export const IngredientDetails: FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const { items: ingredients, ingredientModalData } = useSelector(
    (state) => state.ingredients
  );
  /** TODO: взять переменную из стора */
  //const ingredientData = null;
  const ingredientData =
    ingredientModalData || ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};

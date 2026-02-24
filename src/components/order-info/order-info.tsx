import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { fetchOrderById } from '../../services/order/action';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const { orders, ingredients } = useSelector((state) => ({
    orders: state.feed.orders,
    ingredients: state.ingredients.items
  }));

  const { loading, currentOrder } = useSelector((state) => state.feed);

  const orderData = useMemo(() => {
    if (!number) return null;
    return orders.find((order) => order.number === Number(number));
  }, [number, orders]);

  useEffect(() => {
    const orderId = number ? Number(number) : null;
    if (
      orderId &&
      (!currentOrder || currentOrder.number !== orderId) &&
      !loading
    ) {
      dispatch(fetchOrderById(orderId));
    }
  }, [number, currentOrder, loading, dispatch]);

  const orderInfo = useMemo(() => {
    const activeOrder = currentOrder || orderData;

    if (!activeOrder || !ingredients.length) return null;

    const date = new Date(activeOrder.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = activeOrder.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...activeOrder,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, currentOrder, ingredients]);

  if (!orderInfo || loading) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};

import { FC, useMemo } from 'react';
import { useSelector } from '../../services/store';
import { FeedInfoUI } from '@ui';

export const FeedInfo: FC = () => {
  const { orders, total, totalToday } = useSelector((state) => state.feed);

  // Вычисляем списки номеров заказов
  const { readyOrders, pendingOrders } = useMemo(() => {
    const ready = orders
      .filter((order) => order.status === 'done')
      .slice(0, 20)
      .map((order) => order.number);

    const pending = orders
      .filter((order) => order.status === 'pending')
      .slice(0, 20)
      .map((order) => order.number);

    return { readyOrders: ready, pendingOrders: pending };
  }, [orders]);

  const feed = { total, totalToday };

  return (
    <FeedInfoUI
      feed={feed}
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
    />
  );
};

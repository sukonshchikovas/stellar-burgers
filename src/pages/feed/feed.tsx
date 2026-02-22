import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeeds } from '../../services/order/action';

export const Feed: FC = () => {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  // Обработчик обновления
  const handleGetFeeds = () => {
    dispatch(fetchFeeds());
  };

  if (loading) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};

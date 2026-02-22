import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { fetchUserOrders } from '../../services/order/action';
import { useDispatch, useSelector } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth/action';

export const ProfileOrders: FC = () => {
  /** TODO: взять переменную из стора */
  //const orders: TOrder[] = [];
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} isLoading={loading} />;
};

import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';

export const AppHeader: FC = () => {
  // Получаем имя пользователя из Redux
  const userName = useSelector((state) => state.auth.user?.name);

  return <AppHeaderUI userName={userName} />;
};

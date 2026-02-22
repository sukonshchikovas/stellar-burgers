import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactNode;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const location = useLocation();
  const { isAuthChecked, user } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth) {
    return user ? (
      <Navigate replace to='/' state={{ from: location }} />
    ) : (
      children
    );
  }

  return user ? (
    children
  ) : (
    <Navigate replace to='/login' state={{ from: location }} />
  );
};

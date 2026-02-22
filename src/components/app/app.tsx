import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { useEffect } from 'react';
import { Preloader } from '@ui';

import { fetchIngredients } from '../../services/ingredients/action';
import { useDispatch } from '../../services/store';
import { getUser } from '../../services/auth/action';
import { ProtectedRoute } from '../protected-route/protected-route';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const backgroundLocation = location.state?.background;

  useEffect(() => {
    dispatch(fetchIngredients());
    dispatch(getUser());
  }, [dispatch]);

  const handleCloseModal = () => {
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={backgroundLocation || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />

        <Route
          path='/login'
          element={<ProtectedRoute onlyUnAuth children={<Login />} />}
        />
        <Route
          path='/register'
          element={<ProtectedRoute onlyUnAuth children={<Register />} />}
        />
        <Route
          path='/forgot-password'
          element={<ProtectedRoute onlyUnAuth children={<ForgotPassword />} />}
        />
        <Route
          path='/reset-password'
          element={<ProtectedRoute onlyUnAuth children={<ResetPassword />} />}
        />

        <Route
          path='/profile'
          element={<ProtectedRoute children={<Profile />} />}
        />
        <Route
          path='/profile/orders'
          element={<ProtectedRoute children={<ProfileOrders />} />}
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route
            path='/feed/:number'
            element={
              <Modal title='' onClose={handleCloseModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='' onClose={handleCloseModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <Modal title='' onClose={handleCloseModal}>
                <OrderInfo />
              </Modal>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;

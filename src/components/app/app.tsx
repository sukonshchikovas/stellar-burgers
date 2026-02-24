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
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useMatch
} from 'react-router-dom';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { useEffect } from 'react';

import { fetchIngredients } from '../../services/ingredients/action';
import { useDispatch } from '../../services/store';
import { getUser } from '../../services/auth/action';
import { ProtectedRoute } from '../protected-route/protected-route';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const backgroundLocation = location.state?.background;

  const feedOrderMatch = useMatch('/feed/:number');
  const profileOrderMatch = useMatch('/profile/orders/:number');
  const ingredientMatch = useMatch('/ingredients/:id');

  const feedOrderNumber = feedOrderMatch?.params?.number;
  const profileOrderNumber = profileOrderMatch?.params?.number;

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
          path='/feed/:number'
          element={
            <div className={`${styles.detailPageWrap}`}>
              <p
                className={`text text_type_main-medium ${styles.detailHeader}`}
              >
                #{feedOrderNumber}
              </p>
              <OrderInfo />
            </div>
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            <div className={`${styles.detailPageWrap}`}>
              <h2
                className={`text text_type_main-large ${styles.detailHeader}`}
              >
                Детали ингредиента
              </h2>
              <IngredientDetails />
            </div>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <div className={`${styles.detailPageWrap}`}>
              <p
                className={`text text_type_main-medium ${styles.detailHeader}`}
              >
                #{profileOrderNumber}
              </p>
              <OrderInfo />
            </div>
          }
        />
        <Route
          path='/login'
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route
            path='/feed/:number'
            element={
              <Modal title={`#${feedOrderNumber}`} onClose={handleCloseModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={handleCloseModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <Modal
                title={`#${profileOrderNumber}`}
                onClose={handleCloseModal}
              >
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

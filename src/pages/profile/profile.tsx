import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { TUser } from '@utils-types';
import { updateUser } from '../../services/auth/action';

export const Profile: FC = () => {
  /** TODO: взять переменную из стора */
  // const user = {
  //   name: '',
  //   email: ''
  // };
  const dispatch = useDispatch();

  const user: TUser | null = useSelector((state) => state.auth.user);
  const isInitialized = useRef(false);
  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    if (user && !isInitialized.current) {
      setFormValue((prevState) => ({
        ...prevState,
        name: user?.name || '',
        email: user?.email || ''
      }));
      isInitialized.current = true;
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const updateData: Partial<TUser & { password?: string }> = {};
    if (formValue.name !== user?.name) updateData.name = formValue.name;
    if (formValue.email !== user?.email) updateData.email = formValue.email;
    if (formValue.password) updateData.password = formValue.password;

    dispatch(updateUser(updateData))
      .unwrap()
      .then(() => {
        setFormValue((prev) => ({ ...prev, password: '' }));
      })
      .catch((err) => console.error(err));
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );

  //return null;
};

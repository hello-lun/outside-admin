import { logout } from '@/service/auth';
import { catchError } from './helper';

export const doLogout = async () => {
  const [err] = await catchError(logout());
  if (!err) {
    localStorage.setItem('userInfo', JSON.stringify(''));
    window.location.href = '/login';
  }
};

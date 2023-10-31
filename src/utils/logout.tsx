import { logout } from '@/service/auth';
import { catchError } from './helper';
import { useUserStore } from '@/store/user';

export const doLogout = async () => {
  const [err] = await catchError(logout());
  const removeUser = useUserStore.use.removeUser();

  if (!err) {
    removeUser();
    window.location.href = '/login';
  }
};

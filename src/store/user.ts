import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';
import { localStorageSetter, localStorageGetter } from '@/utils/helper';
import { IUserInfo } from '@/service/auth';

interface IUser {
  user: IUserInfo,
  updateUser: (data: IUserInfo) => void,
  removeUser: () => void,
  updateUserName: (username: string) => void,
}

const defaultUserData: () => IUserInfo = () => ({
  authorization: '',
  currentUser: {
    avatar: '',
    email: '',
    id: 0,
    phonenumber: '',
    status: '',
    username: '',
  },
  menuList: [],
  perms: [],
});

const initUserData = () => {
  const localUserData = localStorageGetter('system_data');
  if (localUserData) {
    return localUserData;
  } else {
    return defaultUserData();
  }
}

export const useUserStore = createSelectors(create<IUser>()(
  immer(
    (set) => ({
      user: initUserData(),
      updateUser: (data: IUserInfo) => set((state) => {
        localStorageSetter('system_data', data);
        state.user = data;
      }),
      removeUser: () => set((state) => {
        localStorageSetter('system_data', {});
        localStorageSetter('system_menuList', []);
        state.user = defaultUserData();
      }),
      updateUserName: (username: string) => set((state) => {
        // state.user.username = username;
      }),
    }),
  )
));


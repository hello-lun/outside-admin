import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';
import { localStorageSetter, localStorageGetter } from '@/utils/helper';
import { IUserInfo } from '@/service/auth';

interface IUser {
  user: IUserInfo,
  updateUser: (data: any) => void,
  removeUser: () => void,
  updateUserName: (username: string) => void,
}

const defaultUserData: () => IUserInfo = () => ({
  authorization: '',
  refreshToken: '',
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
      updateUser: (data: any) => set((state) => {
        const temp = {
          ...state.user ,
          ...data
        };
        localStorageSetter('system_data', temp);
        state.user = temp;
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


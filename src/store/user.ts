import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';

interface IUserData {
  id?: number
  authorization: string,
  currentUser: {
    username: string
  },
  menuList: Array<object>,
  perms: Array<object>
}

interface IUser {
  user: IUserData,
  updateUser: (data: IUserData) => void,
  removeUser: () => void,
  updateUserName: (username: string) => void,
}

export const useUserStore = createSelectors(create<IUser>()(
  immer(
    persist(
      (set) => ({
        user: {
          authorization: '',
          currentUser: {
            username: ''
          },
          menuList: [],
          perms: []
        },
        updateUser: (data: IUserData) => set((state) => {
          localStorage.setItem('system_data', JSON.stringify(data));
          state.user = data;
        }),
        removeUser: () => set((state) => {
          localStorage.setItem('system_data', '');
          state.user = {
            authorization: '',
            currentUser: {
              username: ''
            },
            menuList: [],
            perms: []
          };
        }),
        updateUserName: (username: string) => set((state) => {
          // state.user.username = username;
        }),
      }),
      {
        name: 'user_data',
        getStorage: () => localStorage,
        partialize: (state) => ({
          userData: state.user
        })
      }
    ))
));


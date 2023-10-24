import { UPDATE_USER, UPDATE_USRENAME, REMOVE_USER } from '../../constant';

// type ICatchFn<N> = Promise<N>;

export const setUserInfo = (data: any) => ({
  type: UPDATE_USER,
  userInfo: data
});

export const removeUserInfo = (data: any) => ({
  type: REMOVE_USER,
  userInfo: data
});


export const setUsername = (username: string) => ({
  type: UPDATE_USRENAME,
  username,
});
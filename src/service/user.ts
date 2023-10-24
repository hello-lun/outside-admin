
import http from '../utils/http';

export interface IUserInfo {
  username?: string;
  email?: string;
  phone?: string;
}

export const getUserInfo = (data: IUserInfo) => {
  return http<IUserInfo>({
    method: 'get',
    url: '/user/getUserInfo',
    data
  },);
};


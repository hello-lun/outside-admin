
import http from '../utils/http';

export interface IUserInfo {
  username: string;
  password: string;
  phone: string;
}

export const login = (data: IUserInfo) => {
  return http<IUserInfo>({
    method: 'post',
    url: '/login', 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data 
  });
};


export const logout = () => {
  return http<IUserInfo>({
    method: 'post',
    url: '/logout', 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });
};


export const translate = (data?: any) => {
  return http<any>({method: 'post', url: '/translate', data });
};

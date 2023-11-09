
import http from '../utils/http';

export interface IMenuList {
  path: string;
  component: string;
  children: IMenuList[];
  name: string;
  icon: string;
}

export interface IUserInfo {
  authorization: string;
  currentUser: {
    avatar: string,
    email: string,
    id: number,
    phonenumber: string,
    status: string,
    username: string,
  };
  menuList: IMenuList[];
  perms: any[];
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

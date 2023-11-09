import http from '../utils/http';

export interface IGetGoods {

}

export const getStaff = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/staff/get', data });
};

export const deleteStaff = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/staff/delete', data });
}


export const editStaff = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/staff/edit', data });
}


export const addStaff = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/staff/add', data });
}






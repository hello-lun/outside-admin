import http from '../utils/http';

export interface IGetGoods {

}

export const getGoods = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/goods/get', data });
};

export const deleteGoods = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/goods/delete', data });
}


export const editGoods = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/goods/edit', data });
}


export const addGoods = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/goods/add', data });
}

export const batchAddGoods = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/goods/batch-add', data });
}





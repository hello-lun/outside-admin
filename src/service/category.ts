import http from '../utils/http';

export interface IGetGoods {

}

export const getCategory = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/category/get', data });
};

export const deleteCategory = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/category/delete', data });
}


export const editCategory = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/category/edit', data });
}


export const addCategory = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/category/add', data });
}






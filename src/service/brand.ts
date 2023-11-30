import http from '../utils/http';

export interface IGetGoods {

}

export const getBrand = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/brand/get', data });
};

export const deleteBrand = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/brand/delete', data });
}


export const editBrand = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/brand/edit', data });
}


export const addBrand = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/brand/add', data });
}






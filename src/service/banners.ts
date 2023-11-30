import http from '../utils/http';

export interface IGetGoods {

}

export const getBanners = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/banners/get', data });
};

export const deleteBanners = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/banners/delete', data });
}


export const editBanners = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/banners/edit', data });
}


export const addBanners = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/banners/add', data });
}






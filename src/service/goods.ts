import http from '../utils/http';

export interface IGetGoods {
  title: string;
  subTitle: string;
  detail: string;
  tag: string;
  important: number;
  image: string;
}

export const getGoods = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/goods', data });
};


export const addGoods = (data: IGetGoods) => {
  return http<IGetGoods>({method: 'post', url: '/add-goods', data });
}

export const translate = (data?: any) => {
  return http<IGetGoods>({method: 'post', url: '/translate', data });
};




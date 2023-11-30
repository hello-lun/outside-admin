import http from '../utils/http';

export interface IGetGoods {

}

export const queryOpenai = (data?: IGetGoods) => {
  return http<IGetGoods>({method: 'get', url: '/openai', data });
};








import http from '../utils/http';

export const insertMilk = (data?: any) => {
  return http<any>({method: 'post', url: '/milk/add', data });
};

export const addGoodsOrder = (data?: any) => {
  return http<any>({method: 'post', url: '/milk/addGoodsOrder', data });
};

export const editGoodsOrder = (data?: any) => {
  return http<any>({method: 'post', url: '/milk/editGoodsOrder', data });
};

export const getAllGoodsOrder = (data?: any) => {
  return http<any>({method: 'get', url: '/milk/getAllGoodsOrder', data });
};

export const getAllGoodsOrder1 = (data?: any) => {
  return http<any>({method: 'get', url: '/milk/getAllGoodsOrder2', data });
};

export const getAllMilk = (data?: any) => {
  return http<any>({method: 'get', url: '/milk/getAllMilk', data });
};


export const deleteMilk = (data?: any) => {
  return http<any>({method: 'get', url: '/milk/deleteMilk', data });
};

export const removeGoodsOrder = (data?: any) => {
  return http<any>({method: 'get', url: '/milk/removeGoodsOrder', data });
};
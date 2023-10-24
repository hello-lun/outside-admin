
import http from '../utils/http';

export const translate = (data?: any) => {
  return http<any>({method: 'post', url: '/translate', data });
};


export const saveArtical = (data?: any) => {
  return http<any>({method: 'post', url: '/user/saveArtical', data });
};


export const getNovel = (data?: any) => {
  return http<any>({method: 'get', url: '/user/getNovel', data });
};

export const translatePDF = (data?: any) => {
  return http<any>({method: 'get', url: '/user/getPDF', data });
};


export const getArticals = (data?: any) => {
  return http<any>({method: 'get', url: '/user/getArtical', data });
};


export const getPDFMarkDetail = <T>(data?: T) => {
  return http<T>({method: 'get', url: '/user/getPDFMarkDetail', data });
};



export const savePDFDetail = (data: any) => {
  return http<any>({
    method: 'post',
    url: '/user/savePDFDetail',
    data
  });
};
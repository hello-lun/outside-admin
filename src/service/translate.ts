
import http from '../utils/http';

export const translate = (data?: any) => {
  return http<any>({method: 'post', url: '/translate', data });
};


export const saveArtical = (data?: any) => {
  return http<any>({method: 'post', url: '/article/saveArtical', data });
};


export const getNovel = (data?: any) => {
  return http<any>({method: 'get', url: '/article/getNovel', data });
};

export const translatePDF = (data?: any) => {
  return http<any>({method: 'get', url: '/article/getPDF', data });
};


export const getArticals = (data?: any) => {
  return http<any>({method: 'get', url: '/article/getArtical', data });
};


export const getPDFMarkDetail = <T>(data?: T) => {
  return http<T>({method: 'get', url: '/article/getPDFMarkDetail', data });
};



export const savePDFDetail = (data: any) => {
  return http<any>({
    method: 'post',
    url: '/article/savePDFDetail',
    data
  });
};
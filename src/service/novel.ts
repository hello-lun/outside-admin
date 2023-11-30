
import http from '../utils/http';

export const updateNovelMark = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/saveNovelMark', data });
};


export const getNovelMark = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/getNovelMark', data });
};

export const addNewWord = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/sava-word', data });
};

export const editNewWord = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/edit-word', data });
};

export const getNewWord = (data?: any) => {
  return http<any>({method: 'get', url: '/novel/get-word', data });
};
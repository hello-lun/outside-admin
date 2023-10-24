
import http from '../utils/http';

export const updateNovelMark = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/saveNovelMark', data });
};


export const getNovelMark = (data?: any) => {
  return http<any>({method: 'post', url: '/novel/getNovelMark', data });
};
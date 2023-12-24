import axios, {
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { useUserStore } from '@/store/user';
import { localStorageGetter } from '@/utils/helper';
import { getRefreshToken } from '@/service/auth';

axios.defaults.baseURL = process.env.REACT_APP_API_URL + '/req';
axios.defaults.headers.head['Content-Type'] = 'application/json;chartset=utf-8';
axios.defaults.timeout = 1000 * 60;

export interface IResponse<T = any> {
  code: number;
  message: string;
  data: T
}

let refreshTokenRquesting = false;

const axiosInstance: AxiosInstance = axios.create({
  timeout: 10000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if(config.headers) {
      const userData = useUserStore.getState();
      const authorization = userData.user.authorization ? userData.user.authorization : localStorageGetter('system_data', 'authorization');
      (config.headers as Record<string, string>)['token'] = authorization;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const { data } = res;
    if (data.code === 500) {
      return Promise.reject(data);
    }
    return data.data;
  },
  async (err) => {
    const {
      response: { status, data }
    } = err;
    const originalRequest = err.config;
    if (status === 401 || status === 403) {
      if (!refreshTokenRquesting) {
        refreshTokenRquesting = true;
        const userData = useUserStore.getState();
        try {
          const res = await getRefreshToken({
            refreshToken: userData.user.refreshToken ? userData.user.refreshToken : localStorageGetter('system_data', 'refreshToken')
          });
          useUserStore.getState().updateUser({authorization: res});
        } catch(e) {
          return Promise.reject(e);
        } finally {
          refreshTokenRquesting = false;
        }
      }
      return http(originalRequest);
    }
    // 当status为400时，刷新token也过期后，跳转登陆页面
    if (status === 410) {
      useUserStore.getState().removeUser();
      window.location.href = '/login';
    }
    return Promise.reject(err.response.data);
  }
);

const http = <T>(configs: AxiosRequestConfig): Promise<T> => {
  const { method } = configs;
  if (method === 'get') {
    configs.params = configs.data;
    delete configs.data;
  }

  return axiosInstance.request(configs);
};

export default http;

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';
import { getAllRouters, filterRootChilds, formatChildren, conbindRouters } from '@/router/helper';
import { formatRouterCom } from '@/router/routerMap';
import { localStorageSetter } from '@/utils/helper';
import { IRouteObject, staticRouterConfigs } from '@/router/configs';
import { IMenuList } from '@/service/auth';

interface IRouter {
  routers: IRouteObject[],
  addRoute: (data: IMenuList[] | IMenuList) => void,
  removeRouter: () => void,
}

export const useRouterStore = createSelectors(create<IRouter>()(
  (set) => ({
    routers: getAllRouters(),
    addRoute: (data: IMenuList[] | IMenuList) => set((state) => {
      const others = conbindRouters(data, state.routers);
      return {
        routers: [...state.routers, ...others]
      };
    }),
    removeRouter: () => set((state) => {
      return {
        routers: [...staticRouterConfigs()]
      };
    })
  })
));


import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';
import { getAllRouters } from '@/router/configs';
import { formatRouterCom } from '@/router/routerMap';

interface IRouter {
  routers: any,
  addRoute: (data: any) => void
}

export const useRouterStore = createSelectors(create<IRouter>()(
  immer(
    (set) => ({
      routers: getAllRouters(),
      addRoute: (data: any) => set((state: any) => {
        if (!data) return;
        if (data instanceof Array) {
          const dymRouters = data.map((item: any) => {
            return {
              path: item.path,
              element: formatRouterCom(item.element),
              children: item.children,
            };
          });
          state.routers.push(...dymRouters);
        } else {
          state.routers.push({
            ...data,
            element: formatRouterCom(data.element),
          });
        }
      }),
    })
    )
));


import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/utils/helper';
import routerConfigs from '@/routers/configs';

interface IRouter {
  routers: any,
  addRoute: (data: any) => void
}

export const useRouterStore = createSelectors(create<IRouter>()(
  immer(
    (set) => ({
      routers: routerConfigs,
      addRoute: (data: any) => set((state: any) => {
        if (!data) return;
        if (data instanceof Array) {
          state.routers.push(...data);
        } else {
          state.routers.push(data);
        }
      }),
    })
    )
));


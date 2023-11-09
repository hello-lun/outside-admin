import {staticRouterConfigs} from './configs';
import { Outlet } from 'react-router-dom';
import { formatRouterCom } from '@/router/routerMap';
import { IRouteObject } from '@/router/configs';
import { IMenuList } from '@/service/auth';
import { localStorageSetter, localStorageGetter } from '@/utils/helper';
import { cloneDeep } from 'lodash-es';

const ignoreFlag = ['sys', 'business'];

export const formatChildren = (menus: IMenuList[]) => {
  const tempChildrens = cloneDeep(menus);
  tempChildrens?.forEach((item: any) => {
    // item.dynamic = true;
    if (item.component) item.element = formatRouterCom(item.component);
    else item.element = <Outlet />;
    if (item.children) item.children = formatChildren(item.children);
  });

  return tempChildrens;
}

export const dealDymRouter = (data?: IMenuList[] | IMenuList) => {
  let dymRouters: any[] = [];
  if (data instanceof Array) {
    dymRouters = data.filter((item) => !ignoreFlag.includes(item.component)) || [];
  } else if (Object.prototype.toString.call(data) === '[object Object]') {
    dymRouters = [data];
  }

  const menuList = [...localStorageGetter('system_menuList'), ...dymRouters];
  menuList.length > 0 && localStorageSetter('system_menuList', menuList);
  return menuList;
}

export const filterRootChilds = (list: IMenuList[]) => {
  const rootChilds: IMenuList[] = [];
  const others: IMenuList[] = [];
  list.forEach((item: IMenuList) => {
    if (item.path !== '/others') {
      rootChilds.push(item);
    } else {
      others.push(item);
    }
  });

  return [rootChilds, others];
}

export const conbindRouters = (dynConfigs: IMenuList[] | IMenuList, staticConfigs: IRouteObject[]) => {
  const menuList = formatChildren(dealDymRouter(dynConfigs));
  const [rootChilds, others] = filterRootChilds(menuList);
  const root = staticConfigs.find((item: IRouteObject) => item.path === '/');
  // @ts-ignore
  root?.children?.push(...rootChilds);

  return others;
}

export const getAllRouters = () => {
  const staticRouter = staticRouterConfigs();
  const others = conbindRouters([], staticRouter);
  return staticRouter.concat(others);
}


import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteObject, useNavigate } from 'react-router-dom';
import lazyWrapper from '../components/lazyWrapper';
import AuthWrapper from './authWrapper';

const About = lazy(() => import('../pages/about'));
const Hello = lazy(() => import('../pages/hello'));
const Home = lazy(() => import('../pages/home'));
const Login = lazy(() => import('../pages/login/login'));
const Register = lazy(() => import('../pages/register/register'));
const Test = lazy(() => import('../pages/test/test'));
const Word = lazy(() => import('../pages/word/word'));
const Artical = lazy(() => import('../pages/artical/artical'));
const Novel = lazy(() => import('../pages/novel/novel'));
const Milk = lazy(() => import('../pages/milk/milk'));
const GoodsCount = lazy(() => import('../pages/goodsCount/goodsCount'));

// interface IPageItem {
//     path: string;
//     element: any;
// };

type IRouteObject = RouteObject & {
  auth?: boolean;
};

const routerConfigs: Array<IRouteObject> = [
  {
    path: '/',
    element: lazyWrapper(<Home />),
    auth: false,
    children: [
      {
        path: '/home',
        // element: <MainContent />,
        children: []
      },
      {
        path: '/about',
        element: lazyWrapper(<About id='121' name='sds' />),
        children: [
          {
            path: 'hello',
            element: <p style={{ background: 'orange', height: '100%' }}>我是二级hello嵌套理由</p>
          }
        ]
      },
      {
        path: '/hello',
        element: lazyWrapper(<Hello />)
      }
    ]
  },
  {
    path: '/login',
    element: lazyWrapper(<Login />),
    children: [],
    auth: false
  },
  {
    path: '/register',
    element: lazyWrapper(<Register />),
    children: [],
    auth: false
  },
  {
    path: '/test',
    element: lazyWrapper(<Test />),
    children: [],
    auth: false
  },
  {
    path: '/milk',
    element: lazyWrapper(<Milk />),
    children: [],
    auth: false
  },
  {
    path: '/word',
    element: lazyWrapper(<Word />),
    children: [],
    auth: false
  },
  {
    path: '/goodsCount',
    element: lazyWrapper(<GoodsCount />),
    children: [],
    auth: false
  },
  {
    path: '/novel',
    element: lazyWrapper(<Novel />),
    children: [],
    auth: false
  },
  {
    path: '/artical',
    element: lazyWrapper(<Artical />),
    children: [],
    auth: false
  }
];

const tramsformAuthRoute = (configs: IRouteObject[]) => {
  configs.forEach(conf => {
    if (conf.auth) {
      conf.element = <AuthWrapper component={conf.element}></AuthWrapper>;
      if (conf.children && conf.children.length > 0) {
        tramsformAuthRoute(conf.children);
      }
    }
  });

  return configs;
};

export default tramsformAuthRoute(routerConfigs);

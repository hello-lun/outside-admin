import React, { lazy, useEffect, useState } from 'react';
import { RouteObject, RouteProps } from 'react-router-dom';
import lazyWrapper from '../components/lazyWrapper';
import AuthWrapper from './authWrapper';

const Home = () => import('../pages/home');
const Login = () => import('../pages/login/login');
const Register = () => import('../pages/register/register');
const Test = () => import('../pages/test/test');

// interface IPageItem {
//     path: string;
//     element: any;
// };

type IRouteObject = RouteObject & {
  auth?: boolean;
};

const routerConfigs: Array<RouteProps> = [
  {
    path: '/',
    element: lazyWrapper(Home),
    children: []
  },
  {
    path: '/login',
    element: lazyWrapper(Login),
    children: [],
  },
  {
    path: '/register',
    element: lazyWrapper(Register),
    children: [],
  },
  {
    path: '/test',
    element: lazyWrapper(Test),
    children: [],
  },
  {
    path: '*',
    element: <h1>404</h1>,
  }
];

export default routerConfigs;

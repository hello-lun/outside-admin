import React, { lazy, useEffect, useState } from 'react';
import { RouteObject } from 'react-router-dom';
import lazyWrapper from '../components/lazyWrapper';

const Home = () => import('../pages/home');
const Login = () => import('../pages/login/login');
const Register = () => import('../pages/register/register');
const Test = () => import('../pages/test/test');
const NewWord = () => import('../pages/new-word/word');

export type IRouteObject = RouteObject & {
  name?: string;
};


export const staticRouterConfigs: () => Array<IRouteObject> = () => [
  {
    path: '/',
    element: lazyWrapper(Home),
    children: [{
      path: '/',
      element: <h1 style={{height: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>成益后台管理系统</h1>
    }]
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
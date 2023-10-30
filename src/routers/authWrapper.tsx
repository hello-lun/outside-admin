import React, { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useOnceEffect, useIsLogin } from '@/hooks/onceEffect';

const Auth: React.FC<any> = props => {
  const navigate = useNavigate();
  useIsLogin(null, () => navigate('/login'));

  return props.component;
};

const AuthRouterWrapper = Auth;

export default AuthRouterWrapper;

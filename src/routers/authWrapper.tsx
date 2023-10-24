import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { useOnceEffect, useIsLogin } from '@/hooks/onceEffect';

interface MyComponentProps {
  userInfo: {
    username: string;
  };
  component: ReactNode;
}

const Auth: React.FC<any> = props => {
  const navigate = useNavigate();
  useIsLogin(null, () => navigate('/login'));

  return props.component;
};

const AuthRouterWrapper = connect((state: any) => ({ userInfo: state.user }), {})(Auth);

export default AuthRouterWrapper;

import React, { useEffect, useRef, useState } from 'react';
import { Button, FormInstance, Form, Input } from 'antd';
import styles from './login.module.scss';
import { login, IUserInfo } from '@/service/auth';
import { useNavigate } from 'react-router-dom';
import { useOnceEffect, useIsLogin } from '@/hooks/onceEffect';
import { useUserStore } from '@/store/user';
import { useRouterStore } from '@/store/router';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<FormInstance>(null);
  const [loadiing, setLoading] = useState(false);
  const updateUser = useUserStore.use.updateUser();
  const addRouterConfigs = useRouterStore.use.addRoute();

  useIsLogin(() => navigate('/'));

  const onRegister = () => {
    navigate('/register');
  };

  const loginSuccess = (data: IUserInfo) => {
    updateUser(data);
    addRouterConfigs(data.menuList);
  }

  const onFinish = (values: IUserInfo) => {
    setLoading(true);
    login(values)
      .then((data) => {
        loginSuccess(data);
        navigate('/');
      })
      .catch(err => {
        console.log('登录错误：' + err.message);
      }).finally(() => {
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const autoLogin = () => {
    formRef.current && formRef.current.setFieldsValue({
      username: 'java1234',
      password: '123456'
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.login}>
        <Form
          ref={formRef}
          name='basic'
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete='off'>
          <Form.Item label='Username' name='username' rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input />
          </Form.Item>

          <Form.Item label='Password' name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item style={{textAlign: 'center'}}>
            <Button type='primary' htmlType='submit' loading={loadiing}>
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>
      <p className={styles.register} onClick={autoLogin}>
        还没有账号？
        {/* 点击 <span onClick={onRegister}>注册</span> */}
      </p>
    </div>
  );
};

export default Login;

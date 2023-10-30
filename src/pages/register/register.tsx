import React, { useEffect } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import styles from './register.module.scss';
import { login, IUserInfo } from '@/service/auth';
import { useNavigate } from 'react-router-dom';
import { useOnceEffect, useIsLogin } from '@/hooks/onceEffect';
import { useUserStore } from '@/store/user';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const updateUser = useUserStore((state) => state.updateUser);

  useIsLogin(() => navigate('/'));

  const onRegister = () => {
    navigate('/register');
  };

  const onFinish = (values: IUserInfo) => {
    login(values)
      .then((data: any) => {
        updateUser(data);
        navigate('/');
      })
      .catch(err => {
        console.log('登录错误：' + err.message);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.login}>
        <Form
          name='basic'
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete='off'
        >
          <Form.Item label='Username' name='username' rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input />
          </Form.Item>

          <Form.Item label='Email' name='email' rules={[{ required: true, message: 'Please input your email!' }]}>
            <Input />
          </Form.Item>

          <Form.Item label='Password' name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item label='RePassword' name='rePassword' rules={[{ required: true, message: 'Please repeat your password!' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item name='remember' valuePropName='checked' wrapperCol={{ offset: 8, span: 16 }}>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;

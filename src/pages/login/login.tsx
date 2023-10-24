import React, { useEffect, useRef } from 'react';
import { Button, FormInstance, Form, Input } from 'antd';
import { connect } from 'react-redux';
import { setUserInfo } from '@redux-modules/user/actions';
import styles from './login.module.scss';
import { login, IUserInfo } from '@/service/auth';
import { useNavigate } from 'react-router-dom';
import { useOnceEffect, useIsLogin } from '@/hooks/onceEffect';

const Login: React.FC = ({ setUserInfo }: any) => {
  const navigate = useNavigate();
  const formRef = useRef<FormInstance>(null);

  useIsLogin(() => navigate('/'));

  const onRegister = () => {
    navigate('/register');
  };

  const onFinish = (values: IUserInfo) => {
    login(values)
      .then((data: any) => {
        setUserInfo(data);
        navigate('/artical');
      })
      .catch(err => {
        console.log('登录错误：' + err.message);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const autoLogin = () => {
    formRef.current && formRef.current.setFieldsValue({
      username: 'admin',
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
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <p className={styles.register} onClick={autoLogin}>
        还没有账号？点击 <span onClick={onRegister}>注册</span>
      </p>
    </div>
  );
};

export default connect((state: any) => ({ userInfo: state.user }), {
  setUserInfo
})(Login);

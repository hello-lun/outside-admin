// ! 记住当前页面
// ? 记住当前页面
// * 记住当前页面
// todo 记住当前页面
// // 记住当前页面
import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/locale/zh_CN';
import Vconsole from 'vconsole'

import './styles/index.scss';
import 'normalize.css';

const vConsole = new Vconsole();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ConfigProvider locale={zhCN}>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

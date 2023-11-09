import React, { useEffect, useState } from 'react';
import styles from './main.module.scss';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Button, Col, Dropdown, Layout, Menu, Row, Space, theme } from 'antd';
import type { MenuProps } from 'antd/es/menu';
import { useRouterStore } from '@/store/router';
import { useUserStore } from '@/store/user';
import { Outlet, useNavigate } from 'react-router-dom';
import { getGoods } from '@/service/goods';
import { logout } from '@/service/auth';
import { get } from 'lodash-es';
import { catchError } from '@/utils/helper';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const formatRouterToMenus = (list: any) => {
  const temp: any[] = [];
  list.forEach((ele: any) => {
    temp.push({
      label: ele.name || '首页',
      key: ele.path,
      icon: '',
      children: (ele.children && ele.children.length > 0) ? formatRouterToMenus(ele.children) : null,
    });
  })

  return temp;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const routerConfigs = useRouterStore.getState().routers;
  const removeRouter = useRouterStore.getState().removeRouter;
  const userData = useUserStore.getState().user;
  const removeUser = useUserStore.getState().removeUser;

  useEffect(() => {
    getGoods();
    const list = routerConfigs.find((item: any) => item.path === '/')?.children || [];
    const tempList = formatRouterToMenus(list);
    setMenus(tempList);
  }, [routerConfigs]);


  const logoutHandler = async () => {
    const [err] = await catchError(logout());
    if (!err) {
      removeUser();
      removeRouter();
      navigate('/login');
    }
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <span onClick={logoutHandler}>退出登陆</span>
      ),
    },
  ];

  const selectHandler: MenuProps['onSelect'] = (value) => {
    navigate(value.key);
  }

  return (
    <Layout className={styles.content}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className={styles.title}>后台管理系统</div>
        <Menu className={styles.menus} theme="dark" mode="inline" items={menus} onSelect={selectHandler} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Row>
            <Col span={20}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Col>
            <Col span={4}>
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  {get(userData, 'currentUser.username')}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
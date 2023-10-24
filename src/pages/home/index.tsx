import React, { useEffect } from 'react';
import { Layout } from 'antd';
import MainContent from './main';
import HeaderContent from '@/components/header/header';
import FooterContent from '@/components/footer';

import { useRoutes, Outlet } from 'react-router-dom';
import routerConfigs from '@/routers/configs';
const { Content } = Layout;

export default function Home() {
  // const Outlet = useRoutes(routerConfigs);
  return (
    <Layout>
      <HeaderContent />
      <Content>
        {/* {Outlet} */}
        <MainContent></MainContent>
      </Content>
      <FooterContent />
    </Layout>
  );
}

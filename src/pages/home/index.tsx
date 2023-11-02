import React, { useEffect } from 'react';
import { Layout } from 'antd';
import MainContent from './main';
import HeaderContent from '@/components/header/header';
import FooterContent from '@/components/footer';

const { Content } = Layout;

export default function Home() {
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

import React from 'react';
import { Spin } from 'antd';

export default function lazyWrapper(com: JSX.Element): JSX.Element {
  const styles = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  return <React.Suspense fallback={<div style={styles}><Spin tip='路由加载中...'/></div>}>{com}</React.Suspense>;
}

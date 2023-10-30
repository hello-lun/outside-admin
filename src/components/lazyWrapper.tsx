import React, { lazy, useEffect, useState } from 'react';
import { Spin } from 'antd';

export default function lazyWrapper(com: () => Promise<any>): JSX.Element {
  const styles = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  const Com = lazy(com);
  return <React.Suspense
    fallback={
      <div style={styles}><Spin tip='路由加载中...'/></div>
    }>
      {<Com />}
    </React.Suspense>;
}

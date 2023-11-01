import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import HoverMenu from '@/components/hoverMenu/hoverMenu';
import { useRouterStore } from '@/store/router';
import './App.css';

function App() {
  const routerConfigs = useRouterStore.getState().routers;
  const Outlet = useRoutes(routerConfigs);
  return <main className='App'>
    <HoverMenu />
    {Outlet}
  </main>;
}

export default App;

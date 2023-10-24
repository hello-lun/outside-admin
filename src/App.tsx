import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import routerConfigs from './routers/configs';
import './App.css';
import HoverMenu from '@/components/hoverMenu/hoverMenu';

function App() {
  const Outlet = useRoutes(routerConfigs);
  return <main className='App'>
    <HoverMenu />
    {Outlet}
  </main>;
}

export default App;

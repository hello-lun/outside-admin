
import React, { useState } from 'react';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './hoverMenu.module.scss';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRouterStore } from '@/store/router';
import { IRouteObject } from '@/router/configs';

const path = '/others';

const HoverMenu: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const othersRouterConfigs: IRouteObject[] = useRouterStore(state => {
    return state.routers.find(item => item.path === path)?.children || [];
  });

  function onClose() {
    setOpen(false);
  }

  function itemClick(e: React.MouseEvent<HTMLDivElement>) {
    const path = (e.target as Element).getAttribute('data-path');
    path && navigate(path);
    setOpen(false);
  }


  return <div className={styles.menu}>
    <Drawer title="菜单" placement="right" onClose={onClose} open={open}>
      <div onClick={itemClick} className={styles.menuItem}>
        {
          othersRouterConfigs?.map(item => {
            return <p data-path={item.path} key={item.path}>{item.name}</p>
          })
        }
      </div>
    </Drawer>
    <MenuUnfoldOutlined onClick={() => setOpen(true)} />
  </div>
}

export default HoverMenu;
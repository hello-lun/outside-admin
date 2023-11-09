
import React, { useState } from 'react';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './hoverMenu.module.scss';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';

const HoverMenu: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
        <p data-path="/others/artical">阅读</p>
        <p data-path="/others/novel">小说</p>
        <p data-path="/others/word">记单词</p>
        <p data-path="/others/goodsCount">订单详情</p>
        <p data-path="/others/milk">录入奶粉</p>
      </div>
    </Drawer>
    <MenuUnfoldOutlined onClick={() => setOpen(true)} />
  </div>
}

export default HoverMenu;
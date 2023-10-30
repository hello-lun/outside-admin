import React, { useState, startTransition } from 'react';
import { Col, Row } from 'antd';
import styles from './header.module.scss';
import { UnorderedListOutlined, WhatsAppOutlined } from '@ant-design/icons';
import Logo from '@/assets/logo.png';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { doLogout } from '@/utils/logout';
import { useUserStore } from '@/store/user';

const drawDownItems: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a href='https://web.whatsapp.com/send?phone=13333334444&amp;text=你好,测试信息' style={{ color: '#dbd509', fontSize: '15px' }}>
        WhatsApp(13333334444)
      </a>
    ),
    icon: <WhatsAppOutlined />
  },
  {
    key: '2',
    label: (
      <a href='https://web.whatsapp.com/send?phone=13333334444&amp;text=你好,测试信息' style={{ color: '#dbd509', fontSize: '15px' }}>
        WhatsApp(13333334444)
      </a>
    ),
    icon: <SmileOutlined />,
    disabled: true
  },
  {
    key: '3',
    label: (
      <a href='https://web.whatsapp.com/send?phone=13333334444&amp;text=你好,测试信息' style={{ color: '#dbd509', fontSize: '15px' }}>
        WhatsApp(13333334444)
      </a>
    ),
    disabled: true
  }
];

const items = [
  {
    label: 'Home',
    key: 'home'
  },
  {
    label: 'Products',
    key: 'product',
    icon: <UnorderedListOutlined />,
    children: [
      {
        label: 'Products 01',
        key: '01'
      },
      {
        label: 'Products 02',
        key: '02'
      }
    ]
  },
  {
    label: 'About Us',
    key: 'about',
    children: drawDownItems
  },
  {
    label: 'News',
    key: 'hello'
  }
];

const Header: React.FC = () => {
  const userData = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [currentMenu, setCurrentMenu] = useState('home');

  const clickMenu = (key: string) => {
    setCurrentMenu(key);
    navigate('/' + key);
  };

  const login = function (type: string) {
    startTransition(() => {
      const typeMap: { [key: string]: string } = {
        login: '/login',
        register: '/register'
      };
      navigate(typeMap[type]);
    });
  };

  return (
    <header className={styles.header}>
      <Row>
        <Col span={4}>
          <img src={Logo} alt='logo' className={styles.logo} />
        </Col>
        <Col span={20} style={{ textAlign: 'right' }}>
          <Row className={styles.menuWrapper}>
            {items.map(item => {
              return (
                <Col key={item?.key} className={styles.menu} onClick={() => clickMenu(item.key)}>
                  {item.children ? (
                    <Dropdown menu={{ items: item.children }} placement='bottom'>
                      <div className={styles['menu-item']}>
                        <span>{item.label}</span>
                        <DownOutlined style={{ marginLeft: '5px', fontSize: '14px' }} />
                      </div>
                    </Dropdown>
                  ) : (
                    <div className={styles['menu-item']}>{item.label}</div>
                  )}

                  {/* <DownOutlined /> */}
                  {currentMenu === item.key && <div className={styles['menu-active']}></div>}
                </Col>
              );
            })}

            <Col className={styles.menu} onClick={doLogout}>
              <div style={{ fontSize: '15px', color: '#dbd509' }}>
                <WhatsAppOutlined />
                <a href='https://web.whatsapp.com/send?phone=13333334444&amp;text=你好,测试信息' style={{ color: '#dbd509', marginLeft: '5px' }}>
                  WhatsApp(13333334444)
                </a>
              </div>
            </Col>

            <Col className={styles.menu}>
              <div className={styles['sign-up']}>
                {userData.id ? (
                  <p onClick={() => login('login')}>
                    <span>{userData.currentUser.username}</span>
                  </p>
                ) : (
                  <p>
                    <span onClick={() => login('login')}>sign in</span> / <span onClick={() => login('register')}>sign up</span>
                  </p>
                )}
              </div>
            </Col>
          </Row>
          {/* <Menu onClick={clickMenu} selectedKeys={[currentMenu]} mode='horizontal' items={items} /> */}
        </Col>
      </Row>
    </header>
  );
};

export default Header;

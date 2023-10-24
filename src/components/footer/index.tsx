import React from 'react';
import { Layout, Row, Col } from 'antd';
// import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
const { Footer } = Layout;

const Header: React.FC = () => {
  // const navigate = useNavigate();
  return (
    <footer className={styles.footer}>
      <Footer>
        <Row gutter={[16, 24]}>
          <Col span={9}>
            <h3>somethink about us</h3>
            <p>sdjcsdkvcdks</p>
            <p>sdjcsdkvcdks</p>
          </Col>
          <Col span={5}>
            <h3>News to us</h3>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
          </Col>
          <Col span={5}>
            <h3>somethink about us</h3>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
          </Col>

          <Col span={5}>
            <h3>somethink about us</h3>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
            <p>sddfjdjnj</p>
          </Col>
        </Row>
      </Footer>
    </footer>
  );
};

export default Header;

import React, { useEffect, useState, useRef } from 'react';
import { Col, Row } from 'antd';
import { addGoods, IGetGoods, getGoods } from '@/service/goods';
import styles from './goods.module.scss';

const Goods: React.FC = () => {
  const [goodsList, setGoodsList] = useState<Array<IGetGoods>>([]);
  const reqOnce = useRef(false);
  useEffect(() => {
    if (!reqOnce.current) {
      reqOnce.current = true;
      // addGoods({
      //   title: `${Math.random()}手机的v臭${Math.random()}豆腐v地方`,
      //   subTitle: `${Math.random()}说的v份${Math.random()}报告`,
      //   detail: `${Math.random()}水电开${Math.random()}发的女`,
      //   tag: `${Math.random()}微风内裤v`,
      //   important: Math.random() > 0.45 ? 1 : 0,
      //   image: `${Math.random()}`
      getGoods()
        .then((data: any) => {
          setGoodsList(data instanceof Array ? data : []);
        })
        .catch(err => {
        });
    }
  }, []);
  return (
    <Row gutter={[16, 24]} className={styles.goods}>
      {goodsList.splice(0, 4).map(item => {
        return (
          <Col span={6} key={item.title}>
            <div className={styles.item}>
              <p className={`${styles['item-text']} ${styles['item-title']}`}>{item.title}</p>
              <p className={styles['item-text']}>{item.subTitle}</p>
              <img src={item.image} alt=''></img>
              <div>{item.detail.slice(0, 10)}</div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default Goods;

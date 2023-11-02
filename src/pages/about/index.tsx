import React, { useEffect } from 'react';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import { getGoods } from '../../service/goods';
import './index.css';
interface IAboutProps {
  id: string;
  name: string;
}

export default function useAbout({ id, name }: IAboutProps) {
  const [params] = useSearchParams();
  const idName = params.get('id');
  const navigate = useNavigate();
  useEffect(() => {
    (async function () {
      try {
        const sd = await getGoods();
      } catch (err) {
      }
    })();
  }, []);

  const openSecond = () => {
    navigate('/about/hello');
  };
  return (
    <div id='sd' className='wrssss'>
      <div id='l' data-s='sd'>
        sdfdf
      </div>
      我是about页面--id: {idName}
      <p onClick={openSecond} className='fs'>
        跳转hello二级路由
      </p>
      <Outlet />
    </div>
  );
}

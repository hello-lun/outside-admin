import lazyWrapper from '../components/lazyWrapper';

const Word = () => import('../pages/word/word');
const Artical = () => import('../pages/artical/artical');
const Novel = () => import('../pages/novel/novel');
const Milk = () => import('../pages/milk/milk');
const GoodsCount = () => import('../pages/goodsCount/goodsCount');

type MyObjectType = {
  word: JSX.Element;
  artical: JSX.Element;
  novel: JSX.Element;
  milk: JSX.Element;
  goodsCount: JSX.Element;
  [key: string]: JSX.Element;  // 这个就是索引签名
};

const routerMap: MyObjectType = {
  word: lazyWrapper(Word),
  artical: lazyWrapper(Artical),
  novel: lazyWrapper(Novel),
  milk: lazyWrapper(Milk),
  goodsCount: lazyWrapper(GoodsCount),
};

export const formatRouterCom = (key: string) => {
  if (!key) return '';
  return routerMap[key as keyof typeof routerMap];

}

export default routerMap;

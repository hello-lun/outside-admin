import lazyWrapper from '../components/lazyWrapper';

const Word = () => import('../pages/word/word');
const Artical = () => import('../pages/artical/artical');
const Novel = () => import('../pages/novel/novel');
const Milk = () => import('../pages/milk/milk');
const GoodsCount = () => import('../pages/goodsCount/goodsCount');
const GoodsAdd = () => import('../pages/goods/add/add');
const Staff = () => import('../pages/staff/staff');
const Category = () => import('../pages/category/category');
const Brand = () => import('../pages/brand/brand');
const Banners = () => import('../pages/banners/banners');
const NewWord = () => import('../pages/new-word/word');

type MyObjectType = {
  word: JSX.Element;
  artical: JSX.Element;
  novel: JSX.Element;
  milk: JSX.Element;
  goodsCount: JSX.Element;
  addGoods: JSX.Element;
  [key: string]: JSX.Element;  // 这个就是索引签名
};

const routerMap: MyObjectType = {
  word: lazyWrapper(Word),
  artical: lazyWrapper(Artical),
  novel: lazyWrapper(Novel),
  milk: lazyWrapper(Milk),
  goodsCount: lazyWrapper(GoodsCount),
  addGoods: lazyWrapper(GoodsAdd),
  staff: lazyWrapper(Staff),
  category: lazyWrapper(Category),
  brand: lazyWrapper(Brand),
  banners: lazyWrapper(Banners),
  newWord: lazyWrapper(NewWord),
};

export const formatRouterCom = (key: string) => {
  if (!key) return '';
  return routerMap[key as keyof typeof routerMap];

}

export default routerMap;

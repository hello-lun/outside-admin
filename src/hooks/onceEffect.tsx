import { useEffect, useRef } from 'react';

type MyCallbackType = () => void;

export const useOnceEffect = (cb: MyCallbackType) => {
  const cache = useRef<boolean>(false);

  useEffect(() => {
    if (cache.current) return;
    cache.current = true;

    const destroy = cb && cb();
    // eslint-disable-next-line no-debugger
    return destroy;
  }, []);
};

type ILoginCB = (() => void) | null;

export const useIsLogin = (isLoginCB?: ILoginCB, notLoginCB?: ILoginCB) => {
  useOnceEffect(() => {
    const storedObject = localStorage.getItem('userInfo');
    const parsedObject = storedObject ? JSON.parse(storedObject) : {};

    if (parsedObject.username) {
      isLoginCB && isLoginCB();
    } else {
      notLoginCB && notLoginCB();
    }
  });
};

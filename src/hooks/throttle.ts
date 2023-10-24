import { useState, useEffect } from 'react';

const useThrottle = (callback: any, delay: number) => {
  const [lastCalled, setLastCalled] = useState(0);

  useEffect(() => {
    const handleThrottle = (...args: any[]) => {
      const now = Date.now();
      if (now - lastCalled >= delay) {
        setLastCalled(now);
        callback(...args);
      }
    };

    const throttledCallback = setTimeout(handleThrottle, delay);

    return () => clearTimeout(throttledCallback);
  }, [callback, delay, lastCalled]);

  // 返回空的依赖数组 []，确保只在组件第一次加载时执行一次
  // 如果要在依赖变化时执行一次，可以根据需要添加依赖
  return null;
};

export default useThrottle;

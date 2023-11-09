/* eslint-disable */
const path = require('path');
const pxToViewport = require('postcss-px-to-viewport-8-plugin');
const pathJoin = pre => path.join(__dirname, pre);
const pathResolve = pre => path.resolve(__dirname, pre);
// const vw = pxToViewport({
//   // 视口宽度，一般就是 375（ 设计稿一般采用二倍稿，宽度为 375 ）
//   viewportWidth: 375
// });

module.exports = {
  style: {
    sass: {
      loaderOptions: {
        // 这里是你想要添加的全局变量或 mixin
        additionalData: `@import "${pathResolve('src/styles/index.scss')}";`
      }
    }
  },
  webpack: {
    alias: {
      '@': pathJoin('src'),
      '@redux-modules': pathJoin('src/redux/modules'),
      '@assets': pathJoin('src/assets'),
      '@components': pathJoin('src/components'),
      '@routes': pathJoin('src/routes'),
      '@service': pathJoin('src/service'),
      '@styles': pathJoin('src/styles'),
      '@types': pathJoin('src/types'),
      '@utils': pathJoin('src/utils')
    },

    configure(webpackConfig) {
      // 配置扩展扩展名
      webpackConfig.resolve.extensions = [...webpackConfig.resolve.extensions, ...['.less', '.scss', '.css']];
      return webpackConfig;
    }
  },
  style: {
    // postcss8的新写法, 移动端适配大小
    // postcss: {
    //   mode: 'extends',
    //   loaderOptions: {
    //     postcssOptions: {
    //       ident: 'postcss',
    //       plugins: [vw]
    //     }
    //   }
    // }
  }
};

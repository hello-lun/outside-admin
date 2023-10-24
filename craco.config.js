/* eslint-disable */
const path = require('path');
const pxToViewport = require('postcss-px-to-viewport-8-plugin');
const pathResolve = pre => path.join(__dirname, pre);
// const vw = pxToViewport({
//   // 视口宽度，一般就是 375（ 设计稿一般采用二倍稿，宽度为 375 ）
//   viewportWidth: 375
// });

module.exports = {
  webpack: {
    alias: {
      '@': pathResolve('src'),
      '@redux-modules': pathResolve('src/redux/modules'),
      '@assets': pathResolve('src/assets'),
      '@components': pathResolve('src/components'),
      '@routes': pathResolve('src/routes'),
      '@service': pathResolve('src/service'),
      '@styles': pathResolve('src/styles'),
      '@types': pathResolve('src/types'),
      '@utils': pathResolve('src/utils')
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

const loader = require('file-loader');

path = require('path')
module.exports = {
  devServer: {
    proxy: {
      "^/api/": {
        target: 'https://localhost:5001',
        logLevel: 'debug',
        pathRewrite: { "^/api/": "/" }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias : {
        src: path.resolve(__dirname, 'src')
      },
      extensions: [".ts", ".js", ".json", ".vue", ".png"]
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule('ts')
      .test(/\.ts$/)
      .use('ts-loader')
      .loader('ts-loader')
      .tap(options => {
        return {
          ...options, appendTsSuffixTo: [/\.vue$/]
        };
      });
    config.module
      .rule('file')
      .test('/\.(png|jpg|gif|svg))$/')
      .use('file-loader')
      .loader('file-loader');
    }
};
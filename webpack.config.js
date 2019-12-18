const path = require('path');
const _ = require('lodash');

const devConfig = {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.resolve(__dirname),
  },
};

const prodConfig = {};

module.exports = (env, argv) => {
  const { mode } = argv;

  return _.merge({
    entry: './src/index.js',
    output: {
      filename: 'designer.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'Designer',
    },
  }, mode === 'production' ? prodConfig : devConfig);
};

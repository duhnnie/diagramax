const path = require('path');
const _ = require('lodash');
const outputDir = 'dist';

const devConfig = {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, outputDir),
  },
};

const prodConfig = {
  devtool: '(none)'
};


module.exports = (env, argv) => {
  const mode = argv.mode;

  return _.merge({
    entry: './src/index.js',
    output: {
      filename: 'designer.js',
      path: path.resolve(__dirname, outputDir),
      library: 'Designer',
    },
  }, mode === 'production' ? prodConfig : devConfig);
};

const path = require('path');

const devConfig = {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: __dirname,
  },
};

const prodConfig = {};

module.exports = (env, argv) => {
  const { mode } = argv;
  const base = {
    entry: './src/index.js',
    output: {
      filename: 'designer.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'Designer',
    },
  };

  if (mode === 'production') {
    return {
      ...base,
      ...prodConfig,
    };
  }

  return {
    ...base,
    ...devConfig,
  };
};

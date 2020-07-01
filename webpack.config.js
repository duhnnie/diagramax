const path = require('path');

const devConfig = {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: __dirname,
  },
};

const bundleName = 'designer';
const prodConfig = {};

module.exports = (env, argv) => {
  const { mode } = argv;
  const base = {
    entry: ['./src/sass/index.scss', './src/js/index.js'],
    // Apparently, next output def is only being applied to .js entry.
    output: {
      filename: `${bundleName}.js`,
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: 'Designer',
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `./${bundleName}.css`,
              },
            },
            { loader: 'sass-loader' },
          ],
        },
      ],
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

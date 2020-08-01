const path = require('path');

const devConfig = {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: __dirname,
  },
};

const libraryName = 'DrawJS';
const prodConfig = {};

module.exports = (env, argv) => {
  const { mode } = argv;
  const isProduction = mode === 'production';
  const bundleSuffix = isProduction ? '' : '.dev';
  const bundleJSName = `draw${bundleSuffix}`;
  const bundleCSSName = `drawJS${bundleSuffix}`;
  const base = {
    entry: ['./src/sass/index.scss', './src/js/index.js'],
    // Apparently, next output def is only being applied to .js entry.
    output: {
      filename: `${bundleJSName}.js`,
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: libraryName,
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `./${bundleCSSName}.css`,
              },
            },
            { loader: 'sass-loader' },
          ],
        },
      ],
    },
  };

  if (isProduction) {
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

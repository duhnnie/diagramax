const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'designer.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Designer',
  }
};

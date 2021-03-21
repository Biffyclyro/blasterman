const path = require('path');

module.exports = {
  entry: './src/server.ts',
  target: 'node',
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'server.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

// rdkit worker bundle config

/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const path = require('path');

module.exports = {
  entry: './src/worker/bundle.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'worker-lib'),
  },
};

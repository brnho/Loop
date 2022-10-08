const path = require('path');;
const webpack = require('webpack');

const config = {
  mode: 'development',
  entry: { unsecuredApp: ['./src/unsecured/App.jsx'], securedApp: ['./src/secured/App.jsx'] },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  ie: '11',
                  edge: '15',
                  safari: '10',
                  firefox: '50',
                  chrome: '49',
                },
              }],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  optimization: {
    splitChunks: { //separate node modules into vendor.bundle.js
      name: 'vendor',
      chunks: 'all',
    },
  },
  devtool: 'source-map',
};

module.exports = config;
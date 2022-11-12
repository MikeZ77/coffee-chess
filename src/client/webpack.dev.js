const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    login: './src/client/pages/login/index.ts',
    register: './src/client/pages/register/index.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../../dist/client'),
    publicPath: ''
  },
  devtool: 'source-map',
  mode: 'development',
  watch: true,
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv(),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: path.resolve(__dirname, './common/index.html'),
      chunks: ['login'],
      minify: false
      // favicon: './public/favicon.ico'
    }),
    new HtmlWebpackPlugin({
      filename: 'register.html',
      template: path.resolve(__dirname, './common/index.html'),
      chunks: ['register'],
      minify: false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/mystyles.css'
    })
  ]
};

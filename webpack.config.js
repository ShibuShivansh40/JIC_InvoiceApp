const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-sqlite-storage$': path.resolve(__dirname, 'src/web/sqliteMock.js'),
      'react-native-pdf$': path.resolve(__dirname, 'src/web/pdfMock.js'),
      'react-native-print$': path.resolve(__dirname, 'src/web/printMock.js'),
      'react-native-share$': path.resolve(__dirname, 'src/web/shareMock.js'),
    },
    extensions: ['.web.js', '.web.tsx', '.web.ts', '.js', '.jsx', '.json', '.tsx', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native-vector-icons|react-native-element-dropdown|react-native-reanimated|react-native-worklets|react-native-safe-area-context|@react-navigation)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            babelrc: false,
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              'react-native-web',
            ],
          },
        },
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true,
  },
};

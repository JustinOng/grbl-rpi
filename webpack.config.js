var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'client/js');
var APP_DIR = path.resolve(__dirname, 'client/src');

var config = {
  entry: APP_DIR + '/js/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  // configuration of copy-webpack-plugin which copies all files from ./static to ./build
  context: path.resolve(__dirname),
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'client/src/css',
        to: path.resolve(__dirname, 'client/css')
      }
    ])
  ],
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        loader : 'babel'
      }
    ]
  }
};

module.exports = config;
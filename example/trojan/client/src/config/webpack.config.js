const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require("vue-loader")

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, '../index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve('client/dist')
  },
  resolve: {
    alias: {
      '@': './src'
    },
    extensions: ['.js', '.json', '.vue', '.css']
  },
  optimization: {
    sideEffects: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      })
    ]
  },
  module: {
    rules: [
      { test: /\.vue$/, use: ['vue-loader'] },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        use: ['url-loader']
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  watchOptions: {
    ignored: /node_modules/
  }
}
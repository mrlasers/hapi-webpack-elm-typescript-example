import HtmlWebpackPlugin from 'html-webpack-plugin'
import Path from 'path'
import Webpack, { Configuration } from 'webpack'
import { merge } from 'webpack-merge'

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

export const buildMode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

const commonConfig: Configuration = {
  mode: buildMode,
  entry: ['./client/static/index.js'],
  resolve: {
    extensions: ['.js', '.elm'],
  },
  module: {
    noParse: /\.elm$/,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/static/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
}

const devConfig: Configuration = {
  devtool: 'cheap-module-source-map',
  entry: ['webpack-hot-middleware/client'],
  output: {
    filename: '[name].js',
    path: Path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: ['elm-hot-webpack-loader', 'elm-webpack-loader'],
      },
    ],
  },
  plugins: [new Webpack.HotModuleReplacementPlugin()],
}

const prodConfig: Configuration = {
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_moduls/],
        use: ['elm-webpack-loader'],
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: Path.resolve(__dirname, 'dist/public'),
    publicPath: '/',
  },
}

const mergedConfig = merge(commonConfig, isDev ? devConfig : prodConfig)

export default mergedConfig

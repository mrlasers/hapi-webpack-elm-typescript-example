import HtmlWebpackPlugin from 'html-webpack-plugin'
import Path from 'path'
import Webpack, { webpack } from 'webpack'

export const devConfig: Webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [
    // 'webpack-dev-middleware/client',
    'webpack-hot-middleware/client',
    './client/static/index.js',
    // './client/static/index.html',
  ],
  output: {
    filename: '[name].js',
    path: Path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.elm'],
  },

  module: {
    noParse: /\.elm$/,
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: ['elm-hot-webpack-loader', 'elm-webpack-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/static/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new Webpack.HotModuleReplacementPlugin(),
  ],
}

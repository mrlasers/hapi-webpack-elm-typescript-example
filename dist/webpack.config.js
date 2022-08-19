"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMode = void 0;
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_merge_1 = require("webpack-merge");
const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;
exports.buildMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const commonConfig = {
    mode: exports.buildMode,
    entry: ['./client/static/index.js'],
    resolve: {
        extensions: ['.js', '.elm'],
    },
    module: {
        noParse: /\.elm$/,
    },
    plugins: [
        new html_webpack_plugin_1.default({
            template: './client/static/index.html',
            filename: 'index.html',
            inject: 'body',
        }),
    ],
};
const devConfig = {
    devtool: 'cheap-module-source-map',
    entry: ['webpack-hot-middleware/client'],
    output: {
        filename: '[name].js',
        path: path_1.default.resolve(__dirname, 'dist'),
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
    plugins: [new webpack_1.default.HotModuleReplacementPlugin()],
};
const prodConfig = {
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
        path: path_1.default.resolve(__dirname, 'dist/public'),
        publicPath: '/',
    },
};
const mergedConfig = (0, webpack_merge_1.merge)(commonConfig, isDev ? devConfig : prodConfig);
exports.default = mergedConfig;
//# sourceMappingURL=webpack.config.js.map
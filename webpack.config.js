var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var env = process.env.WEBPACK_ENV;

module.exports = {
    mode: 'production',
    entry: './src/twig.js',
    target: env === 'browser' ? 'web' : 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: __dirname,
        filename: env === 'browser' ? 'twig.min.js' : 'twig.js',
        library: 'Twig',
        libraryTarget: 'umd'
    },
    plugins: env === 'browser' ? [
        new UglifyJsPlugin()
    ] : []
};

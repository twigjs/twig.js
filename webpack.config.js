var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var env = process.env.WEBPACK_ENV;
var entry = {};
entry[env === 'browser' ? 'twig.min.js' : 'twig.js'] = './src/twig.js';
entry[env === 'browser' ? 'twig.production.min.js' : 'twig.production.js'] = './src/twig.production.js';

module.exports = {
    mode: 'production',
    entry: entry,
    target: env === 'browser' ? 'web' : 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: __dirname,
        filename: '[name]',
        library: 'Twig',
        libraryTarget: 'umd'
    },
    plugins: env === 'browser' ? [
        new UglifyJsPlugin()
    ] : []
};

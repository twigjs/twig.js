var webpack = require('webpack');

var env = process.env.WEBPACK_ENV;

module.exports = {
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
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ] : []
};

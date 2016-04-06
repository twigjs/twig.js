var webpack = require('webpack');

module.exports = {
    entry: './src/twig.js',
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: __dirname,
        filename: 'twig.js',
        library: 'Twig',
        libraryTarget: 'umd'
    }
};

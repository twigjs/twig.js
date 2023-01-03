const TerserJsPlugin = require('terser-webpack-plugin');

const commonModule = {
    exclude: /(node_modules)/,
    use: {
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env"],
            plugins: [
                "@babel/plugin-transform-modules-commonjs",
                "@babel/plugin-transform-runtime"
            ]
        }
    }
};

const serverBuild = {
    mode: 'production',
    entry: './src/twig.js',
    target: 'node',
    node: false,
    output: {
        path: __dirname,
        filename: 'twig.js',
        library: 'Twig',
        libraryTarget: 'umd'
    },
    module: {
        rules: [commonModule],
    },
    optimization: {
        minimize: false
    }
};

const clientBuild = {
    mode: 'production',
    entry: './src/twig.js',
    target: 'web',
    devtool: 'source-map',
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [commonModule]
    },
    output: {
        path: __dirname,
        filename: 'twig.min.js',
        library: 'Twig',
        libraryTarget: 'umd'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserJsPlugin({
            sourceMap: true,
            include: /\.min\.js$/
        })]
    }
};

module.exports = [serverBuild, clientBuild];

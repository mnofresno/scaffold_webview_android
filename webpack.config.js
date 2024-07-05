const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/js/main.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[hash][ext][query]'
                    }
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: 'index.html',
                inject: 'body'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.resolve(__dirname, 'dist'), to: path.resolve(__dirname, 'android/src/main/assets') }
                ]
            })
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            port: 9350,
            hot: true,
            open: true,
        },
        mode: isProduction ? 'production' : 'development'
    };
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/js/app.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'www'),
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        devtool: 'eval-source-map',
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader'
                    ],
                },
                {
                    test: /\.scss$/i,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'sass-loader'
                    ],
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[hash][ext][query]'
                    }
                },
                {
                    test: /\.html$/i,
                    loader: 'html-loader',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: 'index.html',
                inject: 'body'
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/templates', to: 'templates' }
                ],
            }),
        ],
        devServer: {
            static: [
                {
                    directory: path.join(__dirname, 'src'),
                    publicPath: '/',
                },
                {
                    directory: path.join(__dirname, 'www'),
                    publicPath: '/www',
                },
            ],
            compress: true,
            port: 9350,
            hot: true,
            open: true,
        },
        optimization: {
            minimize: isProduction,
            minimizer: isProduction ? [
                new TerserPlugin({
                    terserOptions: {
                        mangle: true, // Solo manglar en producción
                        compress: {
                            drop_console: true, // Eliminar console.logs en producción
                        },
                    },
                }),
            ] : [],
        },
        performance: {
            hints: false, // Deshabilita todos los avisos de rendimiento
            maxAssetSize: 512000, // Tamaño máximo del asset en bytes (512 KiB)
            maxEntrypointSize: 512000, // Tamaño máximo del entry point en bytes (512 KiB)
        },
        mode: isProduction ? 'production' : 'development'
    };
};

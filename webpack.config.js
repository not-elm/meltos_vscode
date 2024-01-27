//@ts-check

"use strict";

const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },

    experiments: {
        asyncWebAssembly: true,
        // lazyCompilation: true,
        //  syncWebAssembly: true, topLevelAwait: true
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            // {
            // 	test: /\.wasm$/,
            // 	type: "asset/inline",
            // },
        ],
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.join(__dirname, "../meltos_wasm"),
            outDir: path.resolve(__dirname, "wasm"),
             // extraArgs: "--target nodejs"
        }),
    ],
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
};
module.exports = [extensionConfig];

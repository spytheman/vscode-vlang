//@ts-check
"use strict";

const path = require("path");

// ["./src/client/main.ts", "./src/server/main.ts"];

/**@type {import('webpack').Configuration}*/
const config = {
	target: "node",
	entry: {
		main: "./src/client/main.ts",
		server: "./src/server/main.ts",
	},
	output: {
		path: path.resolve(__dirname, "out"),
		filename: "[name].js",
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]",
	},
	devtool: "source-map",
	externals: {
		vscode: "commonjs vscode",
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [{ loader: "ts-loader" }],
			},
		],
	},
};

module.exports = config;

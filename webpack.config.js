import CopyPlugin from "copy-webpack-plugin";
import { TransformAsyncModulesPlugin } from "transform-async-modules-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import path from "path";
import { fileURLToPath } from "url";
import pkgJson from "./package.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {(env: Record<string, string>, argv: { mode?: string }) => (import('webpack').Configuration)[]} */
const makeConfig = (_env, argv) => [
  {
    /**
     * NOTE: Builds with devtool = 'eval' contain very big eval chunks which seem
     * to cause segfaults (at least) on nodeJS v0.12.2 used on webOS 3.x.
     */
    devtool: argv.mode === "development" ? "inline-source-map" : "source-map",

    entry: {
      index: "./src/main.ts",
      // userScript: {
      //   import: './src/userScript',
      //   filename: 'webOSUserScripts/[name].js'
      // }
    },

    resolve: {
      extensions: [".mjs", ".cjs", ".js", ".json", ".ts", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          use: "vue-loader",
        },
        //use babel-loader to transpile js files
        {
          test: /\.js$/,
          loader: "babel-loader",
        },
        /* This configuration is setting up a rule for webpack to handle TypeScript files (.ts). Here's what
each part of the configuration is doing: */
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
          },
          exclude: /node_modules/,
        },
        // css-loader to bundle all the css files into one file and vue-style-loader
        // to add all the styles inside the <style> block in `.vue` file.
        {
          test: /\.css$/,
          use: ["vue-style-loader", "css-loader"],
        },
        // {
        //   test: /\.[mc]?[jt]s$/i,

        //   loader: "babel-loader",
        //   exclude: [
        //     // Some module should not be transpiled by Babel
        //     // See https://github.com/zloirock/core-js/issues/743#issuecomment-572074215
        //     // \\ for Windows, / for macOS and Linux
        //     /node_modules[\\/]core-js/,
        //     /node_modules[\\/]webpack[\\/]buildin/,
        //   ],
        //   options: {
        //     cacheDirectory: true,
        //   },
        //   resolve: {
        //     // File extension DON'T MATTER in a bundler.
        //     fullySpecified: false,
        //   },
        // },
        // {
        //   test: /\.css$/i,
        //   use: [
        //     { loader: "style-loader" },
        //     {
        //       loader: "css-loader",
        //       options: { esModule: false, importLoaders: 1 },
        //     },
        //     "postcss-loader",
        //   ],
        // },
      ],
    },

    plugins: [
      new VueLoaderPlugin(),
      new CopyPlugin({
        patterns: [
          { context: "assets", from: "**/*" },
          // { context: "src", from: "index.html" },
        ],
      }),
      // babel doesn't transform top-level await.
      // webpack transforms it to async modules.
      // This plugin calls babel again to transform remove the `async` keyword usage after the fact.
      new TransformAsyncModulesPlugin({
        // @ts-expect-error Bad types
        runtime: {
          version: pkgJson.devDependencies["@babel/plugin-transform-runtime"],
        },
      }),
    ],
  },
];

export default makeConfig;

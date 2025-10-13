import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {(env: Record<string, string>, argv: { mode?: string }) => (import('webpack').Configuration)[]} */
const makeConfig = (_env, argv) => [
  {
    devtool: argv.mode === "development" ? "inline-source-map" : "source-map",
    entry: {
      app: "./src/main.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
      // Force ES5 output for webOS compatibility
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false,
      },
    },
    resolve: {
      extensions: [".mjs", ".cjs", ".js", ".json", ".ts", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, "tsconfig.app.json"),
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: "vue-loader",
        },
        // Transpile JS files including Vue packages from node_modules
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: {
            and: [/node_modules/], // Exclude node_modules by default
            not: [
              // But include these packages for transpilation
              /node_modules[\\/]vue/,
              /node_modules[\\/]@vue/,
              /node_modules[\\/]vuetify/,
              /node_modules[\\/]pinia/,
            ],
          },
        },
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: false,
            configFile: path.resolve(__dirname, "tsconfig.app.json"),
            compilerOptions: {
              // Ensure TypeScript outputs ES5-compatible code
              target: "ES5",
              // Don't use optional chaining/nullish coalescing
              lib: ["ES5", "DOM"],
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["vue-style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
        inject: "body",
      }),
      new CopyPlugin({
        patterns: [{ context: "assets", from: "**/*" }],
      }),
    ],
    // Optimize for older environments
    optimization: {
      minimize: argv.mode === "production",
    },
  },
];

export default makeConfig;

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          // WebOS 3.x uses Chrome 38, webOS 4-5.x use Chrome 53-68
          // Adjust based on your target webOS version
          chrome: "38",
        },
        modules: false, // Let webpack handle modules
        useBuiltIns: "usage", // Automatically import polyfills as needed
        corejs: 3,
        // Force all transforms for maximum compatibility
        forceAllTransforms: true,
        // Explicitly exclude proposals that can't be transpiled
        exclude: ["transform-typeof-symbol"],
      },
    ],
  ],
  // Add plugin for async/await if you use it
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: false,
        helpers: true,
        regenerator: true,
      },
    ],
    // Explicitly add these to ensure proper transpilation
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
  ],
};

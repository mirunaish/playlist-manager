const paths = require("react-scripts/config/paths");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// Export override function(s) via object
module.exports = {
  webpack: override,
  // You may also override the Jest config (used for tests) by adding property with 'jest' name below. See react-app-rewired library's docs for details
};

// Function to override the CRA webpack config
function override(config, env) {
  // Replace single entry point in the config with multiple ones
  config.entry = {
    popup: paths.appIndexJs,
    options: paths.appSrc + "/options.js",
    background: paths.appSrc + "/background_scripts/background.js",
    get_title_and_artist:
      paths.appSrc + "/content_scripts/get_title_and_artist.js",
    insert_listener: paths.appSrc + "/content_scripts/insert_listener.js",
  };
  // Change output filename template to get rid of hash there
  config.output.filename = "static/js/[name].js";

  // Disable built-in SplitChunksPlugin
  config.optimization.splitChunks = {
    cacheGroups: { default: false },
  };
  // Disable runtime chunk addition for each entry point
  config.optimization.runtimeChunk = false;

  // Shared minify options to be used in HtmlWebpackPlugin constructor
  const minifyOpts = {
    removeComments: true,
    collapseWhitespace: false, // temp, for easier reading of build files
    removeRedundantAttributes: false,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  };
  const isEnvProduction = env === "production";

  // Custom HtmlWebpackPlugin instance for index (popup) page
  const indexHtmlPlugin = new HtmlWebpackPlugin({
    inject: true,
    chunks: ["popup"],
    template: paths.appHtml,
    filename: "popup.html",
    minify: isEnvProduction && minifyOpts,
  });
  // Replace origin HtmlWebpackPlugin instance in config.plugins with the above one
  config.plugins = replacePlugin(
    config.plugins,
    (name) => /HtmlWebpackPlugin/i.test(name),
    indexHtmlPlugin
  );

  // Extra HtmlWebpackPlugin instance for options page
  const optionsHtmlPlugin = new HtmlWebpackPlugin({
    inject: true,
    chunks: ["options"],
    template: paths.appPublic + "/options.html",
    filename: "options.html",
    minify: isEnvProduction && minifyOpts,
  });
  // Add the above HtmlWebpackPlugin instance into config.plugins
  // Note: you may remove/comment the next line if you don't need an options page
  config.plugins.push(optionsHtmlPlugin);

  // Custom ManifestPlugin instance to cast asset-manifest.json back to old plain format
  const manifestPlugin = new (ManifestPlugin.WebpackManifestPlugin ||
    ManifestPlugin)({
    fileName: "asset-manifest.json",
  });
  // Replace origin ManifestPlugin instance in config.plugins with the above one
  config.plugins = replacePlugin(
    config.plugins,
    (name) => /ManifestPlugin/i.test(name),
    manifestPlugin
  );

  // Custom MiniCssExtractPlugin instance to get rid of hash in filename template
  const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: "static/css/[name].css",
  });
  // Replace origin MiniCssExtractPlugin instance in config.plugins with the above one
  config.plugins = replacePlugin(
    config.plugins,
    (name) => /MiniCssExtractPlugin/i.test(name),
    miniCssExtractPlugin
  );

  // Remove GenerateSW plugin from config.plugins to disable service worker generation
  config.plugins = replacePlugin(config.plugins, (name) =>
    /GenerateSW/i.test(name)
  );

  // disable wrapping in bootstrap functions
  // https://stackoverflow.com/questions/66087526/webpack-do-not-use-webpackboostrap-function-wrappers
  // this is so background script functions are exposed to the global scope
  config.output.iife = false;

  // enable babel config file
  config.module.rules[1].oneOf[3].options.babelrc = true;

  // replace terser plugin with one that excludes background script
  // this is to workaround the tree shaking that removes unused functions
  const terserPlugin = new TerserPlugin({
    extractComments: true,
    parallel: true,
    exclude: /^background\.js$/,
  });
  config.optimization.minimizer = replacePlugin(
    config.optimization.minimizer,
    (name) => /TerserPlugin/i.test(name),
    terserPlugin
  );

  // temporarily disable minimizer (for more helpful error messages)
  config.optimization.minimize = false;
  config.optimization.minimizer = [];

  return config;
}

// Utility function to replace/remove specific plugin in a webpack config
function replacePlugin(plugins, nameMatcher, newPlugin) {
  const i = plugins.findIndex((plugin) => {
    return (
      plugin.constructor &&
      plugin.constructor.name &&
      nameMatcher(plugin.constructor.name)
    );
  });
  return i > -1
    ? plugins
        .slice(0, i)
        .concat(newPlugin || [])
        .concat(plugins.slice(i + 1))
    : plugins;
}

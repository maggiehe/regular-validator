var webpack = require('webpack'),
  PROD = process.env.NODE_ENV == 'production' ? true : false
var webpackConfig = {
  entry: {
    index: __dirname + "/src/index"
  },
  output: {
    filename: PROD ? "regular-validator.min.js" : "regular-validator.js",
    path: __dirname + '/dist/',
    library: 'RegularValidator',
    libraryTarget: "umd"
  },
  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : [],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: [
        __dirname + "/src",
        __dirname + "/node_modules"
      ]
    }]
  },
  externals: {
    "regularjs": "Regular"
  },
  devtool: "source-map"
}
module.exports = webpackConfig

const DEBUG = (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test');
console.log('Going to strip logging? ', !DEBUG);

const webpack = require('webpack'),
  path = require('path'),
  WebpackStrip = require('strip-loader'),
  UglifyJSPlugin = require('uglifyjs-webpack-plugin');
  
const config = {
  entry: {
    schedule: './src/schedule/main.ts'
    // test: './src/main.js'
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  plugins: [],
  module: {
    loaders: [
      {
        test: /\.ts?$/,
        loader: "ts-loader"
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        loader: 'css-loader!sass-loader'
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.css$/,
        loader: 'css-loader!postcss-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader?name=img/img-[hash:6].[ext]'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  }
};

if (!DEBUG) {
  // config.module.loaders.push(
  //   {
  //     test: /\.ts$/,
  //     loader: WebpackStrip.loader(
  //       'console.log',
  //       'Log.debug',
  //       'Log.time',
  //       'Log.timeEnd'
  //     )
  //   }
  // );

  config.plugins.push(
    new UglifyJSPlugin({
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    })
  );
}

module.exports = config;

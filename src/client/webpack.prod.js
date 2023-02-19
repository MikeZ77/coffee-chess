const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
      new webpack.DefinePlugin({
        'process.env.SERVER_FQDN': JSON.stringify(process.env.SERVER_FQDN),
        'process.env.CLIENT_GAME_CLOCK_TICK_MS': JSON.stringify(
          process.env.CLIENT_GAME_CLOCK_TICK_MS
        ),
        'process.env.GAME_CLOCK_SERVER_SYNC_MS': JSON.stringify(
          process.env.GAME_CLOCK_SERVER_SYNC_MS
        ),
        'process.env.GAME_CHAT_CLIENT_TIMEOUT_MS': JSON.stringify(
          process.env.GAME_CHAT_CLIENT_TIMEOUT_MS
        ),
        'process.env.GAME_LOW_TIME_MS': JSON.stringify(process.env.GAME_LOW_TIME_MS),
        'process.env.DISCONNECT_NOTIFICATION_INTERVAL': JSON.stringify(
          process.env.DISCONNECT_NOTIFICATION_INTERVAL
        )
      })
    ]
  }
});

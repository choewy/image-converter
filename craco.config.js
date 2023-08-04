var path = require('path');

module.exports = {
  webpack: {
    alias: { '@': path.resolve(__dirname, 'src') },
    externals: {
      'ffmpeg-static-electron': 'commonjs2 ffmpeg-static-electron',
      'ffprobe-static-electron': 'commonjs2 ffprobe-static-electron',
    },
  },
};

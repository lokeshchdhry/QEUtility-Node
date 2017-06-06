var exec = require('child_process').exec,
bold = require('../misc/util').bold,
underline = require('../misc/util').underline,
cyan = require('../misc/util').cyan,
errorNExit = require('../misc/util').errorNExit;


module.exports = function package_sdk(callback) {
  //Package the SDK
  exec('node scons.js package', {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      errorNExit(err);
    }
    console.log(underline(bold('\n\u25B6 INSTALLING THE SDK:')));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(cyan(data));
  });
};

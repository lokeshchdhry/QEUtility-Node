var exec = require('child_process').exec,
    cyan = require('../misc/util').cyan,
    errorNExit = require('../misc/util').errorNExit,
    underline = require('../misc/util').underline;


module.exports = function install_sdk(callback) {
  console.log(underline(bold('\n\u25B6 INSTALLING THE SDK:')));
  //Install the SDK
  exec('node scons.js install', {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      errorNExit(err);
    }
    console.log('\n\u2714 Done, please find the installed SDK in your titanium folder');
    console.log('');
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(cyan(data));
  });
};

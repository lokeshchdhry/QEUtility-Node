var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function install_sdk(callback) {
  //Install the SDK
  exec('node scons.js install', {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    console.log('\n\u2714 Done, please find the installed SDK in your titanium folder');
    console.log('');
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};

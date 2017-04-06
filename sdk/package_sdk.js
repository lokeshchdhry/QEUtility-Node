var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function package_sdk(callback) {
  //Package the SDK
  exec('node scons.js package', {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    console.log(util.underline(util.bold('\n\u25B6 INSTALLING THE SDK:')));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};

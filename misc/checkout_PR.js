var exec = require('child_process').exec;
var util = require('../misc/util');
var path = require('path');

module.exports = function checkout_PR(prNo, component ,callback) {
  exec('git checkout pr/' + prNo, {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    if(component === 'sdk'){
      //CD into the build folder in the repo.
      var buildpath = path.join(util.sdk_dir, '/titanium_mobile', '/build');
      process.chdir(buildpath);
    }
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};

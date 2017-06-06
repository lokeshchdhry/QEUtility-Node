var exec = require('child_process').exec,
cyan = require('../misc/util').cyan,
bold = require('../misc/util').bold,
underline = require('../misc/util').underline,
sdk_dir = require('../misc/util').sdk_dir,
path = require('path');

module.exports = {
  npmInstallSDK: function(callback) {
    //install needed stuff
    exec('npm install', function(err) {
      if (err) {
        errorNExit(err);
      }
      //cd into build after npm install due to https://github.com/appcelerator/titanium_mobile/pull/8974
      var buildFldrPath = path.join(sdk_dir, 'titanium_mobile', 'build');
      process.chdir(buildFldrPath);
      console.log(underline(bold('\n\u25B6 BUILDING THE SDK:')));
      callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(cyan(data));
    });
  },

  buildSDKFunc: function(callback) {
    //Build the SDK
    exec('node scons.js build', {
      maxBuffer: 1024 * 500
    }, function(err) {
      if (err) {
        errorNExit(err);
      }
      console.log(underline(bold('\n\u25B6 PACKAGING THE SDK:')));
      callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(cyan(data));
    });
  }
};

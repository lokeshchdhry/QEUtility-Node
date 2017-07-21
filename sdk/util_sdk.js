var exec = require('child_process').exec,
    cyan = require('../misc/util').cyan,
    bold = require('../misc/util').bold,
    underline = require('../misc/util').underline,
    sdk_dir = require('../misc/util').sdk_dir,
    path = require('path'),
    errorNExit = require('../misc/util').errorNExit;

module.exports = {
  npmInstallSDK: function(callback) {
    console.log(underline(bold('\n\u25B6 RUNNING NPM INSTALL:')));
    //install needed stuff
    exec('npm install', function(err) {
      if (err) {
        errorNExit(err);
      }
      return callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(cyan(data));
    });
  },

  buildSDKFunc: function(callback) {
    console.log(underline(bold('\n\u25B6 BUILDING THE SDK:')));
    //cd into build
    var buildFldrPath = path.join(sdk_dir, 'titanium_mobile', 'build');
    process.chdir(buildFldrPath);
    //Build the SDK
    exec('node scons.js build', {
      maxBuffer: 1024 * 500
    }, function(err) {
      if (err) {
        errorNExit(err);
      }
      return callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(cyan(data));
    });
  }
};

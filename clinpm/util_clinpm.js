var exec = require('child_process').exec,
util = require('../misc/util');

module.exports = {
  npm_install_prod: function npm_install_prod(callback) {
    //install needed stuff
    exec('npm install --production', function(err) {
      if (err) {
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }
      callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(util.cyan(data));
    });
  },

  npm_link: function npm_link(callback) {
    //Build the SDK
    exec('sudo npm link', {
      maxBuffer: 1024 * 500
    }, function(err) {
      if (err) {
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }
      console.log('');
      console.log('\u2714 Done building & installing appc NPM.');
      callback(null, null);
    }).stdout.on('data', function(data) {
      console.log(util.cyan(data));
    });
  }
};

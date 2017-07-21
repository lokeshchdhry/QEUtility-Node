var execute = require('../misc/util').execute,
    cyan = require('../misc/util').cyan,
    error = require('../misc/util').error,
    errorNExit = require('../misc/util').errorNExit,
    inquirer = require('inquirer');

module.exports = function(){
  var questions = [{
    name: 'appc_npm_ver',
    type: 'input',
    message: 'Enter the Appc NPM version which you would like to download(e.g: 4.2.8) :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the Appc NPM version which you would like to download.';
      }
    }
  }];
  inquirer.prompt(questions).then(function(answers) {
    var version = answers.appc_npm_ver;
    console.log('\n\u25B6 Downloading & installing Appc NPM version : '+cyan(version));
    var cmd = 'sudo npm install -g appcelerator@'+version;
    execute(cmd, function(err, data){
      if(err){
        errorNExit(err);
      }
      console.log(cyan(data.trim()));
      console.log('Done\n');
    });
  });
};

var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');

module.exports = function(){
  getAppcNPMVer(function(err, ver){
    if(err){
      util.error(err);
      //exit process in case of error
      process.exit();
    }
    downloadAppcNPM(ver.appc_npm_ver);
  });
};

function getAppcNPMVer(callback) {
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
    callback(null, answers);
  });
}

function downloadAppcNPM(version){
  console.log('\n\u25B6 Downloading & installing Appc NPM version : '+util.cyan(version));
  exec('sudo npm install -g appcelerator@'+version, function(err, data){
    if(err){
      util.error(err);
      //exit process in case of error
      process.exit();
    }
    console.log(util.cyan(data));
    console.log('Done');
  });
}

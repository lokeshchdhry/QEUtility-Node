var inquirer = require('inquirer');
var exec = require('child_process').exec;
var util = require('../misc/util');
var spawn = require('child_process').spawn;

module.exports = function(){
  get_sdk_ver(function(err, ver){
    if(err){
      //exit process in case of error
      process.exit();
    }
    // var version = ver.sdk_ver;
    download(ver.sdk_ver, function(err, data){
      if(err){
        //exit process in case of error
        process.exit();
      }
      // console.log(util.cyan('Done'));
    });
  });
};

function get_sdk_ver(callback) {
  var questions = [{
    name: 'sdk_ver',
    type: 'input',
    message: 'What SDK version would you like to download :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the SDK version would you like to download';
      }
    }
  }];
  inquirer.prompt(questions).then(function(answers) {
    callback(null, answers);
  });
}

function download(ver, callback){
  console.log('');
  exec('appc ti sdk install -b '+ver+' --default', function(err, data) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    console.log(util.cyan('Done'));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
}

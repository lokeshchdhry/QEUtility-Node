var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');

module.exports = function(){
  selectSDK();
};

function selectSDK(){
  var questions = [{
    name: 'sdk_ver',
    type: 'input',
    message: 'Enter the SDK version which you would like to select :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the SDK version which you would like to select.';
      }
    }
  }];
  inquirer.prompt(questions).then(function(answers) {
    exec('appc ti sdk select '+answers.sdk_ver, function(err, data){
      if(err){
        util.error(err);
        //exit process in case of error
        process.exit();
      }
      console.log(util.cyan('\n'+data));
    });
  });
}

var inquirer = require('inquirer');
var cyan = require('../misc/util').cyan;
var errorNExit = require('../misc/util').errorNExit;
var execute = require('../misc/util').execute;

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
    execute('appc ti sdk select '+answers.sdk_ver, function(err, data){
      if(err){
        errorNExit(err);
      }
      console.log(cyan('\n'+data));
    });
  });
}

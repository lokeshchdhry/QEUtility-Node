var Async = require('async');
var inquirer = require('inquirer');
var execute = require('../misc/util').execute;
var cyan = require('../misc/util').cyan;
var errorNExit = require('../misc/util').errorNExit;
var username = require('../misc/util').username;
var password = require('../misc/util').password;
var underline = require('../misc/util').underline;
var prodOrgId = require('../misc/util').prod_org_id;
var preProdOrgId = require('../misc/util').preprod_org_id;

module.exports = function(){
  inquirer.prompt({
    type: 'list',
    name: 'env_opt',
    message: 'Which environment would you like to be in ?',
    choices: [{
      name: 'PRODUCTION',
      value: 'production'
    },
    {
      name: 'PRE-PRODUCTION',
      value: 'preproduction'
    },
    {
      name: 'EXIT',
      value: 'exit'
    }]
  }).then(function (answers) {
    //Exit if EXIT
    if(answers.env_opt === 'exit'){
      //Quit the process
      process.exit();
    }
    var task = [];
    task.push(function(callback){logout(callback);});
    task.push(function(callback){setDefaultEnv(callback, answers.env_opt);});
    task.push(function(callback){login(callback, username, password, answers.env_opt);});

    Async.series(task, function(err, results){
      if(err){
        errorNExit(err);
      }
    });
  });
};

var logout = function(callback){
  console.log(underline('\n\u25B6 Logging you out:'));
  execute('appc logout', function(err, data){
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    callback(null, null);
  });
};

var setDefaultEnv = function(callback, environment){
  console.log(underline('\u25B6 Setting defaultEnvironment to '+environment));
  execute('appc config set defaultEnvironment '+environment, function(err, data){
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    callback(null, null);
  });
};

var login = function(callback, username, password, env){
  if(env === 'production'){
    console.log(underline('\n\u25B6 Logging you in:'));
    execute('appc login --username '+username+' --password '+password+' --org-id '+prodOrgId, function(err, data){
      if (err) {
        errorNExit(err);
      }
      console.log(cyan(data));
      callback(null, null);
    });
  }
  else{
    console.log(underline('\n\u25B6 Logging you in:'));
    execute('appc login --username '+username+' --password '+password+' --org-id '+preProdOrgId, function(err, data){
      if (err) {
        errorNExit(err);
      }
      console.log(cyan(data));
      callback(null, null);
    });
  }
};

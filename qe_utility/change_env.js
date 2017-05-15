var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');
var Async = require('async');
var inquirer = require('inquirer');

module.exports = function(){
  //Getting username & password from storage
  var username = util.username;
  var password = util.password;

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
    }]
  }).then(function (answers) {
    console.log(answers.env_opt);
    var task = [];
    task.push(function(callback){logout(callback);});
    task.push(function(callback){setDefaultEnv(callback, answers.env_opt);});
    task.push(function(callback){login(callback, username, password, answers.env_opt);});

    Async.series(task, function(err, results){
      if(err){
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }
    });
  });
};

function logout(callback){
  console.log(util.underline('\n\u25B6 Logging you out:'));
  exec('appc logout', function(err, data){
    if(err){
      //exit process in case of error
      process.exit();
    }
    console.log(util.cyan(data));
    callback(null, null);
  });
}

function setDefaultEnv(callback, environment){
  console.log(util.underline('\u25B6 Setting defaultEnvironment to '+environment));
  exec('appc config set defaultEnvironment '+environment, function(err, data){
    if(err){
      //exit process in case of error
      process.exit();
    }
    console.log(util.cyan(data));
    callback(null, null);
  });
}

function login(callback, username, password, env){
  if(env === 'production'){
    console.log(util.underline('\n\u25B6 Logging you in:'));
    exec('appc login --username '+username+' --password '+password+' --org-id '+util.prod_org_id, function(err, data){
      if(err){
        //exit process in case of error
        process.exit();
      }
      console.log(util.cyan(data));
      callback(null, null);
    });
  }
  else{
    console.log(util.underline('\n\u25B6 Logging you in:'));
    exec('appc login --username '+username+' --password '+password+' --org-id '+util.preprod_org_id, function(err, data){
      if(err){
        //exit process in case of error
        process.exit();
      }
      console.log(util.cyan(data));
      callback(null, null);
    });
  }
}

var Async = require('async'),
  inquirer = require('inquirer'),
  execute = require('../misc/util').execute,
  cyan = require('../misc/util').cyan,
  errorNExit = require('../misc/util').errorNExit,
  username = require('../misc/util').username,
  password = require('../misc/util').password,
  underline = require('../misc/util').underline,
  bold = require('../misc/util').bold,
  prodOrgId = require('../misc/util').prod_org_id,
  preProdOrgId = require('../misc/util').preprod_org_id;

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
  console.log(bold(underline('\n\u25B6 LOGGING YOU OUT:')));
  execute('appc logout', function(err, data){
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    return callback(null, null);
  });
};

var setDefaultEnv = function(callback, environment){
  console.log(bold(underline('\u25B6 SETTING DEFAULT ENVIRONMENT TO '+environment.toUpperCase())));
  execute('appc config set defaultEnvironment '+environment, function(err, data){
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    return callback(null, null);
  });
};

var login = function(callback, username, password, env){
  //Determining which org ID to use
  var orgID = (env === 'production')? prodOrgId : preProdOrgId;
    console.log(bold(underline('\n\u25B6 LOGGING YOU IN:')));
    execute('appc login --username '+username+' --password '+password+' --org-id '+orgID, function(err, data){
      if (err) {
        errorNExit(err);
      }
      console.log(cyan(data));
      return callback(null, null);
    });
};

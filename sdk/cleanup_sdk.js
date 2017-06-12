var storage = require('node-persist'),
inquirer = require('inquirer'),
chalk = require('chalk'),
Async = require('async'),
dirPath = require('path'),
getPR_No = require('../misc/util').getPR_No,
errorNExit = require('../misc/util').errorNExit,
sdk_dir = require('../misc/util').sdk_dir,
cyan = require('../misc/util').cyan,
bold = require('../misc/util').bold,
underline = require('../misc/util').underline,
spinner_start = require('../misc/util').spinner_start,
spinner_stop = require('../misc/util').spinner_stop,
execute = require('../misc/util').execute;

module.exports = function() {
    console.log('');
    //Initialize node persist.
    storage.initSync();
    var path = dirPath.join(sdk_dir, '/titanium_mobile');
    //CD in to TIMOB repo dir.
    process.chdir(path);

    getPR_No(function(PR){
      if(PR !== ''){
        question(PR, function(flag){
          if(flag){
            var tasks = [];
            tasks.push(function(callback) {checkoutMaster(callback);});
            tasks.push(function(callback) {deleteBranch(PR, callback);});
            tasks.push(function(callback) {fetchOrigin(callback);});

            Async.series(tasks, function(err, data){
              if(err){
                errorNExit(err);
              }
            });
          }
          else{
            //exit process if answer to question is NO
            process.exit();
          }
        });
      }
      else{
        console.log(bold('\u2717 No branch exists. Please proceed to build for a PR'));
        console.log('');
      }
    });

};

var checkoutMaster = function(callback){
  console.log(underline(bold('\n\u25B6 CHECKING OUT TO MASTER. PLEASE WAIT.')));
  spinner_start();
  execute('git checkout master', function(err, data) {
      if (err) {
          errorNExit(err);
      }
      spinner_stop(true);
      console.log(cyan(data));
      callback(null, null);
    });
};

var deleteBranch = function(pr_no, callback){
  //Deleting the branch of the PR
  console.log(underline(bold('\n\u25B6 DELETING THE PR BRANCH.')));
  spinner_start();
  execute('git branch -D' + pr_no, function(err, data) {
      if (err) {
          errorNExit(err);
      }
      spinner_stop(true);
      console.log(cyan(data));
      callback(null, null);
    });
};

var fetchOrigin = function(callback){
  //Doing git fetch origin
  console.log(underline(bold('\n\u25B6 FETCHING AGAIN FROM ORIGIN. PLEASE WAIT.')));
  spinner_start();
  execute('git fetch origin', function(err, data) {
      if (err) {
          errorNExit(err);
      }
      spinner_stop(true);
      console.log(cyan(data));
      console.log(cyan('DONE'));
      callback(null, null);
  });
};

var question = function(pr_no, callback){
  var questions = [{
      name: 'pr_number',
      type: 'confirm',
      message: 'Are you sure you want to delete branch for' + cyan(pr_no)
  }];
  inquirer.prompt(questions).then(function(answers) {
    if(answers.pr_number){
      callback(true);
    }
    else{
      callback(false);
    }
  });
};

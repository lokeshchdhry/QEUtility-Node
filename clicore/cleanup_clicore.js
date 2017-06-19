var storage = require('node-persist'),
  inquirer = require('inquirer'),
  getPR_No = require('../misc/util').getPR_No,
  Async = require('async'),
  dir_path = require('path'),
  execute = require('../misc/util').execute,
  errorNExit = require('../misc/util').errorNExit,
  bold = require('../misc/util').bold,
  underline = require('../misc/util').underline,
  cyan = require('../misc/util').cyan;

module.exports = function() {
    console.log('');
    //Initialize node persist.
    storage.initSync();
    var path = dir_path.join(util.sdk_dir, '/titanium_mobile');
    //CD in to TIMOB repo dir.
    process.chdir(path);

    pr.getPR_No(function(PR){
      if(PR !== ''){
        var pr_no = PR;
        question(pr_no, function(flag){
          if(flag){
            var tasks = [];
            tasks.push(function(callback) {checkout_master(callback);});
            tasks.push(function(callback) {delete_branch(pr_no, callback);});
            tasks.push(function(callback) {fetch_origin(callback);});

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
        console.log(bold('\u2717 No branch exists. Please proceed to build for a PR\n'));
      }
    });

};

function checkout_master(callback){
  console.log(underline(bold('\n\u25B6 CHECKING OUT TO MASTER. PLEASE WAIT.')));
  exec('git checkout master', function(err, data) {
      if (err) {
          errorNExit(err);
      }
      console.log(cyan(data));
      return callback(null,null);
    });
}

function delete_branch(pr_no, callback){
  //Deleting the branch of the PR
  console.log(underline(bold('\n\u25B6 DELETING THE PR BRANCH.')));
  exec('git branch -D' + pr_no, function(err, data) {
      if (err) {
          errorNExit(err);
      }
      console.log(cyan(data));
      return callback(null, null);
    });
}

function fetch_origin(callback){
  //Doing git fetch origin
  console.log(underline(bold('\n\u25B6 FETCHING AGAIN FROM ORIGIN. PLEASE WAIT.')));
  exec('git fetch origin', function(err, data) {
      if (err) {
          errorNExit(err);
      }
      console.log(cyan(data));
      console.log(cyan('DONE'));
      return callback(null, null);
  });
}

function question(pr_no, callback){
  var questions = [{
      name: 'pr_number',
      type: 'confirm',
      message: 'Are you sure you want to delete branch for' + cyan(pr_no)
  }];
  inquirer.prompt(questions).then(function(answers) {
    if(answers.pr_number){
      return callback(true);
    }
    else{
      return callback(false);
    }
  });
}

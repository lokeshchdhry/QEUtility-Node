var exec = require('child_process').exec;
var storage = require('node-persist');
var inquirer = require('inquirer');
var chalk = require('chalk');
var util = require('../misc/util');
var pr = require('../misc/get_PR');
var Async = require('async');
var dir_path = require('path');

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
                console.log(util.error(err));
                //exit process in case of error
                process.exit();
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
        console.log(util.bold('\u2717 No branch exists. Please proceed to build for a PR'));
        console.log('');
      }
    });

};

function checkout_master(callback){
  console.log(util.underline(util.bold('\n\u25B6 CHECKING OUT TO MASTER. PLEASE WAIT.')));
  exec('git checkout master', function(err) {
      if (err) {
          console.log(util.error(err));
          //exit process in case of error
          process.exit();
      }
      callback(null,null);
    }).stdout.on('data', function(data) {
        console.log(util.cyan(data));
    });
}

function delete_branch(pr_no, callback){
  //Deleting the branch of the PR
  console.log(util.underline(util.bold('\n\u25B6 DELETING THE PR BRANCH.')));
  exec('git branch -D' + pr_no, function(err) {
      if (err) {
          console.log(util.error(err));
      }
      callback(null, null);
    }).stdout.on('data', function(data) {
        console.log(util.cyan(data));
    });
}

function fetch_origin(callback){
  //Doing git fetch origin
  console.log(util.underline(util.bold('\n\u25B6 FETCHING AGAIN FROM ORIGIN. PLEASE WAIT.')));
  exec('git fetch origin', function(err) {
      if (err) {
          console.log(util.error(err));
      }
      console.log(util.cyan('DONE'));
      callback(null, null);
  }).stdout.on('data', function(data) {
      console.log(util.cyan(data));
  });
}

function question(pr_no, callback){
  var questions = [{
      name: 'pr_number',
      type: 'confirm',
      message: 'Are you sure you want to delete branch for' + util.cyan(pr_no)
  }];
  inquirer.prompt(questions).then(function(answers) {
    if(answers.pr_number){
      callback(true);
    }
    else{
      callback(false);
    }
  });
}

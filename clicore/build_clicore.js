var util = require('../misc/util');
var fs = require('fs');
var inquirer = require('inquirer');
var exec = require('child_process').exec;
var fetch_PR = require('../misc/util').fetch_PR;
var questionPR = require('../misc/util').questionPR;
var checkoutPR = require('../misc/util').checkoutPR;
var Async = require('async');
var getPR_No = require('../misc/util').getPR_No;
var dir_path = require('path');
var repo_check = require('../misc/util').repo_check;

module.exports = function(){
  var name = 'clicore';
  repo_check(name, function(flag){
    if(flag){
      //Get appc cli core install path from storage
      var install_path = util.clicore_dir;
      // var pkg_path = install_path+'/package';
      var pkg_path = dir_path.join(install_path, '/package');
      var ver = '1.0.0';

      //Get the current PR number.
      process.chdir(dir_path.join(pkg_path, '/appc-cli'));
      var pr_no;
      getPR_No(function(PR) {
        pr_no = PR;
        if (pr_no !== '') {
          console.log('');
          //Ask question
          var questions = [{
            name: 'choice',
            type: 'confirm',
            message: 'You are already on a PR branch' + util.cyan(pr_no) + 'Do you want to rebuild for the same PR ?'
          }];
          inquirer.prompt(questions).then(function(answer) {
            if (!answer.choice) {
              console.log('');
              console.log("Please run " + util.cyan('appcfr cleanup -c sdk') + " first before you build again.");
              console.log('');
            } else if (answer.choice) {
              console.log('');
              console.log(util.bold(util.underline('\u25B6 Rebuilding the cli core for' + pr_no)));
              console.log('@@@@@@'+pkg_path);
              console.log('@@@@@@'+pr_no);
              build(pkg_path, pr_no);
            }
          });
        } else {
          build(pkg_path);
        }
      });
    }
    console.log('');
    console.log(util.cyan('\u2717 Repo for CLI Core does not exist. Please use "appcfr clone -c clicore" to clone.'));
    console.log('');
  });
  // //Get appc cli core install path from storage
  // var install_path = util.clicore_dir;
  // var pkg_path = install_path+'/package';
  // var ver = '1.0.0';
  //
  // //Get the current PR number.
  // process.chdir(pkg_path+'/appc-cli');
  // var pr_no;
  // pr.getPR_No(function(PR) {
  //   pr_no = PR;
  //   if (pr_no !== '') {
  //     console.log('');
  //     //Ask question
  //     var questions = [{
  //       name: 'choice',
  //       type: 'confirm',
  //       message: 'You are already on a PR branch' + util.cyan(pr_no) + 'Do you want to rebuild for the same PR ?'
  //     }];
  //     inquirer.prompt(questions).then(function(answer) {
  //       if (!answer.choice) {
  //         console.log('');
  //         console.log("Please run " + util.cyan('appcfr cleanup -c sdk') + " first before you build again.");
  //         console.log('');
  //       } else if (answer.choice) {
  //         console.log('');
  //         console.log(util.bold(util.underline('\u25B6 Rebuilding the cli core for' + pr_no)));
  //         console.log('@@@@@@'+pkg_path);
  //         console.log('@@@@@@'+pr_no);
  //         build(pkg_path, pr_no);
  //       }
  //     });
  //   } else {
  //     build(pkg_path);
  //   }
  // });
};

var build = function(path, prNumber){
  if (prNumber === undefined) {
    var task = [];
    task.push(function(callback){change_dir(dir_path.join(path, '/appc-cli'), callback);});
    task.push(function(callback){fetch_PR(callback);});
    task.push(function(callback){question_PR(callback);});

    Async.series(task, function(err, results){
      if(err){
        console.log(util.error(err));
        // Exit the process
        process.exit();
      }
      var PR_NO = results[2].pr_no;
      build_pr(path, PR_NO);
    });
  }
  else{
    build_pr(path, prNumber.slice(4));
  }

  var build_pr = function(path, prNo){
    var task1 = [];
    task1.push(function(callback){change_dir(dir_path.join(path, '/appc-cli'), callback);});
    task1.push(function(callback){checkout_PR(prNo, 'clicore', callback);});
    task1.push(function(callback){install_core(callback);});
    task1.push(function(callback){appc_use('1.0.0', callback);});

    Async.series(task1, function(err, results){
      if(err){
        console.log(util.error(err));
        // Exit the process
        process.exit();
      }
      console.log('');
      console.log(util.cyan('DONE'));
    });
  };
};

function change_dir(path, callback){
  try{
    process.chdir(path);
    callback(null, null);
  }
  catch(err){
    console.log(util.error(err));
    //exit process in case of error
    process.exit();
  }
}

function install_core(callback){
  exec('sudo npm install --production', function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    } else {
      callback(null, null);
    }
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
}

function appc_use(ver, callback){
  exec('appc use '+ver, function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    } else {
      callback(null, null);
    }
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
}

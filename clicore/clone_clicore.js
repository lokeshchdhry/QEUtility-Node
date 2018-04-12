var util = require('../misc/util');
var fs = require('fs');
var inquirer = require('inquirer');
var exec = require('child_process').exec;
var fetch_PR = require('../misc/util').fetch_PR;
var questionPR = require('../misc/util').questionPR;
var checkoutPR = require('../misc/util').checkoutPR;
var Async = require('async');
var dir_path = require('path');

module.exports = function(){
  //Get appc cli core install path from storage
  var install_path = util.clicore_dir;
  var pkg_path = dir_path.join(install_path, '/package');
  var ver = '1.0.0';

  //Checking if package folder exists, if not create it
  fs.exists(pkg_path, function(exists){
    if(!exists){
      fs.mkdirSync(install_path);
      // fs.mkdirSync(dir_path.join(install_path, '/package'));
      var pkgPath = fs.mkdirSync(dir_path.join(install_path, '/package'));
      //change dir to package dir
      process.chdir(pkg_path);
    }
    else{
      //cd into the package folder
      process.chdir(pkg_path);
    }

    //Call clone_clicore function with callback from below
    clone_clicore(util.repolink_clicore, pkg_path);

    // var task = [];
    // // task.push(function(callback){clone(callback);});
    // task.push(function(callback){clone_clicore(util.repolink_clicore, pkg_path, callback);});
    // task.push(function(callback){change_dir(pkg_path+'/appc-cli', callback);});
    // task.push(function(callback){fetch_PR(callback);});
    // task.push(function(callback){question_PR(callback);});
    //
    // Async.series(task, function(err, results){
    //   if(err){
    //     console.log(util.error(err));
    //     // Exit the process
    //     process.exit();
    //   }
    //   var PR_NO = results[3].pr_no;
    //
    //   var task1 = [];
    //   task1.push(function(callback){checkout_PR(PR_NO, 'clicore', callback);});
    //   task1.push(function(callback){install_core(callback);});
    //   task1.push(function(callback){appc_use(ver, callback);});
    //
    //   Async.series(task1, function(err, results){
    //     if(err){
    //       console.log(util.error(err));
    //       // Exit the process
    //       process.exit();
    //     }
    //     console.log('');
    //     console.log(util.cyan('DONE'));
    //   });
    // });
  });
};


function clone_clicore(repo_link, repo_dir) {
  process.chdir(repo_dir);
  console.log('\n\u25B6 Cloning appc-cli repo .... Please Wait.');
  //Starting spinner
  util.spinner_start();

  exec('git clone ' + repo_link, function(err) {
    if (err) {
      console.log(util.error(err));
      //Stop the process
      process.exit();
    } else {
      //Stop spinner
      util.spinner_stop(true);
      console.log(util.cyan('\n\n\u2714 Cloning done successfully.'));
      process.chdir(dir_path.join(repo_dir, '/appc-cli/.git'));
      //Call modify_config from utils.js
      util.modify_config(function(done){
        if(done){
          console.log(util.cyan('\n\u2714 Done modifying the the config file.\n'));
          // callback(null, null);
        }
      });
    }
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
}

// function change_dir(path, callback){
//   try{
//     process.chdir(path);
//     // callback(null, null);
//   }
//   catch(err){
//     console.log(util.error(err));
//     //exit process in case of error
//     process.exit();
//   }
// }
//
// function install_core(callback){
//   exec('sudo npm install --production', function(err) {
//     if (err) {
//       console.log(util.error(err));
//       //exit process in case of error
//       process.exit();
//     } else {
//       callback(null, null);
//     }
//   }).stdout.on('data', function(data) {
//     console.log(util.cyan(data));
//   });
// }
//
// function appc_use(ver, callback){
//   exec('appc use '+ver, function(err) {
//     if (err) {
//       console.log(util.error(err));
//     } else {
//       callback(null, null);
//     }
//   }).stdout.on('data', function(data) {
//     console.log(util.cyan(data));
//   });
// }

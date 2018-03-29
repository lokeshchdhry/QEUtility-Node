#!/usr/bin/env node
var cloneRepo_SDK = require('./sdk/clone_sdk'),
    cloneRepo_NPM = require('./clinpm/clone_clinpm'),
    cloneRepo_CLICore = require('./clicore/clone_clicore'),
    build_sdk = require('./sdk/build_sdk'),
    build_clinpm = require('./clinpm/build_clinpm'),
    build_clicore = require('./clicore/build_clicore'),
    cleanup_sdk = require('./sdk/cleanup_sdk'),
    cleanup_clinpm = require('./clinpm/cleanup_clinpm'),
    cleanup_clicore = require('./clicore/cleanup_clicore'),
    clearMem = require('./misc/clear_mem'),
    setup = require('./setup/setup'),
    stored_paths = require('./setup/stored_paths'),
    util = require('./misc/util'),
    components = require('./qe_utility/components'),
    install_core = require('./qe_utility/install_core'),
    install_appc_npm = require('./qe_utility/install_appc_npm'),
    install_sdk = require('./qe_utility/install_sdk'),
    select_sdk = require('./qe_utility/select_sdk'),
    changeEnv = require('./qe_utility/change_env'),
    removeApps = require('./qe_utility/remove_apps.js'),
    inquirer = require('inquirer'),
    setup_runcount = require('./misc/util').runcount;

//Getting the value of runCount from storage
//Checking if SETUP has beed run before, if not run setup or else show the menu
if( setup_runcount === undefined){
  console.log('');
  var questions = [{
      name: 'run_check',
      type: 'confirm',
      message: '\"SETUP\" has to been run atleast once before using this tool. Would you like to continue?'
  }];
  inquirer.prompt(questions).then(function(answers) {
    if(answers.run_check){
      //Run setup
      setup();
    }
    else{
      //Exiting the process
      process.exit();
    }
  });
}
else{
  inquirer.prompt({
    type: 'list',
    name: 'main_options',
    message: 'What would you like to do ?',
    choices: [{
      name: 'RUN QE UTILITY',
      value: 'qe_utility'
    },
    {
      name: 'FR TOOLS FOR SDK',
      value: 'sdk_fr'
    },{
      name: 'FR TOOLS FOR CLI NPM',
      value: 'clinpm_fr'
    },{
      name: 'FR TOOLS FOR CLI CORE',
      value: 'clicore_fr'
    },{
      name: 'SETUP',
      value: 'setup'
    },{
      name: 'EXIT',
      value: 'exit'
    }]
  }).then(function (answers) {
    switch(answers.main_options){
      case 'qe_utility':
      inquirer.prompt({
        type: 'list',
        name: 'qe_util_opt',
        message: 'What would you like to do in QE Utility ?',
        choices: [{
          name: 'CHECK INSTALLED COMPONENTS',
          value:'compo'
        },
        {
          name: 'INSTALL APPC CORE',
          value:'install_core'
        },
        {
          name: 'INSTALL APPC NPM',
          value:'install_appc_npm'
        },
        {
          name: 'INSTALL TITANIUM SDK',
          value:'install_sdk'
        },
        {
          name: 'SELECT SPECIFIC TITANIUM SDK',
          value:'select_sdk'
        },
        {
          name: 'CHANGE ENVIRONMENT',
          value:'change_env'
        },
        {
          name: 'UNINSTALL APPS',
          value:'remove_apps'
        },
        {
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(function(answers){
        exec_qe_utility(answers.qe_util_opt);
      });
      break;

      case 'sdk_fr':
      inquirer.prompt({
        type: 'list',
        name: 'sdk_fr_opt',
        message: 'What would you like to do ?',
        choices: [{
          name: 'CLONE TIMOB SDK REPO',
          value:'clone_sdk'
        },
        {
          name: 'BUILD SDK FOR PR',
          value:'build_sdk'
        },
        {
          name: 'CLEANUP SDK',
          value:'clean_sdk'
        },{
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(function(answers){
        exec_sdk_fr(answers.sdk_fr_opt);
      });
      break;

      case 'clinpm_fr':
      inquirer.prompt({
        type: 'list',
        name: 'clinpm_fr_opt',
        message: 'What would you like to do ?',
        choices: [{
          name: 'CLONE APPC CLI NPM REPO',
          value:'clone_clinpm'
        },
        {
          name: 'BUILD APPC CLI NPM',
          value:'build_clinpm'
        },
        {
          name: 'CLEANUP APPC CLI NPM',
          value:'clean_clinpm'
        },{
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(function(answers){
        exec_clinpm_fr(answers.clinpm_fr_opt);
      });
      break;

      case 'clicore_fr':
      inquirer.prompt({
        type: 'list',
        name: 'clicore_fr_opt',
        message: 'What would you like to do ?',
        choices: [{
          name: 'CLONE APPC CLI CORE REPO',
          value:'clone_clicore'
        },
        {
          name: 'BUILD APPC CLI CORE',
          value:'build_clicore'
        },
        {
          name: 'CLEANUP APPC CLI CORE',
          value:'clean_clicore'
        },{
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(function(answers){
        exec_clicore_fr(answers.clicore_fr_opt);
      });
      break;

      case 'setup':
      inquirer.prompt({
        type: 'list',
        name: 'setup_opt',
        message: 'What would you like to do ?',
        choices: [{
          name: 'RUN SETUP',
          value:'run_setup'
        },
        {
          name: 'CHECK STORED PATHS',
          value:'stored_paths'
        },{
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(function(answers){
        setup_opt(answers.setup_opt);
      });
      break;

      case 'exit':
      exit_func();
      break;
    }
  });

  var exec_qe_utility = function(task){
    switch(task){
      case 'compo':
      components();
      break;

      case 'install_core':
      install_core();
      break;

      case 'install_appc_npm':
      install_appc_npm();
      break;

      case 'install_sdk':
      install_sdk();
      break;

      case 'select_sdk':
      select_sdk();
      break;

      case 'change_env':
      changeEnv();
      break;

      case 'remove_apps':
      removeApps();
      break;

      case 'exit':
      exit_func();
      break;

      default:
      console.log('Invalid utility option');
    }
  };

  var exec_sdk_fr = function(task){
    switch(task){
      case 'clone_sdk':
      cloneRepo_SDK();
      break;

      case 'build_sdk':
      build_sdk();
      break;

      case 'clean_sdk':
      cleanup_sdk();
      break;

      case 'exit':
      exit_func();
      break;

      default:
      console.log('Invalid sdk option');
    }
  };

  var exec_clinpm_fr = function(task){
    switch(task){
      case 'clone_clinpm':
      cloneRepo_NPM();
      break;

      case 'build_clinpm':
      build_clinpm();
      break;

      case 'clean_clinpm':
      cleanup_clinpm();
      break;

      case 'exit':
      exit_func();
      break;

      default:
      console.log('Invalid CLI NPM option');
    }
  };

  var exec_clicore_fr = function(task){
    switch(task){
      case 'clone_clicore':
      cloneRepo_CLICore();
      break;

      case 'build_clicore':
      build_clicore();
      break;

      case 'clean_clicore':
      cleanup_clicore();
      break;

      case 'exit':
      exit_func();
      break;

      default:
      console.log('Invalid CLI CORE option');
    }
  };

  var setup_opt = function(task){
    switch(task){
      case 'run_setup':
      setup();
      break;

      case 'stored_paths':
      stored_paths();
      break;

      case 'exit':
      exit_func();
      break;

      default:
      console.log('Invalid Setup option');
    }
  };

  var exit_func = function(){
    //exit process
    process.exit();
  };
}

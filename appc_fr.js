#!/usr/bin/env node

var program = require('commander');
var cloneRepo_SDK = require('./sdk/clone_sdk');
var cloneRepo_NPM = require('./clinpm/clone_clinpm');
var cloneRepo_CLICore = require('./clicore/clone_clicore');
var build_sdk = require('./sdk/build_sdk');
var build_clinpm = require('./clinpm/build_clinpm');
var build_clicore = require('./clicore/build_clicore');
var cleanup_sdk = require('./sdk/cleanup_sdk');
var cleanup_clinpm = require('./clinpm/cleanup_clinpm');
var clearMem = require('./misc/clear_mem');
var setup = require('./setup/setup');
var stored_paths = require('./setup/stored_paths');
var util = require('./misc/util');
var components = require('./qe_utility/components');
// var install_core = require('./qe_utility/install_core');
// var install_appc_npm = require('./qe_utility/install_appc_npm');
var install_sdk = require('./qe_utility/install_sdk');
// var select_sdk = require('./qe_utility/select_sdk');
// var to_prod = require('./qe_utility/to_prod');
// var to_preprod = require('./qe_utility/to_preprod');

// program
//     .version('1.0.0')
//     .usage('[command] [options]');
//
// program
//     .command('clone')
//     .description('Clones repository from github.')
//     .option('-c, --component', 'Clone the component ' + util.cyan('[sdk, clinpm, clicore]'))
//     .action(function(option) {
//         if (option === 'sdk') {
//             cloneRepo_SDK();
//         } else if (option === 'clinpm') {
//             cloneRepo_NPM();
//         } else if (option === 'clicore') {
//             cloneRepo_CLICore();
//         } else {
//             console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
//         }
//     });
//
// program
//     .command('build')
//     .description('Command to build, package & install the SDK, CLI NPM & CLI CORE.')
//     .option('-c, --component', 'Build the component ' + util.cyan('[sdk, clinpm, clicore]'))
//     .action(function(option) {
//         if (option === 'sdk') {
//             build_sdk();
//         } else if (option === 'clinpm') {
//             build_clinpm();
//         } else if (option === 'clicore') {
//             build_clicore();
//         } else {
//             console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
//         }
//     });
//
// program
//     .command('cleanup')
//     .description('Command to cleanup before you build for a new PR.')
//     .option('-c, --component', 'Build the component ' + util.cyan('[sdk, clinpm, clicore]'))
//     .action(function(option) {
//         if (option === 'sdk') {
//             cleanup_sdk();
//         } else if (option === 'clinpm') {
//             cleanup_clinpm();
//         } else if (option === 'clicore') {
//             console.log('Coming Soon ....');
//         } else {
//             console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
//         }
//     });
//
// program
//     .command('clearmemory')
//     .description('Command to clear all stored links & repo paths (This will prompt you for the paths when you clone the repo next time).')
//     .action(function() {
//         clearMem();
//     });
//
// program
//     .command('setup')
//     .description('Setup prerequisites.' + util.cyan(' This should be run at your first run.'))
//     .action(function() {
//         setup();
//     });
//
// program
//   .command('check_paths')
//   .description('Check paths & links stored.')
//   .action(function(){
//     stored_paths();
//   });
//
// program
//   .command('utility')
//   .description('Run the QE utility.')
//   .action(function(){
//     qe_utility.qe_utility();
//   });
//
// program.parse(process.argv);

// var inquirer = require('inquirer');
//
// inquirer.prompt([
//   {
//     type:'list',
//     name:'question',
//     message:'What do you want to do',
//     default:0,
//     choices: [
//       {
//         name: 'CHECK INSTALLED COMPONENTS',
//         value:'compo',
//         short:'Components'
//       },
//       {
//         name: 'INSTALL APPC CORE',
//         value:'install_core',
//         short:'Appc Core'
//       },
//       {
//         name: 'INSTALL APPC NPM',
//         value:'install_appc_npm',
//         short:'Appc NPM'
//       },
//       {
//         name: 'INSTALL TITANIUM SDK',
//         value:'install_sdk',
//         short:'SDK'
//       },
//       {
//         name: 'SELECT SPECIFIC TITANIUM SDK',
//         value:'select_sdk',
//         short:'Select SDK'
//       },
//       {
//         name: 'CHANGE ENV TO PRODUCTION',
//         value:'to_prod',
//         short:'To Prod'
//       },
//       {
//         name: 'CHANGE ENV TO PRE-PRODUCTION',
//         value:'to_preprod',
//         short:'To Preprod'
//       },
//       new inquirer.Separator('--------------------------'),
//       {
//         name: 'CLONE TIMOB SDK REPO',
//         value:'clone_sdk',
//         short:'Clone SDK'
//       },
//       {
//         name: 'BUILD SDK FOR PR',
//         value:'build_sdk',
//         short:'Build SDK'
//       },
//       {
//         name: 'CLEANUP SDK',
//         value:'clean_sdk',
//         short:'Clean SDK'
//       },
//       new inquirer.Separator('--------------------------'),
//       {
//         name: 'CLONE APPC CLI NPM REPO',
//         value:'clone_clinpm',
//         short:'Clone CLI NPM'
//       },
//       {
//         name: 'BUILD APPC CLI NPM',
//         value:'build_clinpm',
//         short:'Build CLI NPM'
//       },
//       {
//         name: 'CLEANUP APPC CLI NPM',
//         value:'clean_clinpm',
//         short:'Install Appc Core'
//       },
//       new inquirer.Separator('--------------------------'),
//       {
//         name: 'CLONE APPC CLI CORE REPO',
//         value:'clean_clinpm',
//         short:'Install Appc Core'
//       },
//       {
//         name: 'BUILD APPC CLI CORE',
//         value:'clean_clinpm',
//         short:'Install Appc Core'
//       },
//       {
//         name: 'CLEANUP APPC CLI CORE',
//         value:'clean_clinpm',
//         short:'Install Appc Core'
//       },
//       new inquirer.Separator('--------------------------'),
//       {
//         name: 'EXIT',
//         value:'exit',
//         short:'exit'
//       },
//       new inquirer.Separator('============================'),
//       new inquirer.Separator('============================'),
//       new inquirer.Separator('============================'),
//       new inquirer.Separator('============================')
//     ]
//   }
// ]).then(function (answers) {
//   console.log(JSON.stringify(answers, null, '  '));
//   console.log(JSON.stringify(answers.question));
//   execute(JSON.stringify(answers.question));
// });
//
// function execute(task){
//   switch(task){
//     case '"clone_sdk"':
//       cloneRepo_SDK();
//       break;
//   }
// }

var inquirer = require('inquirer');

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
  switch(JSON.stringify(answers.main_options)){
    case '"qe_utility"':
    inquirer.prompt({
      type: 'list',
      name: 'qe_util_opt',
      message: 'What do you like to do in QE Utility ?',
      choices: [{
              name: 'CHECK INSTALLED COMPONENTS',
              value:'compo',
            },
            {
              name: 'INSTALL APPC CORE',
              value:'install_core',
            },
            {
              name: 'INSTALL APPC NPM',
              value:'install_appc_npm',
            },
            {
              name: 'INSTALL TITANIUM SDK',
              value:'install_sdk',
            },
            {
              name: 'SELECT SPECIFIC TITANIUM SDK',
              value:'select_sdk',
            },
            {
              name: 'CHANGE ENV TO PRODUCTION',
              value:'to_prod',
            },
            {
              name: 'CHANGE ENV TO PRE-PRODUCTION',
              value:'to_preprod',
            },{
              name: 'EXIT',
              value: 'exit'
            }]
    }).then(function(answers){
      exec_qe_utility(JSON.stringify(answers.qe_util_opt));
    });
    break;

    case '"sdk_fr"':
    inquirer.prompt({
      type: 'list',
      name: 'sdk_fr_opt',
      message: 'What do you like to do ?',
      choices: [{
              name: 'CLONE TIMOB SDK REPO',
              value:'clone_sdk',
            },
            {
              name: 'BUILD SDK FOR PR',
              value:'build_sdk',
            },
            {
              name: 'CLEANUP SDK',
              value:'clean_sdk',
            },{
              name: 'EXIT',
              value: 'exit'
            }]
    }).then(function(answers){
      exec_sdk_fr(JSON.stringify(answers.sdk_fr_opt));
    });
    break;

    case '"clinpm_fr"':
    inquirer.prompt({
      type: 'list',
      name: 'clinpm_fr_opt',
      message: 'What do you like to do ?',
      choices: [{
              name: 'CLONE APPC CLI NPM REPO',
              value:'clone_clinpm',
            },
            {
              name: 'BUILD APPC CLI NPM',
              value:'build_clinpm',
            },
            {
              name: 'CLEANUP APPC CLI NPM',
              value:'clean_clinpm',
            },{
              name: 'EXIT',
              value: 'exit'
            }]
    }).then(function(answers){
      exec_clinpm_fr(JSON.stringify(answers.clinpm_fr_opt));
    });
    break;

    case '"clicore_fr"':
    inquirer.prompt({
      type: 'list',
      name: 'clicore_fr_opt',
      message: 'What do you like to do ?',
      choices: [{
              name: 'CLONE APPC CLI CORE REPO',
              value:'clone_clicore',
            },
            {
              name: 'BUILD APPC CLI CORE',
              value:'build_clicore',
            },
            {
              name: 'CLEANUP APPC CLI CORE',
              value:'clean_clicore',
            },{
              name: 'EXIT',
              value: 'exit'
            }]
    }).then(function(answers){
      exec_clicore_fr(JSON.stringify(answers.clicore_fr_opt));
    });
    break;

    case '"setup"':
      run_setup();
    break;

    case '"exit"':
      exit_func();
    break;
  }

});

function exec_qe_utility(task){
  console.log('******'+task);
  switch(task){
    case '"compo"':
      components();
      break;

    case '"install_core"':
      install_core();
      break;

    case '"install_appc_npm"':
      install_appc_npm();
      break;

    case '"install_sdk"':
      install_sdk();
      break;

    case '"select_sdk"':
      select_sdk();
      break;

    case '"to_prod"':
      to_prod();
      break;

    case '"to_preprod"':
      to_preprod();
      break;

    case '"exit"':
      exit_func();
      break;

    default:
      console.log('Invalid utility option');
  }
}

function exec_sdk_fr(task){
  console.log('******'+task);
  switch(task){
    case '"clone_sdk"':
      cloneRepo_SDK();
      break;

    case '"build_sdk"':
      build_sdk();
      break;

    case '"clean_sdk"':
      cleanup_sdk();
      break;

    default:
      console.log('Invalid sdk option');
  }
}

function exec_clinpm_fr(task){
  console.log('******'+task);
  switch(task){
    case '"clone_clinpm"':
      cloneRepo_NPM();
      break;

    case '"build_clinpm"':
      build_clinpm();
      break;

    case '"clean_clinpm"':
      cleanup_clinpm();
      break;

    default:
      console.log('Invalid CLI NPM option');
  }
}

function exec_clicore_fr(task){
  console.log('******'+task);
  switch(task){
    case '"clone_clicore"':
      cloneRepo_NPM();
      break;

    case '"build_clicore"':
      build_clinpm();
      break;

    case '"clean_clicore"':
      cleanup_clinpm();
      break;

    default:
      console.log('Invalid CLI CORE option');
  }
}

function run_setup(){
  setup();
}

function exit_func(){
  //exit process
  process.exit();
}

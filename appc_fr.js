#!/usr/bin/env node

var program = require('commander');
var cloneRepo_SDK = require('./clone_sdk');
var cloneRepo_NPM = require('./clone_clinpm');
var build_sdk = require('./build_sdk');
var build_clinpm = require('./build_clinpm');
var cleanup_sdk = require('./cleanup_sdk');
var cleanup_clinpm = require('./cleanup_clinpm');
var clearMem = require('./clear_mem');
var setup = require('./setup');
var util = require('./util');


program
    .version('1.0.0')
    .usage('[command] [options]');

program
    .command('clone')
    .description('Clones repository from github.')
    .option('-c, --component', 'Clone the component ' + util.cyan('[sdk, clinpm, clicore]'))
    .action(function(option) {
        if (option === 'sdk') {
            cloneRepo_SDK();
        } else if (option === 'clinpm') {
            cloneRepo_NPM();
        } else if (option === 'clicore') {
            console.log('Coming Soon ....');
        } else {
            console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
        }
    });

program
    .command('build')
    .description('Command to build, package & install the SDK, CLI NPM & CLI CORE.')
    .option('-c, --component', 'Build the component ' + util.cyan('[sdk, clinpm, clicore]'))
    .action(function(option) {
        if (option === 'sdk') {
            build_sdk();
        } else if (option === 'clinpm') {
            build_clinpm();
        } else if (option === 'clicore') {
            console.log('Coming Soon ....');
        } else {
            console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
        }
    });

program
    .command('cleanup')
    .description('Command to cleanup before you build for a new PR.')
    .option('-c, --component', 'Build the component ' + util.cyan('[sdk, clinpm, clicore]'))
    .action(function(option) {
        if (option === 'sdk') {
            cleanup_sdk();
        } else if (option === 'clinpm') {
            cleanup_clinpm();
        } else if (option === 'clicore') {
            console.log('Coming Soon ....');
        } else {
            console.log(util.cyan('\n\u2717 Please input the right component [sdk, clinpm, clicore]\n'));
        }
    });

program
    .command('clearmemory')
    .description('Command to clear all stored links & repo paths (This will prompt you for the paths when you clone the repo next time).')
    .action(function() {
        clearMem();
    });

program
    .command('setup')
    .description('Setup prerequisites.' + util.cyan(' This should be run at your first run.'))
    .action(function() {
        setup();
    });
program.parse(process.argv);
#!/usr/bin/env node

var program = require('commander');
var cloneRepo_SDK = require('./clone_sdk');
var build_sdk = require('./build_sdk');
var cleanup_sdk = require('./cleanup_sdk');
var clearMem = require('./clear_mem');
var setup = require('./setup');
var chalk = require('chalk');

//Setting theme for colors
var error = chalk.bold.red;
var underline = chalk.underline;
var cyan = chalk.cyan;
var bold = chalk.bold;

program
    .version('1.0.0');

program
    .command('clone')
    .description('Clones repository from github.')
    .option('-c, --component', 'Clone the component ' + cyan('[sdk, npm, cli]'))
    .action(function(option) {
        if (option === 'sdk') {
            cloneRepo_SDK();
        } else if (option === 'npm') {
            console.log('Coming Soon ....');
        } else if (option === 'cli') {
            console.log('Coming Soon ....');
        } else {
            console.log(cyan('\n\u2717 Please input the right component [sdk, npm, cli]\n'));
        }
    });

program
    .command('build')
    .description('Command to build, package & install the SDK.')
    .option('-c, --component', 'Build the component ' + cyan('[sdk, npm, cli]'))
    .action(function(option) {
        if (option === 'sdk') {
            build_sdk();
        } else if (option === 'npm') {
            console.log('Coming Soon ....');
        } else if (option === 'cli') {
            console.log('Coming Soon ....');
        } else {
            console.log(cyan('\n\u2717 Please input the right component [sdk, npm, cli]\n'));
        }
    });

program
    .command('cleanup')
    .description('Command to cleanup before you build for a new PR.')
    .option('-c, --component', 'Build the component ' + cyan('[sdk, npm, cli]'))
    .action(function(option) {
        if (option === 'sdk') {
            cleanup_sdk();
        } else if (option === 'npm') {
            console.log('Coming Soon ....');
        } else if (option === 'cli') {
            console.log('Coming Soon ....');
        } else {
            console.log(cyan('\n\u2717 Please input the right component [sdk, npm, cli]\n'));
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
    .description('Setup prerequsites.')
    .action(function() {
        setup();
    });
program.parse(process.argv);

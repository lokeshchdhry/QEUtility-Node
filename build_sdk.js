var exec = require('child_process').exec;
var inquirer = require('inquirer');
var storage = require('node-persist');
var chalk = require('chalk');
var util = require('./util');
var cleanup_sdk = require('./cleanup_sdk');


module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    process.chdir(storage.getItemSync('dir_sdk') + '/titanium_mobile');
    console.log('');
    console.log('Pulling any changes from github ...... Please wait');
    //Start the spinner
    util.spinner_start();

    exec('git pull', {
        maxBuffer: 1024 * 1000
    }, function(err) {
        if (err) {
            console.log(util.error(err));
        } else {
            //Stop spinner
            util.spinner_stop(true);

            console.log('');
            console.log('Fetching all pull requests ...... Please wait');
            //Start the spinner
            util.spinner_start();

            exec('git fetch origin', {
                maxBuffer: 1024 * 1000
            }, function(err) {
                if (err) {
                    console.log(util.error(err));
                } else {
                    //Stop spinner
                    util.spinner_stop(true);
                    console.log('');

                    var questions = [{
                        name: 'pr_no',
                        type: 'input',
                        message: 'Enter the PR number to build for :',
                        validate: function(value) {
                            if (value.length) {
                                return true;
                            } else {
                                return 'Please enter PR number to build for.';
                            }
                        }
                    }];
                    inquirer.prompt(questions).then(function(answers) {
                        exec('git checkout pr/' + answers.pr_no, {
                            maxBuffer: 1024 * 500
                        }, function(err) {
                            if (err) {
                                console.log(util.error(err));
                            } else {
                                //CD into the build folder in the repo.
                                process.chdir(storage.getItemSync('dir_sdk') + '/titanium_mobile/build');
                                exec('npm install', function(err) {
                                    if (err) console.log(util.error(err));
                                    console.log(util.underline(util.bold('\n\u25B6 BUILDING THE SDK:')));
                                    //Build the SDK
                                    exec('node scons.js build', {
                                        maxBuffer: 1024 * 500
                                    }, function(err) {
                                        if (err) console.log(util.error(err));
                                        console.log(util.underline(util.bold('\n\u25B6 PACKAGING THE SDK:')));
                                        //Package the SDK
                                        exec('node scons.js package', {
                                            maxBuffer: 1024 * 500
                                        }, function(err) {
                                            if (err) console.log(util.error(err));
                                            console.log(util.underline(util.bold('\n\u25B6 INSTALLING THE SDK:')));
                                            //Install the SDK
                                            exec('node scons.js install', {
                                                maxBuffer: 1024 * 500
                                            }, function(err) {
                                                if (err) console.log(util.error(err));
                                                console.log('\n\u2714 Done, please find the installed SDK in your titanium folder');
                                                console.log('');
                                            }).stdout.on('data', function(data) {
                                                console.log(util.cyan(data));
                                            });
                                        }).stdout.on('data', function(data) {
                                            console.log(util.cyan(data));
                                        });
                                    }).stdout.on('data', function(data) {
                                        console.log(util.cyan(data));
                                    });
                                }).stdout.on('data', function(data) {
                                    console.log(util.cyan(data));
                                });
                            }
                        }).stdout.on('data', function(data) {
                            console.log(util.cyan(data));
                        });
                    });
                }
            }).stdout.on('data', function(data) {
                console.log(util.cyan(data));
            });
        }
    }).stdout.on('data', function(data) {
        console.log(util.cyan('\n' + data));
    });
};

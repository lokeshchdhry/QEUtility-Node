var exec = require('child_process').exec;
var storage = require('node-persist');
var inquirer = require('inquirer');
var chalk = require('chalk');
var util = require('../misc/util');
var path = require('path');

module.exports = function() {
    console.log('');
    //Initialize node persist.
    storage.initSync();
    //CD in to TIMOB repo dir.
    process.chdir(path.join(storage.getItemSync('dir_npm'), '/appc-install'));

    //Get the current PR number.
    exec("git branch| grep '* pr/'|cut -c2-", function(err, data) {
        if (err) console.log(util.error(err));
        if (data !== '') {
            var pr_no = data;
            //Ask question
            var questions = [{
                name: 'pr_number',
                type: 'confirm',
                message: 'Are you sure you want to delete branch for' + pr_no
            }];
            inquirer.prompt(questions).then(function(answers) {
                if (answers.pr_number) {
                    //Checking out master branch
                    console.log(util.underline(util.bold('\n\u25B6 CHECKING OUT TO MASTER. PLEASE WAIT.')));
                    exec('git checkout master', function(err) {
                        if (err) {
                            console.log(util.error(err));
                        }

                        //Deleting the branch of the PR
                        console.log(util.underline(util.bold('\n\u25B6 DELETING THE PR BRANCH.')));
                        exec('git branch -D' + pr_no, function(err) {
                            if (err) {
                                console.log(util.error(err));
                            }

                            //Doing git fetch origin
                            console.log(util.underline(util.bold('\n\u25B6 FETCHING AGAIN FROM ORIGIN.')));
                            exec('git fetch origin', function(err) {
                                if (err) {
                                    console.log(util.error(err));
                                } else {
                                    console.log(util.cyan('DONE'));
                                    console.log('');

                                    //Going back to GA CLI NPM
                                    console.log(util.underline(util.bold('\u25B6 GOING BACK TO GA CLI NPM.')));
                                    exec('sudo npm uninstall -g appcelerator && sudo npm install -g appcelerator', function(err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log('');
                                            console.log(util.cyan('DONE'));
                                        }
                                    }).stdout.on('data', function(data) {
                                        console.log(util.cyan(data));
                                    });
                                }

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
                console.log('');
                console.log(util.cyan('DONE'));
            });
        } else {
            console.log(util.bold('\n\u2717 No branch exists. Please proceed to build for a PR'));
        }
    });
};

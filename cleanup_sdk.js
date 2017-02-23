var exec = require('child_process').exec;
var storage = require('node-persist');
var inquirer = require('inquirer');
var chalk = require('chalk');

//Setting theme for colors
var error = chalk.bold.red;
var underline = chalk.underline;
var cyan = chalk.cyan;
var bold = chalk.bold;

module.exports = function() {
    console.log('');
    //Initialize node persist.
    storage.initSync();
    //CD in to TIMOB repo dir.
    process.chdir(storage.getItemSync('dir_sdk') + '/titanium_mobile');

    //Get the current PR number.
    exec("git branch| grep '* pr/'|cut -c2-", function(err, data) {
        if (err) console.log(error(err));
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
                    console.log(underline(bold('\n\u25B6 CHECKING OUT TO MASTER. PLEASE WAIT.')));
                    exec('git checkout master', function(err) {
                        if (err) {
                            console.log(error(err));
                        }

                        //Deleting the branch of the PR
                        console.log(underline(bold('\n\u25B6 DELETING THE PR BRANCH.')));
                        exec('git branch -D' + pr_no, function(err) {
                            if (err) {
                                console.log(error(err));
                            }

                            //Doing git fetch origin
                            console.log(underline(bold('\n\u25B6 FETCHING AGAIN FROM ORIGIN.')));
                            exec('git fetch origin', function(err) {
                                if (err) {
                                    console.log(error(err));
                                }
                                console.log(cyan('DONE'));
                            }).stdout.on('data', function(data) {
                                console.log(cyan(data));
                            });
                        }).stdout.on('data', function(data) {
                            console.log(cyan(data));
                        });
                    }).stdout.on('data', function(data) {
                        console.log(cyan(data));
                    });
                }
                console.log('');
                console.log(cyan('DONE'));
            });
        } else {
            console.log(bold('\n\u2717 No branch exists. Please proceed to build for a PR'));
        }
    });
};

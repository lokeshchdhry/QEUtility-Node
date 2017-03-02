var exec = require('child_process').exec;
var Spinner = require('cli-spinner').Spinner;
var fs = require('fs');
var storage = require('node-persist');
var inquirer = require('inquirer');
var chalk = require('chalk');
// var androidEnv = require('./android_path');

//Setting theme for colors
var error = chalk.bold.red;
var underline = chalk.underline;
var cyan = chalk.cyan;
var bold = chalk.bold;

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    console.log(storage.getItemSync('repo_link_npm'));
    //Check if repo link & repo dir is stored? If not ask for it else prceed to clone.
    if (storage.getItemSync('repo_link_npm') === undefined) {
        console.log(bold('\n\u25B6 Appears that you have not set your default Appc npm repo link & directory to clone to.'));
        //questions object array
        var questions = [{
                name: 'repo_link',
                type: 'input',
                message: 'Enter the appc npm repo link to clone :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter the appc npm repo link to clone :';
                    }
                }
            },
            {
                name: 'dir',
                type: 'input',
                message: 'Enter path to dir where you want to clone the appc npm repo :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter path to dir where you want to clone the appc npm repo';
                    }
                }
            }
        ];
        inquirer.prompt(questions).then(function(answers) {
            //Storing the repo link & repo dir using node persist.
            storage.setItemSync('repo_link_npm', answers.repo_link);
            storage.setItemSync('dir_npm', answers.dir);
            //Calling clone
            clone(answers.repo_link, answers.dir);
        });
    } else {
        //Getting the values & setting it to repoLink & repoDir
        var repoLink = storage.getItemSync('repo_link_npm');
        var repoDir = storage.getItemSync('dir_npm');
        console.log(cyan('\n\u25B6 Clone link: ' + repoLink));
        console.log(cyan('\u25B6 Clone dir: ' + repoDir));
        //Calling clone
        clone(repoLink, repoDir);
    }
};

//Clone function to avoid duplicate code
var clone = function(repo_link, repo_dir) {
    process.chdir(repo_dir);

    spinner = new Spinner(' Cloning Appc npm repo .... Please Wait.');
    spinner.setSpinnerString(0);
    spinner.setSpinnerDelay(60);
    spinner.start();

    console.log('');
    exec('git clone ' + repo_link, function(err) {
        if (err) {
          console.log(error(err));
          //Stop the process
          process.exit();
        }
        else {
            console.log(cyan('\n\n\u2714 Cloning done successfully.'));
            spinner.stop(true);
            process.chdir(repo_dir + '/appc-install/.git');

            console.log(cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));

            //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
            var data1 = fs.readFileSync('config').toString().split("\n");
            data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
            var text = data1.join("\n");

            fs.writeFile('config', text, function(err) {
                if (err) return console.log(error(err));
                else {
                    console.log(cyan('\n\u2714 Done modifying the the config file.\n'));
                }
            });
        }
    }).stdout.on('data', function(data) {
        console.log(cyan(data));
    });
};

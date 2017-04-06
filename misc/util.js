var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var fs = require('fs');
var exec = require('child_process').exec;
var storage = require('node-persist');

//Initialize storage sync (node persist)
storage.initSync();

module.exports = {
    //Setting color settings
    error: chalk.bold.red,
    underline: chalk.underline,
    cyan: chalk.cyan,
    bold: chalk.bold,

    //Getting user info
    user: process.env.USER,

    //Getting the links & dir paths from node-persist
    sdk_dir: storage.getItemSync('dir_sdk'),
    npm_dir: storage.getItemSync('dir_npm'),
    repolink_sdk: storage.getItemSync('repo_link_sdk'),
    repolink_clinpm: storage.getItemSync('repo_link_npm'),
    repolink_clicore: storage.getItemSync('repo_link_cli_core'),
    clicore_dir: storage.getItemSync('dir_cli_core'),

    //Function to set sync for links & dir paths
    setSyncValue : function(name, value){
      storage.setItemSync(name, value);
    },

    //Start spinner
    spinner_start: function() {
        spinner = new Spinner();
        spinner.setSpinnerString(0);
        spinner.setSpinnerDelay(60);
        spinner.start();
    },

    //Stop spinner
    spinner_stop: function(flag) {
        spinner.stop(flag);
    },

    //Function to modify config after cloning
    modify_config: function(callback) {
        console.log(chalk.cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
        //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
        var data1 = fs.readFileSync('config').toString().split("\n");
        data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
        var text = data1.join("\n");

        fs.writeFile('config', text, function(err) {
            if (err) return console.log(util.error(err));
            else {
              var done = true;
              callback(done);
            }
        });
    },
};

var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var fs = require('fs');
var exec = require('child_process').exec;

module.exports = {
    error: chalk.bold.red,
    underline: chalk.underline,
    cyan: chalk.cyan,
    bold: chalk.bold,

    spinner_start: function() {
        spinner = new Spinner();
        spinner.setSpinnerString(0);
        spinner.setSpinnerDelay(60);
        spinner.start();
    },

    spinner_stop: function(flag) {
        spinner.stop(flag);
    },

    modify_config: function() {
        console.log(chalk.cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
        //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
        var data1 = fs.readFileSync('config').toString().split("\n");
        data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
        var text = data1.join("\n");

        fs.writeFile('config', text, function(err) {
            if (err) return console.log(util.error(err));
            else {
                console.log(chalk.cyan('\n\u2714 Done modifying the the config file.\n'));
            }
        });
    },
};
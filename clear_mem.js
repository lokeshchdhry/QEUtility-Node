var inquirer = require('inquirer');
var storage = require('node-persist');
var chalk = require('chalk');
var util = require('./util');

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    var questions = [{
        name: 'clear',
        type: 'confirm',
        message: 'Are you sure you want to clear the stored repo paths & links?',
    }];
    inquirer.prompt(questions).then(function(answers) {
        if (answers.clear) {
            storage.clear(function(err) {
                if (err) console.log(util.error(err));
                console.log(util.cyan('\n\u25B6 Done clearing memory.'));
            });
        }
    });
};

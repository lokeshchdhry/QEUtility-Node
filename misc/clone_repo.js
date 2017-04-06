var exec = require('child_process').exec;
var util = require('../misc/util');
var fs = require('fs');

module.exports = function(repo_link, repo_dir, repo_name) {
    process.chdir(repo_dir);
    console.log('');
    console.log('\u25B6 Cloning '+repo_name +' Please Wait ......');
    //Starting spinner
    util.spinner_start();

    exec('git clone ' + repo_link, function(err) {
        if (err) {
            console.log(util.error(err));
            //Stop the process
            process.exit();
        } else {
            //Stop spinner
            util.spinner_stop(true);
            console.log(util.cyan('\n\n\u2714 Cloning done successfully.'));
            process.chdir(repo_dir + '/'+ repo_name +'/.git');
            //Call modify_config from utils.js
            // util.modify_config(function(done){
            //   if(done){
            //     console.log(util.cyan('\n\u2714 Done modifying the the config file.\n'));
            //   }
            // });
            // console.log(chalk.cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
            // //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
            // var data1 = fs.readFileSync('config').toString().split("\n");
            // data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
            // var text = data1.join("\n");
            //
            // fs.writeFile('config', text, function(err) {
            //     if (err) return console.log(util.error(err));
            //     else {
            //       var done = true;
            //       callback(done);
            //     }
            // });
            //Call modify_config from below with callback function
            modifyConfig(function(err, done){
              if(done){
                console.log(util.cyan('\n\u2714 Done modifying the the config file.\n'));
              }
              else{
                console.log(util.error(err));
                //exit process in case of error
                process.exit();
              }
            });
        }
    }).stdout.on('data', function(data) {
        console.log(util.cyan(data));
    });
};

function modifyConfig(callback){
  console.log(util.cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
  //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
  var data1 = fs.readFileSync('config').toString().split("\n");
  data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
  var text = data1.join("\n");

  fs.writeFile('config', text, function(err) {
      if (err){
        callback(err, null);
      }
      else {
        var done = true;
        callback(null, done);
      }
  });
}

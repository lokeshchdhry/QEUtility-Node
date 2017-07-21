var execute = require('../misc/util').execute,
    cyan = require('../misc/util').cyan,
    spinner_start = require('../misc/util').spinner_start,
    spinner_stop = require('../misc/util').spinner_stop,
    error = require('../misc/util').error,
    errorNExit = require('../misc/util').errorNExit,
    fs = require('fs');

module.exports = function(repo_link, repo_dir, repo_name) {
    //checking if repo_dir exists
    if(fs.existsSync(repo_dir)){
      //cd into the repo_dir
      process.chdir(repo_dir);
      console.log('\n\u25B6 Cloning '+repo_name +' Please Wait ......');
      //Starting spinner
      spinner_start();

      execute('git clone ' + repo_link, function(err, data) {
          if (err) {
              errorNExit(err);
          } else {
              //Stop spinner
              spinner_stop(true);
              console.log(cyan(data));
              console.log(cyan('\n\n\u2714 Cloning done successfully.'));
              process.chdir(repo_dir + '/'+ repo_name +'/.git');
              //Call modify_config from below with callback function
              modifyConfig(function(err, done){
                if(done){
                  console.log(cyan('\n\u2714 Done modifying the the config file.\n'));
                }
                else{
                  errorNExit(err);
                }
              });
          }
      });
    }
    else{
    console.log(error('It seems '+repo_dir+' does not exist. Please make sure the directory is present.'));
  }
};

function modifyConfig(callback){
  console.log(cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
  //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
  var data = fs.readFileSync('config').toString().split("\n");
  data.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
  var text = data.join("\n");

  fs.writeFile('config', text, function(err) {
      if (err){
        return callback(err, null);
      }
      else {
        var done = true;
        return callback(null, done);
      }
  });
}

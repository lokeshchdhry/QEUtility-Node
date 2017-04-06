var exec = require('child_process').exec;

var getPR_No = function(callback){
  // var PR;
  exec("git branch| grep '* pr/'|cut -c2-", function(err, data) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var PR = data;
    callback(PR);
  });
};

exports.getPR_No = getPR_No;

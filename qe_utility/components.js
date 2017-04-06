var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var util = require('../misc/util');
var os = require('os');
var client = require('adbkit').createClient();
var Async = require('async');

module.exports = function(){
  var studio_ver;

  var task = [];
  task.push(function(callback){get_studio_ver(callback);});
  // task.push(function(callback){get_sdk_ver(callback);});
  task.push(function(callback){get_os_ver(callback);});
  task.push(function(callback){get_xcode_ver(callback);});
  task.push(function(callback){get_appc_ver(callback);});
  task.push(function(callback){get_ti_cli_ver(callback);});
  task.push(function(callback){get_alloy_ver(callback);});
  task.push(function(callback){get_node_ver(callback);});
  task.push(function(callback){get_java_ver(callback);});
  task.push(function(callback){get_env(callback);});
  // task.push(function(callback){get_connected_devices(callback);});

Async.series(task, function(err, results){
  if(err){
    console.log(util.error(err));
    //exit process in case of error
    process.exit();
  }
  console.log('***'+results.length);
  console.log('*******'+results);
});


  // get_studio_ver(function(ver){
  //   studio_ver = ver;
  //   console.log('Studio Version :'+studio_ver);
  // });
  //
  // get_sdk_ver(function(txt){
  //   console.log('SDK Version :'+txt);
  // });
  //
  // get_os_ver(function(ver){
  //   console.log('Mac OS Version :'+ver);
  // });
  //
  // get_xcode_ver(function(ver){
  //   console.log('Xcode Version :'+ver);
  // });
  //
  // var appc_ver;
  // get_appc_ver(function(ver){
  //   appc_ver = ver;
  //   console.log('Appc CLI AND Appc NPM :'+appc_ver);
  // });
  //
  // get_ti_cli_ver(function(ver){
  //   console.log('Ti CLI :'+ver);
  // });
  //
  // get_alloy_ver(function(ver){
  //   console.log('Alloy :'+ver);
  // });
  //
  // get_node_ver(function(ver){
  //   console.log('Node :'+ver);
  // });
  //
  // get_java_ver(function(err, ver){
  //   console.log('Java Ver :'+ver);
  // });
  //
  // get_env(function(ver){
  //   console.log('Environment :'+ver);
  // });
  //
  // get_connected_devices(function(device){
  //   console.log('Device/s :\n'+device);
  // });

//   a="appc -v -o json"
// b="appc ti -v"
// c="appc alloy -v"
// d="appc ti sdk --no-color"
// f="sw_vers -productVersion"
// g="/usr/bin/xcodebuild -version"
// h="node -v"
// i="appc whoami"
// j="javac -version"


};

function get_studio_ver(callback){
  fs.readFile('/Applications/Appcelerator Studio/version.txt', 'utf8', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var ver = result.substring(16,35);
    callback(null,ver);
  });
}

function get_sdk_ver(callback){
  var txt = exec('appc ti sdk --no-color', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    // var txt = result.split(' ')[16];
    var txt = result.split(' ')[45];
    // var txt = result.split('SDKs:\n   ');
    // var txt1 = result.split(' [selected]');
    // var index1 = result.indexOf('SDKs:\n  ');
    // var index2 = result.indexOf(' [selected]');
    // console.log(index1);
    // console.log(index2);

    // var final_txt = txt.slice(index1+9, index2);
    // var final_txt1 = final_txt.trim();
    callback(txt);
  });
}

function get_appc_ver(callback){
  exec('appc -v -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, result);
  });
}

function get_os_ver(callback){
  exec('sw_vers -productVersion', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var os_ver = result;
    callback(null, os_ver);
  });
}

function get_xcode_ver(callback){
  exec('/usr/bin/xcodebuild -version', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var xcode_ver = result;
    callback(null, xcode_ver);
  });
}

function get_ti_cli_ver(callback){
  exec('appc ti -v', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var ti_ver = result;
    callback(null, ti_ver);
  });
}

function get_alloy_ver(callback){
  exec('appc alloy -v', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var alloy_ver = result;
    callback(null, alloy_ver);
  });
}

function get_node_ver(callback){
  var node_ver = process.versions.node;
  callback(null, node_ver);
}

function get_java_ver(callback) {
    var spawn = require('child_process').spawn('java', ['-version']);
    spawn.on('error', function(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    });
    spawn.stderr.on('data', function(data) {
        data = data.toString().split('\n')[0];
        var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion !== false) {
            callback(null, javaVersion);
        }
    });
}

function get_env(callback){
  exec('appc whoami', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var env = result.split(' ')[15];
    callback(null, env);
  });
}

function get_connected_devices(callback){
  client.listDevices(function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    // callback(result);
  }).then(function(devices){
    var device;
    devices.forEach(function(device){
      // console.log('*****'+JSON.stringify(id));
      client.getProperties(device.id, function(err, properties){
        if(err){
          console.log(util.error(err));
          //exit process in case of error
          process.exit();
        }
        var device_details = properties['ro.product.model']+' running '+properties['ro.build.version.release']+' API level '+properties['ro.build.version.sdk'];
        callback(null, device_details);
      });
    });
  });
}

function get_node_ver(callback){
  exec('node -v', function(err, result){
      if(err){
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
    }
    callback(null, result);
  });
}

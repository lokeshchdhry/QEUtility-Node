var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var util = require('../misc/util');
var Async = require('async');

module.exports = function(){

  var task = [];
  task.push(function(callback){get_studio_ver(callback);});
  task.push(function(callback){get_sdk_ver(callback);});
  task.push(function(callback){get_os_ver(callback);});
  task.push(function(callback){get_xcode_ver(callback);});
  task.push(function(callback){get_appc_npm_ver(callback);});
  task.push(function(callback){get_appc_clicore_ver(callback);});
  task.push(function(callback){get_ti_cli_ver(callback);});
  task.push(function(callback){get_alloy_ver(callback);});
  task.push(function(callback){get_node_ver(callback);});
  task.push(function(callback){get_java_ver(callback);});
  task.push(function(callback){get_env(callback);});
  task.push(function(callback){get_connected_devices(callback);});

  Async.series(task, function(err, results){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }

    console.log('\nStudio Ver : '+util.cyan(results[0]));
    console.log('SDK Ver :    '+util.cyan(results[1]+'\n'));
    console.log('OS Ver :     '+util.cyan(results[2]));
    console.log('Xcode Ver :  '+util.cyan(results[3]));
    console.log('Appc NPM :   '+util.cyan(results[4]+'\n'));
    console.log('Appc CLI :   '+util.cyan(results[5]+'\n'));
    console.log('Ti CLI Ver : '+util.cyan(results[6]));
    console.log('Alloy Ver :  '+util.cyan(results[7]));
    console.log('Node Ver :   '+util.cyan(results[8]+'\n'));
    console.log('Java Ver :   '+util.cyan(results[9]+'\n'));
    console.log('Env :        '+util.cyan(results[10]+'\n'));
    console.log('Devices :    '+util.cyan(results[11])+'\n');
  });
};

function get_studio_ver(callback){
  fs.readFile('/Applications/Appcelerator Studio/version.txt', 'utf8', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var ver = result.substring(16,35);
    callback(null, ver);
  });
}

function get_sdk_ver(callback){
  exec('appc ti config -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //Converting the json text to javascript object using JSON.parse & getting the "sdk.selected" value
    var ver = JSON.parse(result)["sdk.selected"];
    callback(null, ver);
  });
}

function get_appc_npm_ver(callback){
  exec('appc -v -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, JSON.parse(result).NPM);
  });
}

function get_appc_clicore_ver(callback){
  exec('appc -v -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, JSON.parse(result).CLI);
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
    var split = result.split('Build');
    var xcode_ver = split[0];
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
    // var env = result.split(' ')[15];
    var env = result.split('organization')[1].trim(' ');
    callback(null, env);
  });
}

function get_connected_devices(callback){
  exec('appc ti info -t android -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //reading nuber of devices connected
    var count = JSON.parse(result).android.devices.length;
    if(count === 0){
      callback(null, 'No device attached');
    }
    else{
      //creating a device object
      var device = {};
      var devices = '';
      for(var i=0; i<count; i++){
        //putting device details in object
        device['brand'+i] = JSON.parse(result).android.devices[i].brand;
        device['model'+i] = JSON.parse(result).android.devices[i].model;
        device['os_ver'+i] = JSON.parse(result).android.devices[i].release;

        devices += device['brand'+i]+' '+device['model'+i]+' --- Android '+device['os_ver'+i]+'\n';
      }
      callback(null, devices);
    }
  });
}

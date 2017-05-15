var adb = require('adbkit').createClient();
var inquirer = require('inquirer');
var Async = require('async');
_ = require('underscore');

// module.exports = function(){
//
//
// };

Async.waterfall([
  function getDevices(callback){
    adb.listDevices(function(err, data){
      if(err){
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }
      var idArr = [];
      data.forEach(function(entry){
        idArr.push(entry.id);
      });
      callback(null, idArr);
    });
  },

  // function getProperties(deviceIDArr, callback){
  //   var name;
  //   console.log(deviceIDArr);
  //   if(deviceIDArr.length > 0){
  //     // var len = deviceIDArr.length;
  //     // var nameArr = [];
  //     // var device;
  //     // for(var i=0; i<len; i++){
  //     //   console.log(deviceIDArr[i]);
  //     //   device = adb.getProperties(deviceIDArr[i]);
  //     //   console.log(device);
  //     // }
  //
  //     _.map(deviceIDArr, function(id){
  //
  //       //  device = adb.getProperties(id);
  //         adb.getProperties(id, function(err, prop){
  //           name = prop['ro.product.model'];
  //           return name;
  //         });
  //     });
  //     callback(null, deviceIDArr);
  //   }
  //   else{
  //     console.log('No devices connected.');
  //     process.exit();
  //   }
  //
  //   // callback(null, deviceIDArr);
  // },

  function askQuestion(deviceIDArr, callback){
    console.log(deviceIDArr);
    inquirer.prompt({
      type: 'list',
      name: 'devices',
      message: 'Select the device from which you want to remove apps ?',
      choices: deviceIDArr
    }).then(function (answers) {
      console.log(answers);
      callback(null, answers.devices);
    });
  },

  function getPackages(deviceID, callback){
    var patt = /com.app.*/g;
    adb.getPackages(deviceID, function(err, packages){
      var filteredPkgs = _.filter(packages, function(pkg){
        if(pkg.match(patt)){
          return pkg;
        }
      });
      callback(null, deviceID, filteredPkgs);
    });
  },

  function uninstallApp(deviceID, packages, callback){
    _.each(packages, function(pkg){
      adb.uninstall(deviceID, pkg, function(err, result){
        if(err){
          console.log(util.error(err));
          //exit process in case of error
          process.exit();
        }
        else if(result){
          console.log('Removed package '+ pkg);
          callback(null, 'done');
        }
        else{
          console.log('Removing package '+pkg+' failed.');
        }
      });
    });
    callback(null, 'done');
  }
],function(err, results){
  if(err){
    console.log(util.error(err));
    //exit process in case of error
    process.exit();
  }
  console.log('@@@@@'+results);
});

var adb = require('adbkit').createClient();
var inquirer = require('inquirer');
var Async = require('async');
_ = require('underscore');
var execute = require('../misc/util').execute;
var cyan = require('../misc/util').cyan;
var bold = require('../misc/util').bold;
var errorNExit = require('../misc/util').errorNExit;

module.exports = function(){
  Async.waterfall([
    function getProperties(callback){
      //executing appc ti info command to get connected device info
      execute('appc ti info -t android -o json', function(err, result){
        if(err){
          errorNExit(err);
        }
        // //reading nuber of devices connected
        var count = JSON.parse(result).android.devices.length;
        if(count === 0){
          //Sending callback as error
          callback('\n\u2717 No device connected.\n', null);
        }
        else{
          var devices = [];
          for(var i=0; i<count; i++){
            //Creating an array of device objects
            var device = {};
            device.name = JSON.parse(result).android.devices[i].model;
            device.id = JSON.parse(result).android.devices[i].id;
            devices.push(device);
          }
          //Pass on the array of device objects
          callback(null, devices);
        }
      });
    },

    function askQuestion(deviceArr, callback){
      var nameArr = [];
      deviceArr.forEach(function(device){
        nameArr.push(device.name);
      });
      inquirer.prompt({
        type: 'list',
        name: 'devices',
        message: 'Select the device from which you want to remove apps ?',
        choices: nameArr
      }).then(function (answers) {
        //Pass On the device name & the array of device objects
        callback(null, deviceArr, answers.devices);
      });
    },


    function getPackages(deviceArr, deviceName, callback){
      //Iterate over each device object in the deviceArr
      deviceArr.forEach(function(device){
        //Get the device name from the device name from inside the array of device objects
        if(device.name === deviceName){
          var deviceID = device.id;
          var patt = /com.app.*/g;
          //Get the packages using the device id
          adb.getPackages(deviceID, function(err, packages){
            //Filter the packages to only extract packages with com.app* , as appc apps are usually start with com.app*
            var filteredPkgs = _.filter(packages, function(pkg){
              if(pkg.match(patt)){
                return pkg;
              }
            });
            //Pass on the device id & packages
            callback(null, deviceID, filteredPkgs);
          });
        }
      });
    },

    function uninstallApp(deviceID, packages, callback){
      //Check if an apps installed
      if(packages.length>0){
        //Counter to iterate over the packages array
        var counter = 0;
        _.each(packages, function(pkg){
          adb.uninstall(deviceID, pkg, function(err){
            if(err){
              errorNExit(err);
            }
            else {
              console.log(cyan('\n\u2714 Removed package '+ pkg));
              counter++;
              //Fire the callback if all packages are uninstalled
              if(counter === packages.length){
                callback(null, bold('\n\u2714 Done uninstalling all APPC appc\n'));
              }
            }
          });
        });
      }
      else{
        //Tell the user no packages/apps are installed
        console.log(cyan(bold('\n\u2717 No \'com.app*\' packages installed on the device.\n')));
      }
    }
  ],function(err, results){
    if(err){
      errorNExit(err);
    }
    console.log(results);
  });
};

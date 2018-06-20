'use strict'

const inquirer = require('inquirer'),
     _ = require('underscore'),
     fs = require('fs'),
     path = require('path'),
     spinner_stop = require('../misc/util').spinner_stop,
     spinner_start = require('../misc/util').spinner_start,
     output = require('../misc/output'),
     exec = require('child_process').exec,
     os = require('os'),
     prodOrgId = require('../misc/util').prod_org_id,
     preProdOrgId = require('../misc/util').preprod_org_id,
     username = require('../misc/util').username,
     password = require('../misc/util').password,
     adb = require('adbkit').createClient();

class qeutility_util{

	/*****************************************************************************
	 * Downloads & installs specified Appc CLI core.
	 ****************************************************************************/
  	static installCore(){
		return new Promise((resolve, reject) => {
		  let questions = [{
		    name: 'cli_ver',
		    type: 'input',
		    message: 'Enter the CLI core version which you would like to download(e.g: 6.2.0) :',
		    validate: function(value) {
		      if (value.length) {
		        return true;
		      } else {
		        return 'Please enter the CLI core version which you would like to download.';
		      }
		    }
		  }];
		  inquirer.prompt(questions).then(function(answer) {
		    return answer.cli_ver;
		  })
		  .then(cliver => {
		    output.info('solidarrow', `Downloading & instal ling CLI Core version : ${cliver}`);
		    spinner_start();                                                                      
		    exec(`appc use ${cliver}`, (err, data) => {
		      if(!err){
		        spinner_stop(true);                                                               
		        output.cyan('tick', data);
		        resolve();
		      }
		      else(reject(err));
		    })
		  })
		})
		.catch(err => output.error(err));
  	}



  	/*****************************************************************************
	 * Downloads & installs the specified Appc NPM.
	 ****************************************************************************/
  	static appcnpm(){
	    let questions = [{
	      name: 'appc_npm_ver',
	      type: 'input',
	      message: 'Enter the Appc NPM version which you would like to download(e.g: 4.2.8) :',
	      validate: (value) => {
	        if (value.length) {
	          return true;
	        } else {
	          return 'Please enter the Appc NPM version which you would like to download.';
	        }
	      }
	    }];
	    inquirer.prompt(questions).then((answers) => {
	      const version = answers.appc_npm_ver;
	      output.info('solidarrow',`Downloading & installing Appc NPM version : ${version}`);
	        return new Promise((resolve, reject) => {
	          spinner_start();
	          exec(`sudo npm install -g appcelerator@${version}`, (err, data) => {
	          if(!err){
	            spinner_stop(true);
	            resolve(output.cyan(null ,data.trim()));
	          }
	          reject(err);
	        });
	      })
	      .catch(err => {output.error(err)});
	    });
  	}



	/*****************************************************************************
	 * Downloads & installs the specified SDK.
	 ****************************************************************************/
	static installsdk(){
	    return new Promise((resolve, reject) => {
	        let questions = [{
	        name: 'sdk_ver',
	        type: 'input',
	        message: 'Enter the SDK or the branch from which you would like to download the SDK(e.g: 6_0_X or SDK version) :',
	        validate: function(value) {
	          if (value.length) {
	            return true;
	          } else {
	            return 'Please enter SDK or the branch would you like to download the SDK(e.g: 6_0_X or SDK version) :';
	          }
	        }
	      }];
	      inquirer.prompt(questions).then(function(answers) {
	        return answers.sdk_ver;
	      })
	      .then(sdkver => {
	        let branch = false, arr = [];
	        arr.push(sdkver);
	        if((sdkver.match(/_/g))||sdkver.match(/^[A-z]/g)){
	          branch = true;
	          arr.push(branch);
	          return arr;
	        }
	        else{
	          arr.push(branch);
	          return arr;
	        }
	      })
	      .then(arr => {
	        if(arr[1]){      //if branch
	          output.info('solidarrow', `Downloading & extracting the latest SDK from branch : ${arr[0]}`);
	          spinner_start();
	          exec(`appc ti sdk install -b ${arr[0]} --default`, (err, data) => {
	            if(err){
	              if(err.toString().match(/does not exist/g)){
	                reject(`Provided branch ${arr[0]} does not exit. Please enter the correct branch.`);
	              }
	              reject(err);
	            }

	            if(data.match(/You\'re up-to-date/g)){
	              spinner_stop(true);
	              resolve(output.bold(output.cyan('tick',`You already have the latest SDK from the ${arr[0]} branch.\n`)));
	            }
	            else if(data.match(/successfully installed/g)){
	              spinner_stop(true);
	              resolve(output.cyan('tick', `Done, please find the latest SDK ${getLatestInstalledSDKVer()} installed in your titanium folder.`));
	            }
	          })
	        }
	        else{             //if SDK
	          spinner_start();
	          output.info('solidarrow', `Downloading & extracting the SDK : ${arr[0]}`);
	          exec(`appc ti sdk install ${arr[0]} --default`, (err, data) => {
	            if(err){
	              if(err.toString().match(/does not exist/g)){
	                spinner_stop(true);
	                reject(`Provided SDK ${arr[0]} does not exit.`);
	              }
	              reject(err);
	            }

	            if(data.match(/already installed!/g)){
	              spinner_stop(true);
	              resolve(output.cyan('tick', `You already have the SDK ${arr[0]} installed.`))
	            }
	            else if(data.match(/successfully installed/g)){
	              spinner_stop(true);
	              resolve(output.cyan('tick', 'Done, please find the latest SDK '+getLatestInstalledSDKVer()+' installed in your titanium folder.'))
	            }
	          });
	        }
	      })
	    })
	    .catch(err => output.error(err));
	}



	/*****************************************************************************
	 * Selects the specified SDK in CLI.
	 ****************************************************************************/
  	static selectsdk(){
	  return new Promise((resolve,reject) => {
		  let questions = [{
		    name: 'sdk_ver',
		    type: 'input',
		    message: 'Enter the SDK version which you would like to select :',
		    validate: value => {
		      if (value.length) {
		        return true;
		      } else {
		        return 'Please enter the SDK version which you would like to select.';
		      }
		    }
		  }];
		    inquirer.prompt(questions).then(answers => {
		    exec(`appc ti sdk select ${answers.sdk_ver}`, (err, data) => {
		      (!err)? data.includes('Configuration saved')? resolve(output.done(`SDK ${answers.sdk_ver} successfully selected.`)) : reject() : reject(err); 
		    });
		  });
		})
		.catch(err => {output.error('SDK not found. Please enter correct SDK version.')});
	}



	/*****************************************************************************
	 * Changes the env to prod or preprod.
	 ****************************************************************************/
	 static change_env(){
        inquirer.prompt({
        type: 'list',
        name: 'env_opt',
        message: 'Which environment would you like to be in ?',
        choices: [{
          name: 'PRODUCTION',
          value: 'production'
        },
        {
          name: 'PRE-PRODUCTION',
          value: 'preproduction'
        },
        {
          name: 'EXIT',
          value: 'exit'
        }]
      }).then(answers => {
        //Exit if EXIT
        if(answers.env_opt === 'exit'){
          //Quit the process
          process.exit();
        }
        else{return answers.env_opt};
      })
      .then(env => {
        return new Promise((resolve, reject) => {
          output.underline('solidarrow','LOGGING YOU OUT:');
           exec(`appc logout`, (err, result) => {
            if(!err){
              output.cyan(null, result);
              resolve(env);
            }
            else{reject(err)}
         });  
        })
      })
      .then(env => {
        return new Promise((resolve, reject) => {
          output.underline('solidarrow',`SETTING DEFAULT ENVIRONMENT TO ${env.toUpperCase()}:`);
          exec(`appc config set defaultEnvironment ${env}`, (err, result) =>{
            if(!err){
              output.cyan(null, result);
              resolve(env);
            }
            else{reject(err)}
          });
        })
      })
      .then(env => {
        return new Promise((resolve, reject) => {
          const orgID = (env === 'production')? prodOrgId : preProdOrgId;
          output.underline('solidarrow', 'LOGGING YOU IN:');
          exec(`appc login --username ${username} --password ${password} --org-id ${orgID}`, (err, result)=> {
            if(!err){
              output.cyan(null, result);
              resolve();
            }
            else{reject(err)}
          });
        }) 
      })
    .catch(err => {output.error(err)});
  }



  /*****************************************************************************
   * Uninstalls apps from devices & emulators
   ****************************************************************************/
	static uninstallapps(){ 
		return new Promise((resolve, reject) => {
			exec('appc appcd exec /android/latest/info/devices', (err, data) => {
				if(!err){resolve(data);}
				else{reject('Appc Daemon does not seem to be running. Please run appc appcd start OR restart')}
			});
		})
		.then(data => {
			const result = JSON.parse(data)["message"];
			let count = result.length-1;              //Substracting 1 because we are accessing array to make objects later & array starts with 0
			if(count > 0){
				let deviceArr = []; 
				while(count > -1){
					let deviceObj = {};	
					deviceObj.name = result[count].model;
	            	deviceObj.id = result[count].id;
	            	deviceArr.push(deviceObj);
	            	count --;
				}
				return deviceArr;
			}
			else{
				throw('\n\u2717 No device connected.\n');
			}	
		})
		.then(deviceArr => {
			return new Promise(resolve => {
				exec('adb -s emulator-5554 shell getprop', (err, data) => {
					if(!err){
						const emuName = [{name:'emulator-5554', id:'emulator-5554'}];
						deviceArr = deviceArr.concat(emuName);
						resolve(deviceArr);
					}
					else{resolve(deviceArr)}
				});
			})
			.then(deviceArr => {
				return deviceArr;
			});
		})
		.then(deviceArr => {
			return new Promise(resolve => {
				exec('adb -s 192.168.56.101:5555 shell getprop', (err, data) => {
					if(!err){
						const genyName = [{name:'192.168.56.101:5555', id:'192.168.56.101:5555'}];
						deviceArr = deviceArr.concat(genyName);
						resolve(deviceArr);
					}
					else{resolve(deviceArr)}
				});
			})
			.then(deviceArr => {
				return deviceArr;
			});
		})
		.then(deviceArr =>{
			let nameArr = []
			deviceArr.forEach(device => {
				nameArr.push(device.name);
			});
			return new Promise((resolve) =>{
				inquirer.prompt({
		        type: 'list',
		        name: 'device',
		        message: 'Select the device from which you want to remove apps ?',
		        choices: nameArr
			    })
			    .then(answer => {
			    	let obj = deviceArr.find(device => {return device.name === answer.device});
			    	resolve(obj); 
			    });
			});
		})
		.then(obj => {
			return new Promise((resolve,reject) => {
				adb.getPackages(obj.id,(err, pkgs) => {
					if(!err){
						let finalObj = {}, filteredPkgs = [];
						pkgs.filter(pkg => {
							if(pkg.match(/com.app.*/g) || pkg.match(/timob/ig)){
							filteredPkgs.push(pkg)
							}
						});
						finalObj.pkgs = filteredPkgs;
						finalObj.id = obj.id;
						resolve(finalObj);	
					}
					else{reject(err)}
				});
			})
		})
		.then(finalObj => {
			let count = finalObj.pkgs.length;
			if(count){ 
				finalObj.pkgs.forEach(pkg => {
					adb.uninstall(finalObj.id, pkg, err =>{
						if(!err){
							output.cyan('tick',`Removed package ${pkg}`);
							count --;
							if(count === 0){output.bold('tick','Done uninstalling all APPC apps\n')}
						}
						else{
							throw(err);
						}
					});
				});			
			}
			else{
				output.cyanbold('No \'com.app*\' or timob packages installed on the device.');
			}
		})
		.catch((err) => output.error(err));
	}



   /*****************************************************************************
   * Imports TIMOB apps with new guid's & no services
   ****************************************************************************/
   static importapps(){
   	return new Promise(resolve => {
	  let questions = [{
	    name: 'appname',
	    type: 'input',
	    message: 'Enter the app name you would like to import(app will be imported with no services):',
	    validate: value => {
	      if (value.length) {
	        return true;
	      } else {
	        return 'Please enter the app name which you would like to import.';
	      }
	    }
	  }];
	    inquirer.prompt(questions).then(answers => {
	    	const projectPath = require('../misc/util').workspace+`/${answers.appname}`;
	    	if(fs.existsSync(projectPath)){
		    	exec(`appc new --import -d ${projectPath} --no-services`, (err, result) => {
		    		if(!err){
		    			resolve(output.cyan(null, result));
		    		}
		    		else{throw(err)}
	    		});	
	    	}
	    	else{
	    		throw(`Project ${answers.appname} not found in the specified workspace. Please double check for typo.`)
	    	}
	  	})
	  	.catch(err => {output.error(err)});
   	});
   }	
}

//Function to get latest installed SDK from the titanium folder
const getLatestInstalledSDKVer = () => {
    const dir = path.join(os.homedir(), 'Library', 'Application Support', 'Titanium', 'mobilesdk', 'osx'),
  	folders = fs.readdirSync(dir);
    let filter_arr = [];
    //filtering out DS.store file from the array of folders
    folders.filter(function(folder){
      if(folder !== '.DS_Store'){
        filter_arr.push(folder);
      }
    });
    return _.max(filter_arr, function (f) {
      var fullpath = path.join(dir, f);
      // ctime = creation time is used
      // replace with mtime for modification time
      return fs.statSync(fullpath).ctime;
    });
};

module.exports = qeutility_util;
'use strict'

const clone = require('../misc/clone_repoutil'),
	  	output = require('../misc/output'),
	  	repolink_sdk = require('../misc/util').repolink_sdk,
	  	spinner_start = require('../misc/util').spinner_start,
    	spinner_stop = require('../misc/util').spinner_stop,
	  	sdk_dir = require('../misc/util').sdk_dir,
	  	inquirer = require('inquirer'),
	  	path = require('path'),
	  	exec = require('child_process').exec,
	  	spawn = require('child_process').spawn,
	  	execSync = require('child_process').execSync,
	  	fs = require('fs');


class sdkutil{

/*****************************************************************************
 * Check if SDK repo exists.
 ****************************************************************************/
	static sdkrepocheck(){
		return new Promise(resolve => {
			let exist = false;
			if(fs.existsSync(path.join(sdk_dir, 'titanium_mobile'))){
				exist = true;
				resolve(exist);
			}
			else{resolve(exist)}
		})
	}


/*****************************************************************************
 * Clone the SDK repo.
 ****************************************************************************/
	static cloneSDKrepo(){
		return new Promise(resolve => {
			sdkutil.sdkrepocheck()
			.then(exist => {
				if(!exist){
					clone.clonerepo(repolink_sdk, sdk_dir, 'titanium_mobile')
					.then(done => {
						if(!done){throw('Failed to clone titanium mobile repo')}
						else{resolve()}
					})
				}
				else{
					output.cyan(null,'\nTitanium mobile repo is already cloned & exists.\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Get the current PR number.
 ****************************************************************************/
	static getprno(){
		return new Promise(resolve => {
			const exist = false;
			const pr_no = execSync("git branch| grep '* pr/'|cut -c2-", [{setTimeout: 5000}]);
			(pr_no.toString().trim('') !== '')? resolve(pr_no.toString().trim('')):resolve(exist);
		})
	}


/*****************************************************************************
 * Git checkout to master.
 ****************************************************************************/
	static checkoutmaster(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'CHECKING OUT TO MASTER.');
			spinner_start();
			const prc = spawn('git', ['checkout', 'master']);
			prc.stdout.on('data', data => {
				spinner_stop(true);
				output.cyan(null, data)
			});
			prc.stderr.on('data', data => {
				spinner_stop(true);
				output.cyan(null, data)
			});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Delete the PR branch.
 ****************************************************************************/
	static deletebranch(prno){
		return new Promise(resolve => {
			output.underline('solidarrow', 'DELETING THE PR BRANCH.');
			const prc = spawn('git', ['branch', '-D', prno]);
			prc.stdout.on('data', data => {output.cyan(null, data)});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				output.cyan('null', '\nDONE\n');
				resolve();
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Fetch from origin.
 ****************************************************************************/
	static fetchorigin(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'FETCHING AGAIN FROM ORIGIN.');
			spinner_start();
			const prc = spawn('git', ['fetch', 'origin']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				spinner.stop(true);
				output.cyan('null', '\nDONE\n');
				resolve();
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Pulling from git for any new changes.
 ****************************************************************************/
	static gitpull(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'PULLING ANY NEW CHANGES FROM GITHUB:');
			spinner_start();
			const prc = spawn('git', ['pull']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				output.cyan('null', '\nDONE\n');
				resolve();
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Fetching any new Pr's added to the repo.
 ****************************************************************************/
	static fetchpr(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'FETCHING ALL PULL REQUESTS:');
			spinner_start();
			const prc = spawn('git', ['pull']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			// prc.stderr.on('data', data => {
			// 	spinner.stop(true);
			// 	output.cyan(null, data)
			// });
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				output.cyan('null', '\nDONE\n\n');
				resolve();
			})
		})
		.catch(err => {output.error(err)});
	}

/*****************************************************************************
 * Get the PR number from the user to build SDk for.
 ****************************************************************************/
	static getinputprno(){
		return new Promise(resolve => {
	      	let questions = [{
	        name: 'inputpr',
	        type: 'input',
	        message: 'ENTER THE PR NUMBER TO BUILD FOR :',
	        validate: value => {
	          if (value.length) {return true}
	          else {return this.message}
	        }
	      }];
	      inquirer.prompt(questions).then(answers => {
	        resolve(answers.inputpr);
	      });
		})
	}


/*****************************************************************************
 * Checkout to the PR using git checkout .
 ****************************************************************************/
	static checkoutpr(prno){
		return new Promise(resolve => {
			output.info(null, '\n');
			spinner_start();
			const prc = spawn('git', ['checkout', 'pr/'+prno]);
			prc.stdout.on('data', data => {
				spinner_stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {
				spinner_stop(true);
				output.cyan(null, data);
			});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Install/Update npm dependencies.
 ****************************************************************************/
	static npminstallsdk(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'RUNNING NPM INSTALL:');
			spinner_start();
			const prc = spawn('npm', ['install']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Run scons.js build.
 ****************************************************************************/
	static sdkbuild(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'BUILDING THE SDK:');
			spinner_start();
			const buildFldrPath = path.join(sdk_dir, 'titanium_mobile', 'build');
			process.chdir(buildFldrPath);
			const prc = spawn('node', ['scons.js', 'build']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Run scons.js package.
 ****************************************************************************/
	static packagesdk(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'PACKAGING THE SDK:');
			spinner_start();
			const prc = spawn('node', ['scons.js', 'package']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Run scons.js install.
 ****************************************************************************/
	static installsdk(){
		return new Promise(resolve => {
			output.underline('solidarrow', 'INSTALLING THE SDK:');
			spinner_start();
			const prc = spawn('node', ['scons.js', 'install']);
			prc.stdout.on('data', data => {
				spinner.stop(true);
				output.cyan(null, data);
			});
			prc.stderr.on('data', data => {output.cyan(null, data)});
			prc.on('error', err => {throw(err)});
			prc.on('close', code => {
				if(code !== 0){
					output.error(`Something went wrong. Please check console output. Exited with exit code ${code}.`)
					process.exit();
				}
				else{
					output.cyan('null', '\nDONE\n');
					resolve();
				}
			})
		})
		.catch(err => {output.error(err)});
	}


/*****************************************************************************
 * Ask user if he wants to build for asme PR he is on or build for a new PR.
 ****************************************************************************/
	static alreadyquestion(prno){
		return new Promise(resolve => {
	        let questions = [{
	        	name: 'choice',
            	type: 'confirm',
            	message: `You are already on a PR branch ${prno}. Do you want to rebuild for the same PR ?`
          	}];
          	inquirer.prompt(questions).then(answer => {
            	if (!answer.choice){
            		resolve({newpr: true, prno: ''});
            	}
           		else{
           			resolve({newpr: false, prno: prno.split('/')[1]});
           		}
          	});
		})
	}
}

module.exports = sdkutil;

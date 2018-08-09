'use strict'

const execute = require('../misc/util').execute,
      cyan = require('../misc/util').cyan,
      spinner_start = require('../misc/util').spinner_start,
      spinner_stop = require('../misc/util').spinner_stop,
      error = require('../misc/util').error,
      errorNExit = require('../misc/util').errorNExit,
      spawn = require('child_process').spawn,
      path = require('path'),
      output = require('../misc/output'),
      fs = require('fs');

class clonerepoutil{

/*****************************************************************************
 * Method to clone any appc repo.
 ****************************************************************************/
	static clonerepo(repo_link, repo_dir, repo_name){
		let done = false;
		return new Promise((resolve, reject) => {
			if(!fs.existsSync(repo_dir)){
				reject(output.error(`It seems ${repo_dir} does not exist. Please make sure the directory is present.`));
			}
			else{
				process.chdir(repo_dir);
				output.info('solidarrow', `Cloning ${repo_name} Please Wait ......\n`);
				const prc = spawn('git', ['clone', repo_link, '--progress']);
				prc.stderr.on('data', data => {output.cyan(null, data.toString())});
				prc.on('error', err => {reject(output.error(err.toString()))});
				prc.on('close', code => {
					output.cyan('tick', 'Cloning done successfully.');
					const configfile = path.join(repo_dir, repo_name, '/.git');
					clonerepoutil.modifyConfig(configfile)
					.then(done => {
						if(!done){
							done = true;
							resolve(done);
						}
						else{resolve(done)}
					})
				});
			}
		})
		.catch(err => {output.error(err)});
	}

/*****************************************************************************
 * Modify config file in the repo so that git pull can get app the PR's.
 ****************************************************************************/
	static modifyConfig(filepath){
		return new Promise((resolve, reject) => {
			let done = false;
			process.chdir(filepath);
			output.cyan('solidarrow', "Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file");
			let data = '', text = '';
			data = fs.readFileSync('config').toString().split("\n");
			data.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
			text = data.join("\n");
			fs.writeFile('config', text, err => {
		      if (!err){
		      	output.cyan('tick', 'Done');
		      	done = true;
		      	resolve(done);
		      }
		      else {resolve(done)}
		  });
		})
		.catch(err => {output.error(err)});
	}
}

module.exports = clonerepoutil;

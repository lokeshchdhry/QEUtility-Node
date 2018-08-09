'use strict'

const chalk = require('chalk'),
	  cyan = chalk.cyan,
	  underline = chalk.underline,
	  bold = chalk.bold,
	  error = chalk.red;

class output {
	static cyan(symbol,message){
		switch(symbol){
			case 'tick':
				process.stdout.write(cyan(`\n\u2714 ${message} \n`));
				break;

			case 'solidarrow':
				process.stdout.write(cyan(`\n\u25B6 ${message} \n`));
				break;

			case 'arrow':
				process.stdout.write(cyan(`\u21E8 ${message}`));
				break;

			case 'cross':
				process.stdout.write(`\u2717 ${message}`);

			default:
				process.stdout.write(cyan(`${message}`));
				break;
		}
	}

	static underline(symbol, message){
		switch(symbol){
			case 'solidarrow':
				process.stdout.write(underline(`\n\u25B6 ${message}\n`));
				break;

			default:
				process.stdout.write(underline(`${message}`));
				break;
		}
	}

	static bold(symbol, message){
		switch(symbol){
			case 'tick':
				process.stdout.write(bold(`\n\u2714 ${message}\n`));
				break;

			default:
				process.stdout.write(bold(`${message}`));
				break;
		}
	}

	static error(message){
		process.stdout.write(error(`\n${message}\n`));
	}

	static done(message){
		process.stdout.write(cyan(`\n\u2714 ${message}\n`));
	}

	static cyanbold(message){
		process.stdout.write(bold(cyan(`${message}\n`)));
	}

	static info(symbol, message){
		switch(symbol){
			case 'solidarrow':
				process.stdout.write(`\n\u25B6 ${message}\n`);
				break;

			case 'tick':
				process.stdout.write(`\u2714 ${message}\n`);
				break;

			case 'cross':
				process.stdout.write(`\u2717 ${message}`);

			default:
				process.stdout.write(`${message}`);
				break;
		}
	}
}

module.exports = output;

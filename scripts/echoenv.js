const fs = require('fs');
const shell = require('shelljs');
const checkIfDotFileExists = (dir = `${process.cwd()}/.env`) => fs.existsSync(dir);

if (!checkIfDotFileExists()) {
  shell.echo('.env file does not exist!!');
  shell.exit(1);
}
shell.echo('.env');
const shellString = shell.cat('-n', '.env');
console.log(shellString.stdout);

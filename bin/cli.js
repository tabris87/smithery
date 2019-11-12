const program = require('commander');
const fs = require('fs');


const packageInfo = fs.readFileSync('./package.json', 'utf-8');

const _setupOptions = function() {
    program
        .version(packageInfo.version)
        .option("-b", "--base <string> [fileName]", "The base JS file for feature merging")
        .option("-f", "--feature <string> [fileName]" , "The feature JS file for feature merging")
}

const run = function(oProcess) {
    _setupOptions();
    program.parse(oProcess.argv);
    console.log('WAT');
}

const cli = {
    run
};

module.exports = cli;
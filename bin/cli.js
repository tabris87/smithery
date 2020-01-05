const program = require('commander');
const fs = require('fs');
const init = require('./commands/init');
const merge = require('./commands/merge');


const packageInfo = fs.readFileSync('./package.json', 'utf-8');

const _setupOptions = function () {
    program
        .version(packageInfo.version)

    program
        .command('init') // sub-command name
        .alias('I')
        .description('Inititalize the project setup') // command description

        // function to execute when command is used
        .action(function (args) {
            init(args);
        });

    program
        .command('merge <base> <feature>') // sub-command name
        .alias('M')
        .description('Merge two files given (base and feature file), by the default rules') // command description

        // function to execute when command is used
        .action(function (base, feature, args) {
            merge(base, feature, args);
        });
}

const run = function (oProcess) {
    _setupOptions();
    program.parse(oProcess.argv);
}

const cli = {
    run
};

module.exports = cli;
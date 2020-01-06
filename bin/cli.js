const program = require('commander');
const command = require('./commands');
const packageInfo = require('../package.json');

const _setupOptions = function () {
    program
        .version(packageInfo.version)

    program
        .command('init') // sub-command name
        .alias('I')
        .description('Inititalize the project setup') // command description

        // function to execute when command is used
        .action(function (args) {
            command.init(args);
        });

    program
        .command('merge <base> <feature> [output]') // sub-command name
        .alias('M')
        .description('Merge two files given (base and feature file), by the default rules') // command description
        .on('--help', function () {
            console.log('\n', 'Examples:\n', '\n', '$fjs merge ./base.js ./feature.js\n', '$fjs merge ./base.js ./feature.js ./output.js');
        })
        // function to execute when command is used
        .action(function (base, feature, output) {
            command.merge(base, feature, output);
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
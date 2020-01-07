const program = require('commander');
const commands = require('./commands');
const packageInfo = require('../package.json');

const _setupOptions = function () {
    program
        .version(packageInfo.version)

    for (var key of Object.keys(commands)) {
        commands[key].createCommand(program);
    }
    /* program
        .command('init') // sub-command name
        .alias('I')
        .description('Inititalize the project setup') // command description

        // function to execute when command is used
        .action(function (args) {
            command.init(args);
        }); */

    /*  program
         .command('merge <base> <feature> [output]') // sub-command name
         .alias('M')
         .description('Merge two files given (base and feature file), by the default rules') // command description
         .on('--help', function () {
             console.log('\n', 'Examples:\n', '\n', '$fjs merge ./base.js ./feature.js\n', '$fjs merge ./base.js ./feature.js ./output.js');
         })
         // function to execute when command is used
         .action(function (base, feature, output) {
             command.merge(base, feature, output);
         }); */

    /* program
        .command('build [configName]')
        .alias('B')
        .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
        .on('--help', function () {
            console.log('\n', 'Examples:\n', '\n', '$fjs build config1\n', '$fjs build config1')
        })
        .action(function(configName) {
            command.
        }); */
}

const run = function (oProcess) {
    _setupOptions();
    program.parse(oProcess.argv);
}

const cli = {
    run
};

module.exports = cli;
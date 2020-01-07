"use strict";
const ProjectCL = require('../../lib/Project');

function build(configName) {
    if (!configName) {
        console.log('No config name given, try to use the default config!\n');
    }

    let oProject = new ProjectCL();
    oProject.build(configName);
}

module.exports = {
    createCommand: function (program) {
        program
            .command('build [configName]')
            .alias('B')
            .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
            .on('--help', function () {
                console.log('\n', 'Examples:\n', '\n', '$fjs build config1\n', '$fjs build config1')
            })
            .action(function (configName) {
                build(configName);
            });
    }
}
const program = require('commander');
const commands = require('./commands');
const packageInfo = require('../package.json');

const _setupOptions = function () {
    program
        .version(packageInfo.version)

    for (var key of Object.keys(commands)) {
        commands[key].createCommand(program);
    }
}

const run = function (oProcess) {
    _setupOptions();
    program.parse(oProcess.argv);
}

const cli = {
    run
};

module.exports = cli;
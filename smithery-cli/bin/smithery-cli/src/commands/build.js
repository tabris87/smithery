"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Project_1 = require("../../../smithery-core/src/Project");
function build(configName) {
    if (!configName) {
        console.log('No config name given, try to use the default config!\n');
    }
    let oProject = new Project_1.Project();
    oProject.build(configName);
}
class Build {
    prepare(program) {
        program
            .command('build [configName]')
            .alias('B')
            .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
            .on('--help', function () {
            console.log('\n', 'Examples:\n', '\n', '$fjs build config1\n', '$fjs build config1');
        })
            .action(function (configName) {
            build(configName);
        });
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map
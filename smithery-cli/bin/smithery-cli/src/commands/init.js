"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");
function init() {
    const workingDir = process.cwd();
    if (fs.existsSync(path.join(workingDir, ".smithery"))) {
        console.log(chalk.yellow.bold("There exists already a smithery project file!"));
        process.exit(1);
    }
    const questions = [{
            type: 'input',
            name: 'model',
            message: 'Where should the model stored?',
            default: './model.xml'
        },
        {
            type: 'input',
            name: 'configs',
            message: 'Where should the configurations stored?',
            default: 'configurations',
        },
        {
            type: 'input',
            name: 'projectFiles',
            message: 'Where should the project files stored?',
            default: 'features',
            validate: function (input) {
                if (input === "") {
                    return "You have to enter a valid path!";
                }
                else {
                    return true;
                }
            }
        },
        {
            type: 'input',
            name: 'buildFolder',
            message: 'Where should the build placed?',
            default: 'build',
            validate: function (input) {
                if (input === "") {
                    return "You have to enter a valid path!";
                }
                else {
                    return true;
                }
            }
        }
    ];
    inquirer
        .prompt(questions)
        .then(function (answers) {
        var sProjectConfig = JSON.stringify(answers);
        sProjectConfig = sProjectConfig.replace(/,/g, ',\n\t');
        sProjectConfig = sProjectConfig.replace(/\{/, '{\n\t');
        sProjectConfig = sProjectConfig.replace(/\}/, '\n}');
        fs.writeFileSync(path.join(workingDir, '.smithery'), sProjectConfig);
        process.exit(0);
    });
}
class Init {
    prepare(program) {
        program
            .command('init')
            .alias('I')
            .description('Initialize the project setup')
            .action(() => { init(); });
    }
}
exports.Init = Init;
//# sourceMappingURL=init.js.map
const fs = require('fs');
const path = require('path');
const chalk = require("chalk");
const inquirer = require("inquirer");

module.exports = function () {
    const sWorkingDir = process.cwd();

    if (fs.existsSync(path.join(sWorkingDir, ".featureJS"))) {
        console.log(chalk.yellow.bold("There exists already a featureJS project file!"));
        process.exit(1);
    }

    const questions = [{
            type: 'input',
            name: 'model',
            message: 'Where should the model stored?',
            default: './model.model'
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
            validate: function (input) {
                if (input === "") {
                    return "You have to enter a valid path!";
                } else {
                    return true;
                }
            }
        },
        {
            type: 'input',
            name: 'buildFolder',
            message: 'Where should the build placed?',
            validate: function (input) {
                if (input === "") {
                    return "You have to enter a valid path!";
                } else {
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
            fs.writeFileSync(path.join(sWorkingDir, '.featureJS'), sProjectConfig);
            process.exit(0);
        });
}
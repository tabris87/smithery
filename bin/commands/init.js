const fs = require('fs');
const path = require('path');
const chalk = require("chalk");

module.exports = function (args) {
    const sWorkingDir = process.argv[1];

    if (fs.existsSync(path.join(sWorkingDir, ".featureJS"))) {
        console.log(chalk.yellow.bold("There exists already a featureJS project file!"));
        process.exit(1);
    }

    console.log('Asking questions');
    process.exit(0);
}
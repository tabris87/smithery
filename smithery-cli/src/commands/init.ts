import { SmitheryCommand } from '../interfaces';

import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';

function init(): void {
  const workingDir: string = process.cwd();

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
    validate: function (input: string) {
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
    default: 'build',
    validate: function (input: string) {
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
      fs.writeFileSync(path.join(workingDir, '.smithery'), sProjectConfig);
      process.exit(0);
    });
}

export class Init implements SmitheryCommand {
  prepare(program: any): void {
    program
      .command('init')
      .alias('I')
      .description('Initialize the project setup')
      .action(() => { init(); });
  }
}
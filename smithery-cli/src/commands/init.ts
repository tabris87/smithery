import { SmitheryCommand } from '../interfaces';

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

function setupProjectStructure(configs: {
  model: string,
  configs: string,
  projectFiles: string,
  buildFolder: string
}): void {
  Object.values(configs).forEach(value => {
    const pathParts: string[] = value.split(/(\\|\/)/);
    pathParts.forEach((value: string, index: number, arr: string[]) => {
      const checkPath = path.join(process.cwd(), ...arr.slice(0, index + 1));
      if (!fs.existsSync(checkPath)) {
        if (path.extname(value) !== '') {
          fs.writeFileSync(checkPath, '', 'utf-8');
        } else {
          fs.mkdirSync(checkPath);
        }
        if (index === arr.length - 1) {
          console.log(`\u001B[32m${checkPath} [created]\u001b[0m`);
        }
      } else {
        if (index === arr.length - 1) {
          console.log(`\u001B[33m${checkPath} [skipped] -> already exists!\u001b[0m`);
        }
      }
    })
  });
}

function init(): void {
  const workingDir: string = process.cwd();

  if (fs.existsSync(path.join(workingDir, ".smithery"))) {
    console.log(`\u001b[4m\u001B[33m'.smithery' config-file already exists. Generating structure:\u001b[0m`);
    const configFile = JSON.parse(fs.readFileSync(path.join(workingDir, '.smithery'), 'utf-8'));
    setupProjectStructure(configFile);
    process.exit(0);
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
      let sProjectConfig = JSON.stringify(answers);
      sProjectConfig = sProjectConfig.replace(/,/g, ',\n\t');
      sProjectConfig = sProjectConfig.replace(/\{/, '{\n\t');
      sProjectConfig = sProjectConfig.replace(/\}/, '\n}');
      fs.writeFileSync(path.join(workingDir, '.smithery'), sProjectConfig);

      setupProjectStructure(answers);
      process.exit(0);
    });
}

export class Init implements SmitheryCommand {
  prepare(commander: any, program: any): void {
    commander
      .command('init')
      .alias('I')
      .description('Initialize the project setup')
      .action(() => { init(); });
  }
}
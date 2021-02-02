#!/usr/bin/env node
import { commands } from './commands';
import { SmitheryCommand } from './commands/SmitheryCommand.class';
import { version as smithVersion } from 'smithery/package.json'

type PACKAGEJSON = {
  [key: string]: number | boolean | string | PACKAGEJSON
}

class SmitheryCLI {
  private packageJSON: PACKAGEJSON;
  private commands: SmitheryCommand[] = commands;
  constructor() {
    this.packageJSON = require('../package.json');
    this._setupOptions
  }

  private _setupOptions() {
    this.commands = commands;
  }

  public run(argv: string[]): void {
    console.log(argv.join('; '))
    const information = this.processCmdCall(argv);
    let matchingCMD;
    for (let com of this.commands) {
      if (com.commandName === information.command) {
        matchingCMD = com;
      }
    }

    console.log('---')
    console.dir(information)
    console.log('---')

    if (matchingCMD) {
      matchingCMD.execute(information.argument, information.options);
    } else if (information?.command.trim() === '' && (information.options?.v || information.options?.version)) {
      const version = (this.packageJSON.version as string);
      const description = ('CLI wrapper for the smithery tooling');
      console.log(`smithery-cli ${version}\n${description}\nsmithery at version: ${smithVersion}`);
    } else {
      console.log(this.buildGlobalHelp());
    }
  }

  private buildGlobalHelp(): string {
    return 'PLEASE HELP ME!!!';
  }

  private processCmdCall(argv: string[]): { command: string, argument?: string | string[], options?: { [key: string]: boolean | string } } {
    console.log(argv.join('; '))
    const result: { command: string, argument?: string | string[], options?: { [key: string]: boolean | string } } = { command: '' };
    let commandParts = argv.splice(2);
    console.log(commandParts.join('; '))
    result.command = commandParts[0];
    if (result.command.startsWith('-')) {
      result.command = '';
    } else {
      commandParts = commandParts.splice(1);
    }
    const cmdArguments = commandParts.filter(a => a.substring(0, 2).indexOf('--') < 0).filter(a => a.substring(0, 1).indexOf('-') < 0);
    const options = commandParts.filter(a => a.substring(0, 2).indexOf('--') === 0);
    const shortOptions = commandParts.filter(a => a.substring(0, 2).indexOf('--') !== 0).filter(a => a.substring(0, 1).indexOf('-') === 0);

    for (let so of shortOptions) {
      //for now we assume short options to be only boolean
      if (!result.options) {
        result.options = {};
      }
      result.options[so.replace('-', '').toLowerCase()] = true;
    }

    for (let op of options) {
      if (!result.options) {
        result.options = {};
      }
      const option = op.split('=');
      if (option.length > 1) {
        result.options[option[0].replace('--', '').toLowerCase()] = option[1];
      } else {
        result.options[option[0].replace('--', '').toLowerCase()] = true;
      }
    }

    if (cmdArguments.length > 1) {
      result.argument = cmdArguments;
    } else {
      result.argument = cmdArguments[0];
    }

    return result;
  }
}

const smithCLi = new SmitheryCLI();
smithCLi.run(process.argv);
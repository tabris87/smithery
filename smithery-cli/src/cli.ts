#!/usr/bin/env node
import * as commander from 'commander';
import { commands } from './commands';

class SmitheryCLI {
  private packageJSON: { [key: string]: any };
  constructor() {
    this.packageJSON = require('../package.json');
    this._setupOptions();
  }

  private _setupOptions() {
    commander.program.version(this.packageJSON.version);
    commands.forEach(command => {
      command.prepare(commander.program);
    })/* 
    for (let key of Object.keys(this.commands)) {
      this.commands[key].createCommand(program);
    } */
  }

  public run(): void {
    commander.program.parse(process.argv);
  }
}

const smithCLi = new SmitheryCLI();
smithCLi.run();
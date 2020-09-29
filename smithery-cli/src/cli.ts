import { program } from 'commander';

export class SmitheryCLI {
  private packageJSON: { [key: string]: any };
  private commands: { [key: string]: any };
  constructor() {
    this.packageJSON = require('../package.json');
    this.commands = require('./commands');
    this._setupOptions();
  }

  private _setupOptions() {
    program.version(this.packageJSON.version);
    for (let key of Object.keys(this.commands)) {
      this.commands[key].createCommand(program);
    }
  }

  public run(): void {
    program.parse(process.argv);
  }
}
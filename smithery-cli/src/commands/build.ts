import { Project } from 'smithery';
import { version } from 'smithery/package.json';
import { SmitheryCommand } from './SmitheryCommand.class';
import { Watcher } from '../utils/Watcher';
import { EventName } from '../utils/IWatcher';

export class Build extends SmitheryCommand {
  constructor() {
    super('build')
  }

  public execute(cmdArguments?: string | string[], options?: { [key: string]: string | number | boolean; }): void {
    if (cmdArguments && Array.isArray(cmdArguments)) {
      throw new Error('Only one Build-Configuration can be used for the build command!');
    }

    if (!cmdArguments && (options?.help || options?.h)) {
      console.log(this.showCommandHelp());
      return;
    }

    this.build(cmdArguments, options);
  }

  public showCommandHelp(): string {
    const parts = [
      'build [argument] [options]',
      '',
      'Argument:',
      '\tconfig\t\tname of the configuration to build',
      'Options:',
      '\twatch|w\t\tenables watch mode for the build',
      '\thelp|h\t\tshows this help',
      '',
      'Examples:',
      '\t$smith build',
      '\t$smith build config1',
      '\t$smith build config2 -w',
      '\t$smith build config2 --watch',
      '\t$smith build -h'
    ]
    return parts.join('\n')
  }

  public getCommandShortHelp(): string {
    return '\tbuild\t\tbuilds the project depending on given configuration and setup'
  }

  private build(config: string | undefined, options?: { [key: string]: string | number | boolean }): void {
    console.log(`Starting Build with 'smithery' at version ${version}`);
    const oProject = new Project();
    let watch = options?.watch || options?.w;
    if (watch) {
      const w = new Watcher();
      w.watch(oProject.getProjectRoot());
      w.on(EventName.changed, (changedPath: string) => {
        console.log(`Change at ${changedPath} detected, rebuild...`);
        oProject.build(config);
      })
    }
    oProject.build(config);
  }
}
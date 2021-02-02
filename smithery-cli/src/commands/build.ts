import { Project } from 'smithery';
import { version } from 'smithery/package.json';
import { SmitheryCommand } from './SmitheryCommand.class';
import { Watcher, EventName } from '../utils/Watcher';

function build(config: string, options: any[], command: any) {
  console.log(`Starting Build with 'smithery' at version ${version}`);
  debugger;
  const oProject = new Project();
  let watch = false;
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

export class Build extends SmitheryCommand {
  public execute(cmdArguments?: string | string[], options?: { [key: string]: string | number | boolean; }): void {
    throw new Error('Method not implemented.');
  }
  public showCommandHelp(): string {
    throw new Error('Method not implemented.');
  }
  /* prepare(program: any): void {
    program
      .command('build')
      .arguments('<config>')
      .alias('B')
      .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
      .on('--help', function () {
        console.log('\n', 'Examples:\n', '\n', '$smith build config1\n', '$smith build config1');
      })
      .option('-w, --watch', 'enable watch mode')
      .action(build);
  } */
}
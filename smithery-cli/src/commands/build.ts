import { Project } from 'smithery';
import { version } from 'smithery/package.json';
import { SmitheryCommand } from '../interfaces';
import { Watcher, EventName } from '../utils/Watcher';

function build(watch: boolean, configName?: string) {
  console.log(`Starting Build with 'smithery' at version ${version}`);
  const oProject = new Project();
  if (watch) {
    const w = new Watcher();
    w.watch(oProject.getProjectRoot());
    w.on(EventName.changed, (changedPath: string) => {
      console.log(`Change at ${changedPath} detected, rebuild...`);
      oProject.build(configName);
    })
  }
  oProject.build(configName);
}

export class Build implements SmitheryCommand {
  prepare(program: any): void {
    program
      .command('build [configName]')
      .alias('B')
      .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
      .on('--help', function () {
        console.log('\n', 'Examples:\n', '\n', '$smith build config1\n', '$smith build config1');
      })
      .option('-w', '--watch', 'enable watch mode')
      .action(function (configName: string) {
        build(program.watch, configName);
      });
  }
}
import { Project } from 'smithery';
import { SmitheryCommand } from '../interfaces';

function build(configName: string) {
  if (!configName) {
    console.log('No config name given, try to use the default config!\n');
  }

  const oProject = new Project();
  oProject.build(configName);
}

export class Build implements SmitheryCommand {
  prepare(program: any): void {
    program
      .command('build [configName]')
      .alias('B')
      .description('Starts the build of your product by the given configuration, otherwise tries to use the default config')
      .on('--help', function () {
        console.log('\n', 'Examples:\n', '\n', '$fjs build config1\n', '$fjs build config1');
      })
      .action(function (configName: string) {
        build(configName);
      });
  }
}
import { Project } from 'smithery';
import { version } from 'smithery/package.json';
import { SmitheryCommand } from '../interfaces';

function build(configName?: string) {
  console.log(`Starting Build with 'smithery' at version ${version}`);
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
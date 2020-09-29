import { Command } from 'commander';

export interface CliCommand {
  createCommand(programm: Command): void;
}
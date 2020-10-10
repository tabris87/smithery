import * as commander from 'commander';

export interface SmitheryCommand {
  prepare(prog: any): void;
}
import { Init } from './init';
import { Build } from './build';
import { Help } from './help';
import { SmitheryCommand } from './SmitheryCommand.class';

export const commands: SmitheryCommand[] = [new Init(), new Build(), new Help()];
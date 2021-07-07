import { SmitheryCommand } from './SmitheryCommand.class';
import { commands } from './index';

export class Help extends SmitheryCommand {
    constructor() {
        super('help');
    }

    public execute(cmdArguments?: string | string[], options?: { [key: string]: string | number | boolean; }): void {
        let commandName = '';
        if (cmdArguments && Array.isArray(cmdArguments) && cmdArguments?.length === 1) {
            commandName = cmdArguments[0];
        } else if (cmdArguments && !Array.isArray(cmdArguments)) {
            commandName = cmdArguments;
        } else {
            console.log('Incorrect number of arguments!!')
            console.log(this.showCommandHelp());
            return;
        }

        for (let co of commands) {
            if (co.commandName.trim() === commandName.trim()) {
                console.log(co.showCommandHelp());
            }
        }
    }

    public getCommandShortHelp(): string {
        return '\thelp\t\tshows the detailed help of a command'
    }

    public showCommandHelp(): string {
        const parts = [
            'help <argument>',
            '',
            'Argument:',
            '\tcommandname\t\tshows the help of the command',
            '',
            'Examples:',
            '\t$smith help init',
            '\t$smith help build'
        ]
        return parts.join('\n')
    }
}
export abstract class SmitheryCommand {
    constructor(public commandName: string) { }
    public abstract execute(cmdArguments?: string | string[], options?: { [key: string]: string | boolean | number }): void;
    public abstract getCommandShortHelp(): string
    public abstract showCommandHelp(): string;
}
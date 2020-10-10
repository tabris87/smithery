#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const commands_1 = require("./commands");
class SmitheryCLI {
    constructor() {
        this.packageJSON = require('../package.json');
        this._setupOptions();
    }
    _setupOptions() {
        commander.program.version(this.packageJSON.version);
        commands_1.commands.forEach(command => {
            command.prepare(commander.program);
        }); /*
        for (let key of Object.keys(this.commands)) {
          this.commands[key].createCommand(program);
        } */
    }
    run() {
        commander.program.parse(process.argv);
    }
}
const smithCLi = new SmitheryCLI();
smithCLi.run();
//# sourceMappingURL=cli.js.map
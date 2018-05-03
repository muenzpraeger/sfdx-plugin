"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const path_1 = require("path");
const command_2 = require("@salesforce/command");
command_2.core.Messages.importMessagesDirectory(path_1.join(__dirname, '..', '..', '..'));
const messages = command_2.core.Messages.loadMessages('muenzpraeger-sfdx-plugin', 'apexSwaggerGenerate');
class Import extends command_2.SfdxCommand {
    async run() {
        const resp = {};
        return resp;
    }
}
Import.description = messages.getMessage('commandDescription');
Import.examples = [
    `$ sfdx muenzpraeger:apex:swagger:generate -d . -p http://petstore.swagger.io/v2/swagger.json
  Swagger definition file got created.
  `
];
Import.flagsConfig = {
    help: command_1.flags.help({ char: 'h' }),
    file: command_1.flags.string({
        char: 'f',
        description: messages.getMessage('flagFileDescription'),
        required: true
    }),
    instance: command_1.flags.string({
        char: 'i',
        description: messages.getMessage('flagInstanceDescription'),
        required: true
    })
};
Import.supportsDevhubUsername = true;
Import.supportsUsername = true;
exports.default = Import;
//# sourceMappingURL=generate.js.map
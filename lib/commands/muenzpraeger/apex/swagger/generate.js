"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recursiveReaddir = require("recursive-readdir");
const fs_extra_1 = require("fs-extra");
const command_1 = require("@oclif/command");
const path_1 = require("path");
const command_2 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
command_2.core.Messages.importMessagesDirectory(path_1.join(__dirname, '..', '..', '..'));
const messages = command_2.core.Messages.loadMessages('muenzpraeger-sfdx-plugin', 'apexSwaggerGenerate');
class Import extends command_2.SfdxCommand {
    async run() {
        const resp = {};
        const project = await core_1.Project.resolve();
        if (!project) {
            throw new core_1.SfdxError(messages.getMessage('errorNoSfdxProject'));
        }
        const apiRegex = /@RestResource/g;
        const projectJson = await project.resolveProjectConfig();
        const basePath = this.project.getPath();
        const packageDirectories = projectJson['packageDirectories']; // tslint:disable-line:no-any
        const that = this;
        for (const packageConfig of packageDirectories) {
            const sourcePath = path_1.join(basePath, packageConfig.path);
            this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
            const files = recursiveReaddir(sourcePath);
            files
                .then(function (result) {
                const filesFiltered = [];
                for (const file of result) {
                    if (file.endsWith('cls')) {
                        filesFiltered.push(file);
                    }
                }
                if (filesFiltered.length === 0) {
                    that.ux.log(messages.getMessage('msgNoApexClassesInPackageDirectories'));
                    resp.message = messages.getMessage('msgNoApexClassesInPackageDirectories');
                    return resp;
                }
                resp.files = [];
                for (const file of filesFiltered) {
                    let data = fs_extra_1.readFileSync(file, 'utf8');
                    data = data.toString();
                    if (data.search(apiRegex) > -1) {
                        data = data.replace(apiRegex, apiCurrent);
                        fs_extra_1.writeFileSync(file, data);
                        resp.files.push(file);
                        noChangedFiles++;
                    }
                }
            })
                .then(function () {
                that.ux.log(messages.getMessage('successMessage', [
                    noChangedFiles,
                    that.flags.apiversion
                ]));
                resp.message = messages.getMessage('successMessage', [
                    noChangedFiles,
                    that.flags.apiversion
                ]);
                return resp;
            })
                .catch(function (error) {
                throw new core_1.SfdxError(error);
            });
        }
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
Import.requiresProject = true;
exports.default = Import;
//# sourceMappingURL=generate.js.map
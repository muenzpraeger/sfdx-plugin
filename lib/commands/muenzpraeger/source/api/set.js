"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recursiveReaddir = require("recursive-readdir");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
command_1.core.Messages.importMessagesDirectory(path_1.join(__dirname, '..', '..', '..'));
const messages = command_1.core.Messages.loadMessages('@muenzpraeger/sfdx-plugin', 'sourceApiSet');
class SourceApiSet extends command_1.SfdxCommand {
    async run() {
        const resp = {};
        const project = await core_1.Project.resolve();
        if (!project) {
            throw new core_1.SfdxError(messages.getMessage('errorNoSfdxProject'));
        }
        if (this.flags.apiversion &&
            !core_1.SfdxUtil.validateApiVersion(this.flags.apiversion)) {
            throw new core_1.SfdxError(messages.getMessage('errorInvalidApiVersionFormat', [
                this.flags.apiversion
            ]));
        }
        if (!this.flags.apiversion) {
            await this.hubOrg.refreshAuth();
            const conn = this.hubOrg.getConnection();
            if (conn) {
                this.flags.apiversion = conn.getApiVersion();
            }
            else {
                throw new core_1.SfdxError(messages.getMessage('errorDevHubConnection'));
            }
        }
        const apiRegex = /<apiVersion>[0-9][0-9]\.0<\/apiVersion>/g;
        const apiCurrent = `<apiVersion>${this.flags.apiversion}</apiVersion>`;
        const projectJson = await project.resolveProjectConfig();
        const basePath = this.project.getPath();
        const packageDirectories = projectJson['packageDirectories']; // tslint:disable-line:no-any
        const that = this;
        this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
        for (const packageConfig of packageDirectories) {
            let noChangedFiles = 0;
            const sourcePath = path_1.join(basePath, packageConfig.path);
            const files = recursiveReaddir(sourcePath);
            files
                .then(function (result) {
                const filesFiltered = [];
                for (const file of result) {
                    if (file.endsWith('meta.xml')) {
                        filesFiltered.push(file);
                    }
                }
                if (filesFiltered.length === 0) {
                    that.ux.log(messages.getMessage('msgNoMetadataInPackageDirectories'));
                    resp.message = messages.getMessage('msgNoMetadataInPackageDirectories');
                    return resp;
                }
                resp.files = [];
                for (const file of filesFiltered) {
                    let data = fs_extra_1.readFileSync(file, 'utf8');
                    data = data.toString();
                    if (data.search(apiRegex) > 0 && data.search(apiCurrent) === -1) {
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
                    that.flags.apiversion,
                    packageConfig.path
                ]));
                resp.message = messages.getMessage('successMessage', [
                    noChangedFiles,
                    that.flags.apiversion,
                    packageConfig.path
                ]);
                return resp;
            })
                .catch(function (error) {
                throw new core_1.SfdxError(error);
            });
        }
    }
}
SourceApiSet.description = messages.getMessage('commandDescription');
SourceApiSet.examples = [
    `$ sfdx muenzpraeger:source:api:set
    Reading content of package directories
    45 files have been set to API version 42.0.
  `,
    `$ sfdx muenzpraeger:source:api:set -a 41.0
    Reading content of package directories
    45 files have been set to API version 41.0.
  `
];
SourceApiSet.flagsConfig = {
    help: command_1.flags.help({ char: 'h' }),
    apiversion: command_1.flags.string({
        char: 'a',
        description: messages.getMessage('flagApiversionDescription')
    })
};
SourceApiSet.supportsDevhubUsername = true;
SourceApiSet.requiresProject = true;
exports.default = SourceApiSet;
//# sourceMappingURL=set.js.map
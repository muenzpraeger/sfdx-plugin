"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recursiveReaddir = require("recursive-readdir");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
command_1.core.Messages.importMessagesDirectory(path_1.join(__dirname, '..', '..', '..'));
const messages = command_1.core.Messages.loadMessages('@muenzpraeger/sfdx-plugin', 'sourceCleanupAura');
class SourceCleanupAura extends command_1.SfdxCommand {
    isAuraFile(file) {
        if (file.endsWith('auradoc') ||
            file.endsWith('css') ||
            file.endsWith('design') ||
            file.endsWith('svg') ||
            file.endsWith('Controller.js') ||
            file.endsWith('Helper.js') ||
            file.endsWith('Renderer.js')) {
            return true;
        }
        return false;
    }
    isAuraStandardContent(fileContent) {
        const regex = /\s/g;
        const data = fileContent.replace(regex, '');
        if (data === SourceCleanupAura.controller) {
            return true;
        }
        else if (data === SourceCleanupAura.css) {
            return true;
        }
        else if (data === SourceCleanupAura.helper) {
            return true;
        }
        else if (data === SourceCleanupAura.design) {
            return true;
        }
        else if (data === SourceCleanupAura.auradoc) {
            return true;
        }
        else if (data === SourceCleanupAura.renderer) {
            return true;
        }
        else if (data === SourceCleanupAura.svg) {
            return true;
        }
        return false;
    }
    async run() {
        const resp = {};
        const project = await core_1.Project.resolve();
        if (!project) {
            throw new core_1.SfdxError(messages.getMessage('errorNoSfdxProject'));
        }
        const projectJson = await project.resolveProjectConfig();
        const basePath = this.project.getPath();
        const packageDirectories = projectJson['packageDirectories']; // tslint:disable-line:no-any
        const that = this;
        this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
        if (!this.flags.noprompt) {
            const question = await this.ux.confirm(messages.getMessage('questionDeletionPrompt'));
            if (!question) {
                return;
            }
        }
        for (const packageConfig of packageDirectories) {
            const sourcePath = path_1.join(basePath, packageConfig.path, 'main', 'default', 'aura');
            if (fs_extra_1.pathExistsSync(sourcePath)) {
                let noChangedFiles = 0;
                const files = recursiveReaddir(sourcePath);
                files
                    .then(function (result) {
                    const filesFiltered = [];
                    for (const file of result) {
                        if (that.isAuraFile(file)) {
                            filesFiltered.push(file);
                        }
                    }
                    if (filesFiltered.length === 0) {
                        that.ux.log(messages.getMessage('msgNoAuraFilesInPackageDirectories'));
                        resp.message = messages.getMessage('msgNoAuraFilesInPackageDirectories');
                        return resp;
                    }
                    resp.files = [];
                    for (const file of filesFiltered) {
                        let data = fs_extra_1.readFileSync(file, 'utf8');
                        data = data.toString();
                        if (that.isAuraStandardContent(data)) {
                            fs_extra_1.removeSync(file);
                            resp.files.push(file);
                            noChangedFiles++;
                        }
                    }
                })
                    .then(function () {
                    that.ux.log(messages.getMessage('successMessage', [noChangedFiles, packageConfig.path]));
                    resp.message = messages.getMessage('successMessage', [
                        noChangedFiles, packageConfig.path
                    ]);
                    this.ux.log('[DEPRECATED, use mzpr instead of muenzpraeger]');
                    return resp;
                })
                    .catch(function (error) {
                    throw new core_1.SfdxError(error);
                });
            }
        }
    }
}
SourceCleanupAura.description = '[DEPRECATED, use mzpr instead of muenzpraeger] ' + messages.getMessage('commandDescription');
SourceCleanupAura.controller = '({myAction:function(component,event,helper){}})';
SourceCleanupAura.css = '.THIS{}';
SourceCleanupAura.helper = '({helperMethod:function(){}})';
SourceCleanupAura.design = '<design:component></design:component>';
SourceCleanupAura.auradoc = '<aura:documentation><aura:description>Documentation</aura:description><aura:examplename="ExampleName"ref="exampleComponentName"label="Label">ExampleDescription</aura:example></aura:documentation>';
SourceCleanupAura.renderer = '({//Yourrenderermethodoverridesgohere})';
SourceCleanupAura.svg = '<?xmlversion="1.0"encoding="UTF-8"standalone="no"?><svgwidth="120px"height="120px"viewBox="00120120"version="1.1"xmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink"><gstroke="none"stroke-width="1"fill="none"fill-rule="evenodd"><pathd="M120,108C120,114.6114.6,120108,120L12,120C5.4,1200,114.60,108L0,12C0,5.45.4,012,0L108,0C114.6,0120,5.4120,12L120,108L120,108Z"id="Shape"fill="#2A739E"/><pathd="M77.7383308,20L61.1640113,20L44.7300055,63.2000173L56.0543288,63.2000173L40,99.623291L72.7458388,54.5871812L60.907727,54.5871812L77.7383308,20Z"id="Path-1"fill="#FFFFFF"/></g></svg>';
SourceCleanupAura.examples = [
    `$ sfdx muenzpraeger:source:cleanupaura
     Make sure that your git commits are up-to-date before you proceed. Do you want to delete boilerplate Aura related files that have not been modified? (y/N) y
     Reading content of package directories
     36 non-modified boilerplate Aura files have been deleted in package directory 'force-app'.
  `,
    `$ sfdx muenzpraeger:source:cleanupaura -p
     Reading content of package directories
     36 non-modified boilerplate Aura files have been deleted in package directory 'force-app'.
`
];
SourceCleanupAura.flagsConfig = {
    help: command_1.flags.help({ char: 'h' }),
    noprompt: command_1.flags.boolean({
        char: 'p',
        description: messages.getMessage('noPromptDescription')
    })
};
SourceCleanupAura.requiresProject = true;
exports.default = SourceCleanupAura;
//# sourceMappingURL=cleanupaura.js.map
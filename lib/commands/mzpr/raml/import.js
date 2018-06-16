"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const oas_raml_converter_1 = require("oas-raml-converter");
const fs_extra_1 = require("fs-extra");
command_1.core.Messages.importMessagesDirectory(path_1.join(__dirname, '..', '..', '..'));
const messages = command_1.core.Messages.loadMessages('@muenzpraeger/sfdx-plugin', 'ramlImport');
class Import extends command_1.SfdxCommand {
    async run() {
        // tslint:disable-line:no-any
        const resp = {};
        const javaInstalled = await checkJava();
        if (!javaInstalled) {
            throw new core_1.SfdxError(messages.getMessage('errorNoJavaInstallation'));
        }
        if (javaInstalled && !this.flags.apiversion) {
            await this.hubOrg.refreshAuth();
            const conn = this.hubOrg.getConnection();
            if (conn) {
                this.flags.apiversion = conn.getApiVersion();
            }
            else {
                throw new core_1.SfdxError(messages.getMessage('errorNoDevHubConnection'));
            }
        }
        const overwrite = this.flags.force ? '' : '-s';
        const classprefix = this.flags.classPrefix
            ? this.flags.classPrefix
            : 'Raml';
        if (javaInstalled && this.flags.apiversion) {
            let pluginDir = __dirname;
            pluginDir = pluginDir.replace('/lib/commands/mzpr/raml', '');
            const opt = {
                validate: true
            };
            const conv = new oas_raml_converter_1.Converter(oas_raml_converter_1.Formats.RAML, oas_raml_converter_1.Formats.OAS20);
            const output = await conv.convertFile(this.flags.path, opt);
            const tempSwagger = 'swagger.json';
            fs_extra_1.writeFileSync(tempSwagger, output);
            const jarPath = path_1.join(pluginDir, 'resources', 'swagger-codegen-cli.jar');
            let script = `java -jar ${jarPath} generate -i ${tempSwagger} -l apex -o ${this.flags.outputdir} ${overwrite}`;
            if (this.flags.apiVersion) {
                let apiVersion = this.flags.apiversion;
                if (apiVersion.length() < 3) {
                    apiVersion = `${apiVersion}.0`;
                }
                script = `${script} -DapiVersion=${apiVersion}`;
            }
            // script = `${script} --classPrefix=${classprefix}`;
            const swaggerGen = await runSwaggerJar(script);
            fs_extra_1.removeSync('swagger.json');
            if (swaggerGen) {
                this.log(messages.getMessage('successMessage'));
                resp.message = messages.getMessage('successMessage');
            }
            else {
                throw new core_1.SfdxError(messages.getMessage('errorClassGeneration'));
            }
        }
        return resp;
    }
}
Import.description = messages.getMessage('commandDescription');
Import.examples = [
    `$ sfdx mzpr:raml:import -d . -p /Users/muenzpraeger/superapi.raml
  Apex classes have been generated.
  `
];
Import.flagsConfig = {
    help: command_1.flags.help({ char: 'h' }),
    path: command_1.flags.string({
        char: 'p',
        description: messages.getMessage('flagPathDescription'),
        required: true
    }),
    outputdir: command_1.flags.string({
        char: 'd',
        description: messages.getMessage('flagOutputdirDescription'),
        required: true
    }),
    apiversion: command_1.flags.string({
        char: 'a',
        description: messages.getMessage('flagApiversionDescription')
    }),
    classprefix: command_1.flags.string({
        char: 'c',
        description: messages.getMessage('flagClassprefixDescription')
    }),
    force: command_1.flags.boolean({
        char: 'f',
        description: messages.getMessage('flagForceDescription')
    })
};
Import.supportsDevhubUsername = true;
exports.default = Import;
function checkJava() {
    // tslint:disable-line:no-any
    const spawn = require('child_process').spawn('java', ['-version']);
    spawn.on('error', function (err) {
        return false;
    });
    spawn.stderr.on('data', function (data) {
        // tslint:disable-line:no-any
        data = data.toString().split('\n')[0];
        const javaVersion = new RegExp('java version').test(data)
            ? data.split(' ')[2].replace(/"/g, '')
            : false;
        if (javaVersion !== false) {
            return true;
        }
    });
    return true; // TODO - make promisish
}
async function runSwaggerJar(script) {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const { error, stdout, stderr } = await exec(script);
    return true;
}
//# sourceMappingURL=import.js.map
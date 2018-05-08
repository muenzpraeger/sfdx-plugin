import recursiveReaddir = require('recursive-readdir');
import { writeFileSync, readFileSync } from 'fs-extra';
import { flags } from '@oclif/command';
import { join, dirname } from 'path';
import { SfdxCommand, core } from '@salesforce/command';
import { Project, SfdxError, SfdxUtil } from '@salesforce/core';

core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
const messages = core.Messages.loadMessages(
  'muenzpraeger-sfdx-plugin',
  'apexSwaggerGenerate'
);

export default class Import extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx muenzpraeger:apex:swagger:generate -d . -p http://petstore.swagger.io/v2/swagger.json
  Swagger definition file got created.
  `
  ];

  protected static flagsConfig = {
    help: flags.help({ char: 'h' }),
    file: flags.string({
      char: 'f',
      description: messages.getMessage('flagFileDescription'),
      required: true
    }),
    instance: flags.string({
      char: 'i',
      description: messages.getMessage('flagInstanceDescription'),
      required: true
    })
  };

  protected static requiresProject = true;

  public async run(): Promise<any> { // tslint:disable-line:no-any
    interface Response {
      message?: string;
      files?: string[];
    }

    const resp: Response = {};

    const project = await Project.resolve();

    if (!project) {
      throw new SfdxError(messages.getMessage('errorNoSfdxProject'));
    }

    const apiRegex = /@RestResource/g;
    const projectJson = await project.resolveProjectConfig();
    const basePath = this.project.getPath();
    const packageDirectories: any[] = projectJson['packageDirectories']; // tslint:disable-line:no-any
    const that = this;
    for (const packageConfig of packageDirectories) {
      const sourcePath = join(basePath, packageConfig.path);
      this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
      const files = recursiveReaddir(sourcePath);
      files
        .then(function(result: string[]) {
          const filesFiltered: string[] = [];
          for (const file of result) {
            if (file.endsWith('cls')) {
              filesFiltered.push(file);
            }
          }
          if (filesFiltered.length === 0) {
            that.ux.log(
              messages.getMessage('msgNoApexClassesInPackageDirectories')
            );
            resp.message = messages.getMessage(
              'msgNoApexClassesInPackageDirectories'
            );
            return resp;
          }
          resp.files = [];
          for (const file of filesFiltered) {
            let data = readFileSync(file, 'utf8');
            data = data.toString();
            if (data.search(apiRegex) > -1) {
              data = data.replace(apiRegex, apiCurrent);
              writeFileSync(file, data);
              resp.files.push(file);
              noChangedFiles++;
            }
          }
        })
        .then(function() {
          that.ux.log(
            messages.getMessage('successMessage', [
              noChangedFiles,
              that.flags.apiversion
            ])
          );
          resp.message = messages.getMessage('successMessage', [
            noChangedFiles,
            that.flags.apiversion
          ]);
          return resp;
        })
        .catch(function(error) {
          throw new SfdxError(error);
        });
    }
  }
}

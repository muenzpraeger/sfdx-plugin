import recursiveReaddir = require('recursive-readdir');
import { writeFileSync, readFileSync } from 'fs-extra';
import { join } from 'path';
import { SfdxCommand, core, flags } from '@salesforce/command';
import { SfdxError, SfdxUtil, Project } from '@salesforce/core';

core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
const messages = core.Messages.loadMessages(
  '@mzpr/sfdx-plugin',
  'sourceApiSet'
);

export default class SourceApiSet extends SfdxCommand {
  public static description = '[DEPRECATED, use mzpr instead of muenzpraeger] ' + messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx muenzpraeger:source:api:set
    Reading content of package directories
    45 files have been set to API version 42.0.
  `,
    `$ sfdx muenzpraeger:source:api:set -a 41.0
    Reading content of package directories
    45 files have been set to API version 41.0.
  `
  ];

  protected static flagsConfig = {
    help: flags.help({ char: 'h' }),
    apiversion: flags.string({
      char: 'a',
      description: messages.getMessage('flagApiversionDescription')
    })
  };

  protected static supportsDevhubUsername = true;
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

    if (
      this.flags.apiversion &&
      !SfdxUtil.validateApiVersion(this.flags.apiversion)
    ) {
      throw new SfdxError(
        messages.getMessage('errorInvalidApiVersionFormat', [
          this.flags.apiversion
        ])
      );
    }

    if (!this.flags.apiversion) {
      await this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      if (conn) {
        this.flags.apiversion = conn.getApiVersion();
      } else {
        throw new SfdxError(messages.getMessage('errorDevHubConnection'));
      }
    }
    const apiRegex = /<apiVersion>[0-9][0-9]\.0<\/apiVersion>/g;
    const apiCurrent = `<apiVersion>${this.flags.apiversion}</apiVersion>`;
    const projectJson = await project.resolveProjectConfig();
    const basePath = this.project.getPath();
    const packageDirectories: any[] = projectJson['packageDirectories']; // tslint:disable-line:no-any
    const that = this;
    this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
    for (const packageConfig of packageDirectories) {
      let noChangedFiles = 0;
      const sourcePath = join(basePath, packageConfig.path);
      const files = recursiveReaddir(sourcePath);
      files
        .then(function(result: string[]) {
          const filesFiltered: string[] = [];
          for (const file of result) {
            if (file.endsWith('meta.xml')) {
              filesFiltered.push(file);
            }
          }
          if (filesFiltered.length === 0) {
            that.ux.log(
              messages.getMessage('msgNoMetadataInPackageDirectories')
            );
            resp.message = messages.getMessage(
              'msgNoMetadataInPackageDirectories'
            );
            return resp;
          }
          resp.files = [];
          for (const file of filesFiltered) {
            let data = readFileSync(file, 'utf8');
            data = data.toString();
            if (data.search(apiRegex) > 0 && data.search(apiCurrent) === -1) {
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
              that.flags.apiversion,
              packageConfig.path
            ])
          );
          resp.message = messages.getMessage('successMessage', [
            noChangedFiles,
            that.flags.apiversion,
            packageConfig.path
          ]);
          this.ux.log('[DEPRECATED, use mzpr instead of muenzpraeger]');
          return resp;
        })
        .catch(function(error) {
          throw new SfdxError(error);
        });
    }
  }
}

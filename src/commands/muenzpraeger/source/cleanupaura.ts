import recursiveReaddir = require('recursive-readdir');
import { readFileSync, pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { SfdxCommand, flags, core } from '@salesforce/command';
import { SfdxError, SfdxUtil, Project } from '@salesforce/core';

core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
const messages = core.Messages.loadMessages(
  '@muenzpraeger/sfdx-plugin',
  'sourceCleanupAura'
);

export default class SourceCleanupAura extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static controller = '({myAction:function(component,event,helper){}})';
  public static css = '.THIS{}';
  public static helper = '({helperMethod:function(){}})';
  public static design = '<design:component></design:component>';
  public static auradoc =
    '<aura:documentation><aura:description>Documentation</aura:description><aura:examplename="ExampleName"ref="exampleComponentName"label="Label">ExampleDescription</aura:example></aura:documentation>';
  public static renderer = '({//Yourrenderermethodoverridesgohere})';
  public static svg =
    '<?xmlversion="1.0"encoding="UTF-8"standalone="no"?><svgwidth="120px"height="120px"viewBox="00120120"version="1.1"xmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink"><gstroke="none"stroke-width="1"fill="none"fill-rule="evenodd"><pathd="M120,108C120,114.6114.6,120108,120L12,120C5.4,1200,114.60,108L0,12C0,5.45.4,012,0L108,0C114.6,0120,5.4120,12L120,108L120,108Z"id="Shape"fill="#2A739E"/><pathd="M77.7383308,20L61.1640113,20L44.7300055,63.2000173L56.0543288,63.2000173L40,99.623291L72.7458388,54.5871812L60.907727,54.5871812L77.7383308,20Z"id="Path-1"fill="#FFFFFF"/></g></svg>';

  public static examples = [
    `$ sfdx muenzpraeger:source:cleanupaura
     Make sure that your git commits are up-to-date before you proceed. Do you want to delete boilerplate Aura related files that have not been modified? (y/N) y
     Reading content of package directories
     36 non-modified boilerplate Aura files have been deleted.
  `,
    `$ sfdx muenzpraeger:source:cleanupaura -p
     Reading content of package directories
     36 non-modified boilerplate Aura files have been deleted.
`
  ];

  protected static flagsConfig = {
    help: flags.help({ char: 'h' }),
    noprompt: flags.boolean({
      char: 'p',
      description: messages.getMessage('noPromptDescription')
    })
  };

  protected static requiresProject = true;

  public isAuraFile(file: string) {
    if (
      file.endsWith('auradoc') ||
      file.endsWith('css') ||
      file.endsWith('design') ||
      file.endsWith('svg') ||
      file.endsWith('Controller.js') ||
      file.endsWith('Helper.js') ||
      file.endsWith('Renderer.js')
    ) {
      return true;
    }
    return false;
  }

  public isAuraStandardContent(fileContent: string) {
    const regex = /\s/g;
    const data = fileContent.replace(regex, '');
    if (data === SourceCleanupAura.controller) {
      return true;
    } else if (data === SourceCleanupAura.css) {
      return true;
    } else if (data === SourceCleanupAura.helper) {
      return true;
    } else if (data === SourceCleanupAura.design) {
      return true;
    } else if (data === SourceCleanupAura.auradoc) {
      return true;
    } else if (data === SourceCleanupAura.renderer) {
      return true;
    } else if (data === SourceCleanupAura.svg) {
      return true;
    }
    return false;
  }

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

    const projectJson = await project.resolveProjectConfig();
    const basePath = this.project.getPath();
    const packageDirectories: any[] = projectJson['packageDirectories']; // tslint:disable-line:no-any
    const that = this;
    let noChangedFiles = 0;
    this.ux.log(messages.getMessage('msgReadingPackageDirectories'));
    if (!this.flags.noprompt) {
      const question = await this.ux.confirm(
        messages.getMessage('questionDeletionPrompt')
      );
      if (!question) {
        return;
      }
    }
    for (const packageConfig of packageDirectories) {
      const sourcePath = join(
        basePath,
        packageConfig.path,
        'main',
        'default',
        'aura'
      );
      if (pathExistsSync(sourcePath)) {
        const files = recursiveReaddir(sourcePath);
        files
          .then(function(result: string[]) {
            const filesFiltered: string[] = [];
            for (const file of result) {
              if (that.isAuraFile(file)) {
                filesFiltered.push(file);
              }
            }
            if (filesFiltered.length === 0) {
              that.ux.log(
                messages.getMessage('msgNoAuraFilesInPackageDirectories')
              );
              resp.message = messages.getMessage(
                'msgNoAuraFilesInPackageDirectories'
              );
              return resp;
            }
            resp.files = [];
            for (const file of filesFiltered) {
              let data = readFileSync(file, 'utf8');
              data = data.toString();
              if (that.isAuraStandardContent(data)) {
                resp.files.push(file);
                noChangedFiles++;
              }
            }
          })
          .then(function() {
            that.ux.log(
              messages.getMessage('successMessage', [noChangedFiles])
            );
            resp.message = messages.getMessage('successMessage', [
              noChangedFiles
            ]);
            return resp;
          })
          .catch(function(error) {
            throw new SfdxError(error);
          });
      }
    }
  }
}

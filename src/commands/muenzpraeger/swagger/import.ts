import { flags } from '@oclif/command';
import { join, dirname } from 'path';
import { SfdxCommand, core } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';

core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
const messages = core.Messages.loadMessages(
  'sfdx-muenzpraeger-plugin',
  'swagger/import'
);

export default class Import extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx muenzpraeger:swagger:import -d . -p http://petstore.swagger.io/v2/swagger.json
  Apex classes have been generated.
  `
  ];

  protected static flagsConfig = {
    help: flags.help({ char: 'h' }),
    path: flags.string({
      char: 'p',
      description: messages.getMessage('flagPathDescription'),
      required: true
    }),
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('flagOutputdirDescription'),
      required: true
    }),
    apiversion: flags.string({
      char: 'a',
      description:
        messages.getMessage('flagApiversionDescription')
    }),
    classprefix: flags.string({
      char: 'c',
      description: messages.getMessage('flagClassprefixDescription')
    }),
    force: flags.boolean({
      char: 'f',
      description: messages.getMessage('flagForceDescription')
    })
  };

  protected static supportsDevhubUsername = true;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    interface Response {
      message?: string;
    }

    const resp: Response = {};

    const javaInstalled = await checkJava();

    if (!javaInstalled) {
      throw new SfdxError(messages.getMessage('errorNoJavaInstallation'));
    }

    if (javaInstalled && !this.flags.apiversion) {
      await this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      if (conn) {
        this.flags.apiversion = conn.getApiVersion();
      } else {
        throw new SfdxError(messages.getMessage('errorNoDevHubConnection'));
      }
    }

    const overwrite = this.flags.force ? '' : '-s';

    if (javaInstalled && this.flags.apiversion) {
      let pluginDir = __dirname;
      pluginDir = pluginDir.replace('/lib/commands/muenzpraeger/swagger', '');
      const jarPath = join(pluginDir, 'resources', 'swagger-codegen-cli.jar');
      let script = `java -jar ${jarPath} generate -i ${
        this.flags.path
      } -l apex -o ${this.flags.outputdir} ${overwrite}`;
      if (this.flags.apiVersion) {
        let apiVersion = this.flags.apiversion;
        if (apiVersion.length() < 3) {
          apiVersion = `${apiVersion}.0`;
        }
        script = `${script} -DapiVersion=${apiVersion}`;
      }
      if (this.flags.classprefix) {
        script = `${script} --classPrefix=${this.flags.classprefix}`;
      }
      const swaggerGen = await runSwaggerJar(script);
      if (swaggerGen) {
        this.log(messages.getMessage('successMessage'));
        resp.message = messages.getMessage('successMessage');
      } else {
        throw new SfdxError(messages.getMessage('errorClassGeneration'));
      }
    }

    return resp;
  }
}

function checkJava(): any {  // tslint:disable-line:no-any
  const spawn = require('child_process').spawn('java', ['-version']);
  spawn.on('error', function(err: string) {
    return false;
  });
  spawn.stderr.on('data', function(data: any) { // tslint:disable-line:no-any
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

async function runSwaggerJar(script: string): Promise<boolean> {
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  const { error, stdout, stderr } = await exec(script);
  return true;
}

import { join, dirname } from 'path';
import { SfdxCommand, core, flags } from '@salesforce/command';

// core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
// const messages = core.Messages.loadMessages(
//   'sfdx-muenzpraeger-plugin',
//   'swagger/import'
// );

export default class Import extends SfdxCommand {
  public static description = '[DEPRECATED, use mzpr instead of muenzpraeger] ' + 'Auto-generate Apex classes from Swagger/OpenAPI files.';

  public static examples = [
    `$ sfdx muenzpraeger:swagger:import -d . -p http://petstore.swagger.io/v2/swagger.json
  Apex classes have been generated.
  `
  ];

  protected static flagsConfig = {
    help: flags.help({ char: 'h' }),
    path: flags.string({
      char: 'p',
      description: 'URL or local file path for Swagger definition file.',
      required: true
    }),
    outputdir: flags.string({
      char: 'd',
      description: 'local folder for storing the created files.',
      required: true
    }),
    apiversion: flags.string({
      char: 'a',
      description:
        'specify the API version (defaults to API version of your DevHub)'
    }),
    classprefix: flags.string({
      char: 'c',
      description: 'specify a class prefix (defaults to "Swag")'
    }),
    force: flags.boolean({
      char: 'f',
      description: 'overwrites existing files'
    })
  };

  protected static supportsDevhubUsername = true;

  public async run(): Promise<any> {
    // tslint:disable-line:no-any

    interface Response {
      isError?: boolean;
      message?: string;
    }

    const resp: Response = {};

    const javaInstalled = await checkJava();

    if (!javaInstalled) {
      this.ux.error('A Java installation could not be found.');
      resp.isError = true;
      resp.message = 'A Java installation could not be found.';
    }

    if (javaInstalled && !this.flags.apiversion) {
      await this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      if (conn) {
        this.flags.apiversion = conn.getApiVersion();
      } else {
        this.ux.error(
          'Could not connect to the DevHub for fetching the API version.'
        );
        resp.isError = true;
        resp.message =
          'Could not connect to the DevHub for fetching the API version.';
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
        this.log('Apex classes have been generated.');
        resp.isError = false;
        resp.message = 'Apex classes have been generated.';
      } else {
        this.error('An error occured during class generation.');
        resp.isError = true;
        resp.message = 'An error occured during class generation.';
      }
      this.ux.log('[DEPRECATED, use mzpr instead of muenzpraeger]');
    }

    return resp;
  }
}

function checkJava(): any {
  // tslint:disable-line:no-any
  const spawn = require('child_process').spawn('java', ['-version']);
  spawn.on('error', function(err: string) {
    return false;
  });
  spawn.stderr.on('data', function(data: any) {
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

async function runSwaggerJar(script: string): Promise<boolean> {
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  const { error, stdout, stderr } = await exec(script);
  return true;
}

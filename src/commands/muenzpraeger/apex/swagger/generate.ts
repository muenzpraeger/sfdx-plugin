import { flags } from '@oclif/command';
import { join, dirname } from 'path';
import { SfdxCommand, core } from '@salesforce/command';

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

  protected static supportsDevhubUsername = true;
  protected static supportsUsername = true;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    interface Response {
      isError?: boolean;
      message?: string;
    }

    const resp: Response = {};

    return resp;
  }
}

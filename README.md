sfdx-plugin
========================

A plugin for the Salesforce CLI built by René Winkelmeyer.

[![Version](https://img.shields.io/npm/v/muenzpraeger-sfdx-plugin.svg)](https://npmjs.org/package/muenzpraeger-sfdx-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/muenzpraeger-sfdx-plugin.svg)](https://npmjs.org/package/muenzpraeger-sfdx-plugin)
[![License](https://img.shields.io/npm/l/muenzpraeger-sfdx-plugin.svg)](https://github.com/muenzpraeger/sfdx-plugin/blob/master/package.json)


## Installation into the Salesforce CLI

Install the plugin into your Salesforce CLI using this command:

```sh-session
$ sfdx plugins:install muenzpraeger-sfdx-plugin
```

You can check a successful installation with ```sfdx plugins```. Updates are applied when executing ```sfdx plugins:update```.

<!-- install -->
## Commands
<!-- commands -->
* [sfdx muenzpraeger:source:api:set](#sfdx-muenzpraegersourceapiset)
* [sfdx muenzpraeger:swagger:import](#sfdx-muenzpraegerswaggerimport)

## sfdx muenzpraeger:source:api:set

Upgrades the current project and all metadata to the latest API version

```
USAGE
  $ sfdx muenzpraeger:source:api:set

OPTIONS
  -a, --apiversion=apiversion                      specify the API version (defaults to API version of your DevHub)
  -h, --help                                       show CLI help
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  $ sfdx muenzpraeger:source:api:set
       Reading content of package directories
       45 files have been set to API version 42.0.
  

  $ sfdx muenzpraeger:source:api:set -a 41.0
       Reading content of package directories
       45 files have been set to API version 41.0.
```

_See code: [src/commands/muenzpraeger/source/api/set.ts](https://github.com/muenzpraeger/sfdx-plugin/blob/v0.2.0/src/commands/muenzpraeger/source/api/set.ts)_

## sfdx muenzpraeger:swagger:import

Auto-generate Apex classes from Swagger/OpenAPI files.

```
USAGE
  $ sfdx muenzpraeger:swagger:import

OPTIONS
  -a, --apiversion=apiversion                      specify the API version (defaults to API version of your DevHub)
  -c, --classprefix=classprefix                    specify a class prefix (defaults to "Swag")
  -d, --outputdir=outputdir                        (required) local folder for storing the created files.
  -f, --force                                      overwrites existing files
  -h, --help                                       show CLI help
  -p, --path=path                                  (required) URL or local file path for Swagger definition file.
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLE
  $ sfdx muenzpraeger:swagger:import -d . -p http://petstore.swagger.io/v2/swagger.json
     Apex classes have been generated.
```

_See code: [src/commands/muenzpraeger/swagger/import.ts](https://github.com/muenzpraeger/sfdx-plugin/blob/v0.2.0/src/commands/muenzpraeger/swagger/import.ts)_
<!-- commandsstop -->

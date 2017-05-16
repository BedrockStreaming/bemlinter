#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const minimist = require('minimist');

const lintCommand = require('./command/lint');
const statusCommand = require('./command/status');

function usage() {
  console.log('Usage: bemlinter <command> [options]');
  console.log();
  console.log('Command list: ');
  console.log('  - lint: lint bem component isolation');
  console.log();
  process.exit(1);
}

function getConfigData(argv) {
  return new Promise((resolve) => {
    if (!argv.config) {
      const sources = argv._;
      resolve({
        sources,
        userOptions: {},
        argv: _.omit(argv, '_')
      });
    }

    fs.readFile(argv.config, { encoding: 'utf8' })
      .then(data => JSON.parse(data))
      .then((userConfig) => {
        const basePath = path.dirname(argv.config);
        const config = userConfig;
        config.excludePath = (userConfig.excludePath || [])
          .map(filePath => `!${path.resolve(basePath, filePath)}`);
        config.sources = userConfig.sources
          .map(filePath => path.resolve(basePath, filePath))
          .concat(userConfig.excludePath);

        resolve({
          sources: config.sources,
          userOptions: _.omit(config, 'sources', 'excludePath'),
          argv: _.omit(argv, 'config')
        });
      })
      .catch(console.error);
  });
}

// Main
const argv = minimist(process.argv.slice(2));
const command = argv._.shift() || '';

switch (command) {
  case 'lint':
    getConfigData(argv)
      .then(lintCommand);
    break;

  case 'status':
    getConfigData(argv)
      .then(statusCommand);
    break;

  default:
    console.log(`Unknown command "${command}"`);
    console.log();
    usage();
}


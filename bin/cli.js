#!/usr/bin/env node

const lintCommand = require('./command/lint');
const minimist = require('minimist');

// Main
const argv = minimist(process.argv.slice(2));
const command = argv._.shift() || '';

switch (command) {
  case 'lint':
    lintCommand(argv);
    break;
  default:
    console.log(`Unknown command "${command}"`);
    console.log();
    usage();
}

function usage() {
  console.log('Usage: bemlinter <command> [options]');
  console.log();
  console.log('Command list: ');
  console.log('  - lint: lint bem component isolation');
  console.log();
  process.exit(1);
}


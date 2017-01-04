#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const minimist = require('minimist');
const bemlinter = require('./bemlinter');

// Output
function getContextualMessage(message, filePath, node) {
  const contextualMessage = [];
  if (filePath) {
    contextualMessage.push(`[${path.basename(filePath)}`);
    if (node) {
      contextualMessage.push(`:${node.start.line}`);
    }
    contextualMessage.push('] ');
  }
  contextualMessage.push(message);

  return contextualMessage.join('');
}

function outputWarning({message, filePath, node}) {
  console.warn(getContextualMessage(`Warning: ${message}`, filePath, node));
}

function outputError({message, filePath, node}) {
  console.error(getContextualMessage(`Error: ${message}`, filePath, node));
}

function outputStatus(blockName, fileStatus) {
  console.log(colors[fileStatus ? 'green' : 'red'](`  ${fileStatus ? '✓' : '✗'} ${blockName}`));
}

// Main
const argv = minimist(process.argv.slice(2));
const defaultConfig = {
  sources: argv._,
  excludeComponent: []
};

new Promise(resolve => {
  if (!argv.config) {
    resolve(defaultConfig);
  }
  fs.readFile(argv.config, {encoding:'utf8'})
    .then(data => JSON.parse(data))
    .then(config => {
      config.excludeComponent = config.excludeComponent.map(path => `**/${path}.scss`);
      resolve(config);
    })
  ;
})
.then(config => {
  if (config.sources.length < 1) {
    console.log('Usage: ./index.js <scss-file> [<scss-file> ...]');
    process.exit(1);
  }

  return bemlinter(config.sources, config.excludeComponent)
})
.then(logs => {
  let nbBlock = 0;
  let nbBlockKO = 0;
  _.forIn(logs, (blockLogs, blockName) => {
    nbBlock++;
    outputStatus(blockName, !blockLogs.error);
    if (blockLogs.error) {
      nbBlockKO++;
      blockLogs.error.forEach(outputError);
    }
    if (blockLogs.warning) {
      blockLogs.warning.forEach(outputWarning);
    }
  });

  console.log('');
  if (nbBlockKO) {
    console.log(`FAILED: ${nbBlockKO} on ${nbBlock} components lint on error.`);
    process.exit(1);
  }
  console.log(`OK: ${nbBlock} components tested.`);
  process.exit(0);
})
.catch(console.error);

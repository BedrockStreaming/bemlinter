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
  ignore: []
};

new Promise(resolve => {
  if (!argv.config) {
    resolve(defaultConfig);
  }
  fs.readFile(argv.config, {encoding:'utf8'})
    .then(data => JSON.parse(data))
    .then(config => {
      config.sources = config.sources.map(source => source.concat('.scss'));
      config.ignore = config.ignore.map(path => `**/${path}.scss`);
      resolve(config);
    })
  ;
})
.then(config => {
  if (config.sources.length < 1) {
    console.log('Usage: ./index.js <scss-file> [<scss-file> ...]');
    process.exit(1);
  }

  return bemlinter(config)
})
.then(logs => {
  let status = 0;
  console.log({logs});
  _.forIn(logs, (blockLogs, blockName) => {
    if (blockLogs.error.length) status = 1;
    outputStatus(blockName, !blockLogs.error.length);
    blockLogs.error.forEach(outputError);
    blockLogs.warning.forEach(outputWarning);
  });
  process.exit(status);
})
.catch(console.error);

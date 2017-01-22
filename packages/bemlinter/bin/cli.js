#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const minimist = require('minimist');
const bemlinter = require('./../src/bemlinter');

// Output
function getContextualMessage(message, filePath, line) {
  const contextualMessage = [];
  if (filePath) {
    contextualMessage.push(`[${path.basename(filePath)}`);
    if (line) {
      contextualMessage.push(`:${line}`);
    }
    contextualMessage.push('] ');
  }
  contextualMessage.push(message);

  return contextualMessage.join('');
}

function outputWarning({message, filePath, line}) {
  console.warn(getContextualMessage(`Warning: ${message}`, filePath, line));
}

function outputError({message, filePath, line}) {
  console.error(getContextualMessage(`Error: ${message}`, filePath, line));
}

function outputStatus(blockName, fileStatus) {
  console.log(colors[fileStatus ? 'green' : 'red'](`  ${fileStatus ? '✓' : '✗'} ${blockName}`));
}

// Main
const argv = minimist(process.argv.slice(2));
const defaultConfig = {
  sources: argv._,
  excludePath: [],
  excludeComponent: [],
  checkLowerCase: true,
  prefix: ['']
};

new Promise(resolve => {
  if (!argv.config) {
    resolve(defaultConfig);
  }
  fs.readFile(argv.config, {encoding:'utf8'})
    .then(data => JSON.parse(data))
    .then(config => {
      config.excludePath = (config.excludePath || [])
        .map(filePath => `!${path.resolve(filePath)}`);
      config.sources = config.sources
        .map(filePath => path.resolve(filePath))
        .concat(config.excludePath)
      ;
      config.excludeComponent = (config.excludeComponent || [])
        .map(component => `**/${component}.scss`);
      resolve({
        sources: config.sources,
        options: _.omit(config, 'sources')
      });
    })
    .catch(console.error)
  ;
})
.then(config => {
  if (config.sources.length < 1) {
    console.log('Usage: ./index.js <scss-file> [<scss-file> ...]');
    process.exit(1);
  }

  return bemlinter(config.sources, config.options);
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
    console.log(`FAILED: ${nbBlockKO} on ${nbBlock} components with lint on error.`);
    process.exit(1);
  }
  console.log(`OK: ${nbBlock} components tested.`);
  process.exit(0);
})
.catch(console.error);

#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const minimist = require('minimist');
const paramCase = require('param-case');
const createQueryAst = require('query-ast');

let status = 0;

// Utils
const each = (wrapper, fn) => {
  for (let n of wrapper.nodes) { fn(n) }
};

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

function outputWarning(message, filePath, node) {
  console.warn(getContextualMessage(`Warning: ${message}`, filePath, node));
}

function outputError(message, filePath, node) {
  console.error(getContextualMessage(`Error: ${message}`, filePath, node));
  status = 1;
}

function outputStatus(blockName, fileStatus) {
  console.log(colors[fileStatus ? 'green' : 'red'](`  ${fileStatus ? '✓' : '✗'} ${blockName}`));
}

// BemLinter core
function getBlockName(filePath) {
  const fileName = path.basename(filePath);
  return paramCase(fileName.slice(0, fileName.length - 4));
}

function isBlockWithAPseudoClass($wrapper) {
  return $wrapper.parent().next().get(0).type === 'pseudo_class';
}

function isBlockName(className, blockName) {
  return (
    className === blockName ||
    _.startsWith(className, `${blockName}--`) ||
    _.startsWith(className, `${blockName}__`)
  );
}

function isBlockNameOneOf(className, blockList, authorizedBlockName) {
  return _.some(blockList, blockName => blockName !== authorizedBlockName && isBlockName(className, blockName));
}

function checkInternalClassName($, filePath, blockName) {
  return $('class').find('identifier').reduce((fileStatus, wrapper) => {
    const className = wrapper.node.value;
    if (!isBlockName(className, blockName)) {
      outputError(`".${className}" is incoherent with the file name.`, filePath, wrapper.node);
      return false;
    }
    
    return fileStatus;
  }, true);
}

function checkExternalClassName($, filePath, blockList, blockName) {
  return $('class').find('identifier').reduce((fileStatus, wrapper) => {
    const className = wrapper.node.value;
    if (isBlockNameOneOf(className, blockList, blockName)) {
      if (isBlockWithAPseudoClass($(wrapper))) {
        outputWarning(`".${className}" is tolerated in this stylesheet.`, filePath, wrapper.node);
      } else {
        outputError(`".${className}" should not be style outside of his own stylesheet.`, filePath, wrapper.node);
        return false;
      }
    }
    
    return fileStatus;
  }, true);
}

function bemLintFile(filePath, blockList) {
  return fs.readFile(filePath, {encoding:'utf8'})
    .then(data => {
      const ast = parse(data);
      const $ = createQueryAst(ast);
      const blockName = getBlockName(filePath);
      let fileStatus;
      
      if (blockList.indexOf(blockName) !== -1) {
        fileStatus = checkInternalClassName($, filePath, blockName);
      } else {
        fileStatus = checkExternalClassName($, filePath, blockList, blockName);
      }
      
      outputStatus(blockName, fileStatus);
    })
    .catch(message => outputError(message, filePath))
  ;
}

function bemLint(config) {
  blockList = globby.sync(config.sources, {
    ignore: config.ignore
  }).map(getBlockName);
  filePathList = globby.sync(config.sources);
  return Promise.all(filePathList.map(filePath => bemLintFile(filePath, blockList)))
    .then(() => {
      process.exit(status);
    })
  ;
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
  
  bemLint(config);
})
.catch(console.error);

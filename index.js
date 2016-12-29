#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const globby = require('globby');
const {parse} = require('scss-parser');
const minimist = require('minimist');
const paramCase = require('param-case');
const createQueryAst = require('query-ast');

let status = 0;

const each = (wrapper, fn) => {
  for (let n of wrapper.nodes) { fn(n) }
};

function getBlockName(filePath) {
  const fileName = path.basename(filePath);
  return paramCase(fileName.slice(0, fileName.length - 4));
}

function outputError(message, filePath, node) {
  const error = [];
  if (filePath) {
    error.push(`[${path.basename(filePath)}`);
    if (node) {
      error.push(`:${node.start.line}`);
    }
    error.push('] ');
  }
  error.push(message);
  
  console.error(error.join(''));
  status = 1;
}

function isBlockNameOneOf(className, blockList, authorizedBlockName) {
  return _.some(blockList, blockName => blockName !== authorizedBlockName && isBlockName(className, blockName));
}

function isBlockName(className, blockName) {
  return (
    className === blockName ||
    _.startsWith(className, `${blockName}--`) ||
    _.startsWith(className, `${blockName}__`)
  );
}

function checkExternalClassName($, filePath, blockList) {
  each($('class').find('identifier'), wrapper => {
    const className = wrapper.node.value;
    if (isBlockNameOneOf(className, blockList)) {
      outputError(`'.${className}' should not be style in an external file.`, filePath, wrapper.node);
    }
  });
}

function checkInternalClassName($, filePath, blockName) {
  each($('class').find('identifier'), wrapper => {
    const className = wrapper.node.value;
    if (!isBlockName(className, blockName)) {
      outputError(`'.${className}' is incoherent with the file name.`, filePath, wrapper.node);
    }
  });
}

function bemLintFile(filePath, blockList) {
  
  return fs.readFile(filePath, {encoding:'utf8'})
    .then(data => {
      const ast = parse(data);
      const $ = createQueryAst(ast);
      const blockName = getBlockName(filePath);
      if (blockList.indexOf(blockName) !== -1) {
        console.log(filePath);
        checkInternalClassName($, filePath, blockName);
      } else {
        checkExternalClassName($, filePath, blockList, blockName);
      }
    })
    .catch(message => outputError(message, filePath))
  ;
}

function bemLint(config) {
  blockList = globby.sync(config.sources, {ignore: _.map(config.ignore, path => `**/${path}`)}).map(getBlockName);
  filePathList = globby.sync(config.sources);
  return Promise.all(_.map(filePathList, filePath => bemLintFile(filePath, blockList)))
    .then(() => {
      console.log({status});
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
    .then(resolve)
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

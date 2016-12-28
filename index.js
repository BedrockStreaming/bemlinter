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

function getValueList($) {
  return _.reduce($.get(), (result, node) => [...result, node.value], []);
}

function getClassName($) {
  return getValueList($('class').find('identifier'));
}

function error(message) {
  console.error(message);
  status = 1;
}

function isValidBlockName(className, blockName) {
  return (
    className === blockName ||
    _.startsWith(className, `${blockName}--`) ||
    _.startsWith(className, `${blockName}__`)
  );
}

function checkInternalClassName(fileName, blockName, $) {
  _.each(getClassName($), className => {
    if (!isValidBlockName(className, blockName)) {
      error(`[${fileName}] '${className}' has an incorrect block name.`);
    }
  });
}

function bemLintFile(filePath) {
  console.log(filePath);
  
  return fs.readFile(filePath, {encoding:'utf8'})
    .then(data => {
      const ast = parse(data);
      const $ = createQueryAst(ast);
      const fileName = path.basename(filePath);
      const blockName = paramCase(fileName.slice(0, fileName.length - 4));
      checkInternalClassName(fileName, blockName, $);
    })
  ;
}

function bemLint(config) {
  filePathList = globby.sync(config.sources, {ignore: _.map(config.ignore, path => `**/${path}`)});
  return Promise.all(_.map(filePathList, filePath => bemLintFile(filePath)))
    .then(() => {
      
      // FIXME
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
  resolve(fs.readFile(argv.config, {encoding:'utf8'})
    .then(data => JSON.parse(data))
  );
})
.then(config => {
  if (config.sources.length < 1) {
    console.log('Usage: ./index.js <scss-file> [<scss-file> ...]');
    process.exit(1);
  }
  
  bemLint(config);
})
.catch(error => console.error(error));

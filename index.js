#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const {parse} = require('scss-parser');
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

function bemLint(filePathList) {
  Promise.all(_.map(filePathList, filePath => bemLintFile(filePath)))
    .then(() => {
      process.exit(status);
    })
  ;
}

// Main
const {argv} = process;
if (argv.length < 3) {
  console.log('Usage: ./index.js <scss-file> [<scss-file> ...]');
  process.exit(1);
}
bemLint(argv.slice(2));

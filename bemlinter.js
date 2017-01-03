#!/usr/bin/env node

const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const paramCase = require('param-case');
const createQueryAst = require('query-ast');

// Utils
function getBlockNameFromFile(filePath) {
  const fileName = path.basename(filePath);
  return paramCase(fileName.slice(0, fileName.length - 4));
}

function getBlockNameFromClass(className) {
  if (className.indexOf('__') != -1) {
    return className.slice(0, className.indexOf('__'));
  }
  if (className.indexOf('--') != -1) {
    return className.slice(0, className.indexOf('--'));
  }
  return className;
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

// Checker
function checkInternalClassName($, filePath, blockName) {
  return $('class').find('identifier').reduce((fileLogs, wrapper) => {
    const className = wrapper.node.value;
    if (!isBlockName(className, blockName)) {
      fileLogs.push({
        type: 'error',
        message: `".${className}" is incoherent with the file name.`,
        filePath,
        blockName,
        node: wrapper.node
      });
    }
    
    return fileLogs;
  }, []);
}

function checkExternalClassName($, filePath, blockList, authorizedBlockName) {
  return $('class').find('identifier').reduce((fileLogs, wrapper) => {
    const className = wrapper.node.value;
    if (isBlockNameOneOf(className, blockList, authorizedBlockName)) {
      if (isBlockWithAPseudoClass($(wrapper))) {
        fileLogs.push({
          type: 'warning',
          message: `".${className}" is tolerated in this stylesheet.`,
          filePath,
          blockName: getBlockNameFromClass(className),
          node: wrapper.node
        });
      } else {
        fileLogs.push({
          type: 'error',
          message: `".${className}" should not be style outside of his own stylesheet.`,
          filePath,
          blockName: getBlockNameFromClass(className),
          node: wrapper.node
        });
      }
    }
    
    return fileLogs;
  }, []);
}

// Main
function bemLintFile(filePath, blockList) {
  return fs.readFile(filePath, {encoding:'utf8'})
    .then(data => {
      const ast = parse(data);
      const $ = createQueryAst(ast);
      const blockName = getBlockNameFromFile(filePath);
      let fileLogs;
      
      if (blockList.indexOf(blockName) !== -1) {
        fileLogs = checkInternalClassName($, filePath, blockName);
      } else {
        fileLogs = checkExternalClassName($, filePath, blockList, blockName);
      }

      //console.log({fileStatus});
      return fileLogs;
    })
    .catch(error => console.error(error))
  ;
}

module.exports = config => {
  const blockList = globby.sync(config.sources, {
    ignore: config.ignore
  }).map(getBlockNameFromFile);
  const filePathList = globby.sync(config.sources);
  return Promise.all(filePathList.map(filePath => bemLintFile(filePath, blockList)))
    .then(fileLogs => {
      return _.mapValues(
        _.groupBy(_.flatten(fileLogs), 'blockName'),
        blockLog => _.groupBy(blockLog, 'type')
      );
    })
  ;
};

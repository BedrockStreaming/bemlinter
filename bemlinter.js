const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const paramCase = require('param-case');
const createQueryAst = require('query-ast');


// LOGS
const logs = [];

function addLog(type, message, filePath, blockName, wrapper) {
  logs.push({
    type,
    message,
    filePath,
    blockName,
    line: wrapper ? wrapper.node.start.line : null
  });
}

function addInfo(message, filePath, blockName, wrapper) {
  addLog('info', message, filePath, blockName, wrapper);
}

function addError(message, filePath, blockName, wrapper) {
  addLog('error', message, filePath, blockName, wrapper);
}

function addWarning(message, filePath, blockName, wrapper) {
  addLog('warning', message, filePath, blockName, wrapper);
}

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
      addError(`".${className}" is incoherent with the file name.`, filePath, blockName, wrapper);
    }
    
    return fileLogs;
  }, []);
}

function checkExternalClassName($, filePath, blockList, authorizedBlockName) {
  return $('class').find('identifier').reduce((fileLogs, wrapper) => {
    const className = wrapper.node.value;
    if (isBlockNameOneOf(className, blockList, authorizedBlockName)) {
      const blockName = getBlockNameFromClass(className);
      if (isBlockWithAPseudoClass($(wrapper))) {
        addWarning(`".${className}" is tolerated in this stylesheet.`, filePath, blockName, wrapper);
      } else {
        addError(`".${className}" should not be style outside of his own stylesheet.`, filePath, blockName, wrapper);
      }
    }
    
    return fileLogs;
  }, []);
}

// Main
function bemLintFile(filePath, blockList) {
  const blockName = getBlockNameFromFile(filePath);
  
  return fs.readFile(filePath, {encoding:'utf8'})
    .then(data => {
      const ast = parse(data);
      const $ = createQueryAst(ast);
      
      if (blockList.indexOf(blockName) !== -1) {
        checkInternalClassName($, filePath, blockName);
      }
      checkExternalClassName($, filePath, blockList, blockName);
      addInfo('Linting finish', filePath, blockName);
    })
    .catch(error => {
      addError('Impossible to parse source file', filePath, blockName);
      console.error(error);
    })
  ;
}

module.exports = (sources, excludeComponent) => {
  const blockList = globby.sync(sources, {
    ignore: excludeComponent
  }).map(getBlockNameFromFile);
  const filePathList = globby.sync(sources);
  
  return Promise.all(filePathList.map(filePath => bemLintFile(filePath, blockList)))
    .then(() => {
      return _.mapValues(
        _.groupBy(_.flatten(logs), 'blockName'),
        blockLog => _.groupBy(blockLog, 'type')
      );
    })
  ;
};

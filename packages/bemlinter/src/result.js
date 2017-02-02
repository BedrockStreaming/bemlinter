const _ = require('lodash');
const path = require('path');

module.exports = function () {
  const blockList = [];
  const errorList = [];
  const warningList = [];
  const basePath = process.cwd();
  
  // Utils
  function formatLog(blockName, message, filePath, wrapper) {
    return {
      message,
      filePath: `./${path.relative(basePath, filePath)}`,
      blockName,
      line: wrapper ? wrapper.node.start.line : null
    };
  }
  
  // Setter
  function addBlock(blockName) {
    if (blockList.indexOf(blockName) === -1) {
      blockList.push(blockName);
    }
  }

  function addError(message, filePath, blockName, wrapper) {
    errorList.push(formatLog(blockName, message, filePath, wrapper));
  }

  function addWarning(message, filePath, blockName, wrapper) {
    warningList.push(formatLog(blockName, message, filePath, wrapper));
  }

  // Getter
  function getBlockList() {
    return blockList.sort();
  }
  
  function getBlockListWithError() {
    return _.filter(getBlockList(), hasError);
  }

  function getErrorList(blockName = false) {
    if (!blockName) {
      return errorList;
    }
    return _.filter(errorList, {blockName});
  }

  function getWarningList(blockName = false) {
    if (!blockName) {
      return warningList;
    }
    return _.filter(warningList, {blockName});
  }
  
  function hasError(blockName = false) {
    return !getStatus(blockName);
  }
  
  function getStatus(blockName = false) {
    if (!blockName) {
      return !errorList.length;
    }
    return !_.find(errorList, {blockName});
  }
  
  return {addBlock, addError, addWarning, getBlockList, getBlockListWithError, getErrorList, getWarningList, hasError, getStatus};
};
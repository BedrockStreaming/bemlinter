const _ = require('lodash');
const path = require('path');
const createSnapshot = require('./snapshot');

module.exports = function () {
  const blockList = [];
  const errorList = [];
  const warningList = [];
  const basePath = process.cwd();

  // Utils
  function formatLog(moduleName, blockName, message, filePath, wrapper) {
    return {
      message,
      filePath: `./${path.relative(basePath, filePath)}`,
      moduleName,
      blockName,
      line: wrapper ? wrapper.node.start.line : null
    };
  }

  // Setter
  function addBlock(moduleName, blockName) {
    blockList.push({moduleName, blockName});
  }

  function addError(message, filePath, moduleName, blockName, wrapper) {
    errorList.push(formatLog(moduleName, blockName, message, filePath, wrapper));
  }

  function addWarning(message, filePath, moduleName, blockName, wrapper) {
    warningList.push(formatLog(moduleName, blockName, message, filePath, wrapper));
  }

  // Getter
  function getModuleList() {
    return _.uniq(_.map(blockList, 'moduleName')).sort();
  }

  function getBlockList(moduleName = false) {
    if (!moduleName) {
      return _.map(blockList, 'blockName');
    }
    return _.map(_.filter(blockList, {moduleName}), 'blockName').sort();
  }

  function getErrorList(moduleName = false, blockName = false) {
    if (!moduleName) {
      return errorList;
    }
    if (!blockName) {
      return _.filter(errorList, {moduleName});
    }
    return _.filter(errorList, {moduleName, blockName});
  }

  function getWarningList(moduleName = false, blockName = false) {
    if (!moduleName) {
      return warningList;
    }
    if (!blockName) {
      return _.filter(warningList, {moduleName});
    }
    return _.filter(warningList, {moduleName, blockName});
  }

  function hasError(moduleName = false, blockName = false) {
    return !getStatus(moduleName, blockName);
  }

  function getStatus(moduleName = false, blockName = false) {
    return !getErrorList(moduleName, blockName).length;
  }

  function getSnapshot() {
    return createSnapshot(this);
  }

  return {
    addBlock, addError, addWarning,
    getModuleList, getBlockList, getErrorList, getWarningList, hasError, getStatus, getSnapshot};
};

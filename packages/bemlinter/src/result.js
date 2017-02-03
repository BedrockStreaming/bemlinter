const _ = require('lodash');
const path = require('path');

module.exports = function () {
  const blockList = [];
  const errorList = [];
  const warningList = [];
  const basePath = process.cwd();
  
  // Utils
  function formatLog(projectName, blockName, message, filePath, wrapper) {
    return {
      message,
      filePath: `./${path.relative(basePath, filePath)}`,
      projectName,
      blockName,
      line: wrapper ? wrapper.node.start.line : null
    };
  }
  
  // Setter
  function addBlock(projectName, blockName) {
    blockList.push({projectName, blockName});
  }

  function addError(message, filePath, projectName, blockName, wrapper) {
    errorList.push(formatLog(projectName, blockName, message, filePath, wrapper));
  }

  function addWarning(message, filePath, projectName, blockName, wrapper) {
    warningList.push(formatLog(projectName, blockName, message, filePath, wrapper));
  }

  // Getter
  function getProjectList() {
    return _.uniq(_.map(blockList, 'projectName')).sort();
  }
  
  function getBlockList(projectName = false) {
    if (!projectName) {
      return _.map(blockList, 'blockName');
    }
    return _.map(_.filter(blockList, {projectName}), 'blockName').sort();
  }

  function getErrorList(projectName = false, blockName = false) {
    if (!projectName) {
      return errorList;
    }
    if (!blockName) {
      return _.filter(errorList, {projectName});
    }
    return _.filter(errorList, {projectName, blockName});
  }

  function getWarningList(projectName = false, blockName = false) {
    if (!projectName) {
      return warningList;
    }
    if (!blockName) {
      return _.filter(warningList, {projectName});
    }
    return _.filter(warningList, {projectName, blockName});
  }
  
  function hasError(projectName = false, blockName = false) {
    return !getStatus(projectName, blockName);
  }
  
  function getStatus(projectName = false, blockName = false) {
    return !getErrorList(projectName, blockName).length;
  }
  
  return {
    addBlock, addError, addWarning,
    getProjectList, getBlockList, getErrorList, getWarningList, hasError, getStatus};
};
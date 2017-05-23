const _ = require('lodash');
const path = require('path');
const { createLintResult } = require('./snapshot');

function createResult() {
  const blockList = [];
  let errorList = [];
  let warningList = [];
  let snapshot = null;
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
    if (!_.some(blockList, { moduleName, blockName })) {
      blockList.push({ moduleName, blockName });
    }
  }

  function addError(message, filePath, moduleName, blockName, wrapper) {
    errorList.push(formatLog(moduleName, blockName, message, filePath, wrapper));
  }

  function addWarning(message, filePath, moduleName, blockName, wrapper) {
    warningList.push(formatLog(moduleName, blockName, message, filePath, wrapper));
  }

  function addSnapshot(filePath) {
    snapshot = createLintResult(this, filePath);
    errorList = snapshot.result.errorList;
    warningList = snapshot.result.warningList;
  }

  // Getter
  function hasSnapshot() {
    return snapshot !== null;
  }

  function getSnapshot() {
    return snapshot;
  }

  function getModuleList() {
    return _.uniq(_.map(blockList, 'moduleName')).sort();
  }

  function getBlockList(moduleName = false) {
    if (!moduleName) {
      return _.map(blockList, 'blockName');
    }
    return _.map(_.filter(blockList, { moduleName }), 'blockName').sort();
  }

  function getErrorList(moduleName = false, blockName = false) {
    if (!moduleName) {
      return errorList;
    }
    if (!blockName) {
      return _.filter(errorList, { moduleName });
    }
    return _.filter(errorList, { moduleName, blockName });
  }

  function getWarningList(moduleName = false, blockName = false) {
    if (!moduleName) {
      return warningList;
    }
    if (!blockName) {
      return _.filter(warningList, { moduleName });
    }
    return _.filter(warningList, { moduleName, blockName });
  }

  function getStatus(moduleName = false, blockName = false) {
    if (hasSnapshot()) {
      return snapshot.getStatus(moduleName, blockName);
    }
    return !getErrorList(moduleName, blockName).length;
  }

  function getLabel(moduleName = false, blockName = false) {
    const errorCount = getErrorList(moduleName, blockName).length;
    const warningCount = getWarningList(moduleName, blockName).length;
    const blockCount = getBlockList(moduleName).length;
    const label = [];

    if (errorCount) {
      label.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
    } else {
      label.push('no error');
    }
    if (warningCount) {
      label.push(`and ${warningCount} warning${warningCount > 1 ? 's' : ''}`);
    }
    if (blockName === false) {
      label.push(`on ${blockCount} block${blockCount > 1 ? 's' : ''}`);
    } else {
      label.push(`on the block named "${blockName}"`);
    }

    return label.join(' ');
  }

  function hasError(moduleName = false, blockName = false) {
    return !getStatus(moduleName, blockName);
  }

  return {
    addBlock,
    addError,
    addWarning,
    addSnapshot,
    getModuleList,
    getBlockList,
    getErrorList,
    getWarningList,
    hasError,
    getStatus,
    getLabel,
    hasSnapshot,
    getSnapshot
  };
}

module.exports = createResult;

const _ = require('lodash');

function createLog(logs) {
  function getFilterCriteria(moduleName, blockName) {
    const criteria = {};
    if (moduleName) {
      criteria.moduleName = moduleName;
      if (blockName) {
        criteria.blockName = blockName;
      }
    }

    return criteria;
  }

  function getErrorList(moduleName = false, blockName = false) {
    return _.filter(logs.errorList, getFilterCriteria(moduleName, blockName));
  }

  function getWarningList(moduleName = false, blockName = false) {
    return _.filter(logs.warningList, getFilterCriteria(moduleName, blockName));
  }

  function getStatus(moduleName = false, blockName = false) {
    return !getErrorList(moduleName, blockName).length;
  }

  function hasError(moduleName = false, blockName = false) {
    return !getStatus(moduleName, blockName);
  }

  return { getErrorList, getWarningList, hasError, getStatus };
}

module.exports = createLog;
